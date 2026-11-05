import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { createClient } from "@supabase/supabase-js";
import {
  getCategories, browseListings, getListing, getMyListings, createListing,
  updateOwnListing, archiveOwnListing, getMyProfile, updateMyProfile,
  getFavorites, saveFavorite, removeFavorite,
} from "../../src/lib/supabase/marketplace.ts";

// No remote URL or credential override: these destructive fixtures are LOCAL ONLY.
const status = spawnSync("npx", ["--yes", "supabase@3.0.0", "status", "-o", "json"], { encoding: "utf8" });
if (status.error) throw status.error;
assert.equal(status.status, 0, "Start local Supabase with npm run db:start first.");
const settings = JSON.parse(status.stdout);
assert.equal(settings.API_URL, "http://127.0.0.1:54321", "Refusing to run against an unexpected API URL.");
assert.ok(settings.ANON_KEY && settings.SERVICE_ROLE_KEY, "Local test keys are required.");
const client = (key = settings.ANON_KEY) => createClient(settings.API_URL, key, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
const admin = client(settings.SERVICE_ROLE_KEY);
const suffix = randomUUID();
const userIds = [];
const listingIds = [];

function ok(result) {
  if (result.error) throw result.error;
  return result.data;
}
async function member(name) {
  const email = `${name}-${suffix}@gmu.edu`;
  const password = randomUUID() + "aA1!";
  const { user } = ok(await admin.auth.admin.createUser({ email, password, email_confirm: true }));
  userIds.push(user.id);
  const authenticated = client();
  ok(await authenticated.auth.signInWithPassword({ email, password }));
  return { client: authenticated, id: user.id };
}

await test("local Supabase marketplace integration", async (t) => {
  t.after(async () => {
    if (listingIds.length) ok(await admin.from("listings").delete().in("id", listingIds));
    for (const id of userIds) ok(await admin.auth.admin.deleteUser(id));
  });
  const seller = await member("seller");
  const buyer = await member("buyer");
  const anonymous = client();
  let draft;
  let published;

  await t.test("public signup rejects non-GMU domains", async () => {
    for (const domain of ["example.com", "sub.gmu.edu", "gmu.edu.evil.com"]) {
      const { error } = await anonymous.auth.signInWithOtp({ email: `denied-${suffix}@${domain}` });
      assert.ok(error, `${domain} signup must fail`);
      assert.match(error.message, /gmu.edu/i);
    }
  });

  await t.test("GMU email OTP is delivered locally and must be verified", async () => {
    const email = `otp-${suffix}@gmu.edu`;
    const otpClient = client();
    const signup = ok(await otpClient.auth.signInWithOtp({ email }));
    assert.equal(signup.session, null);
    // Track the unconfirmed user for cleanup even if verification fails later.
    const { users } = ok(await admin.auth.admin.listUsers({ perPage: 1000 }));
    const pending = users.find((user) => user.email === email);
    assert.ok(pending);
    userIds.push(pending.id);
    assert.equal(pending.email_confirmed_at, undefined);
    let token;
    // Auth can become healthy before its template loader reaches the mail server.
    // Wait for a real code email, bounded to 30 seconds; never accept fallback links.
    for (let attempt = 0; attempt < 30 && !token; attempt++) {
      const response = await fetch("http://127.0.0.1:54324/api/v1/messages");
      assert.ok(response.ok);
      const mailbox = await response.json();
      const messageId = mailbox.messages.find((message) => message.To.some((to) => to.Address === email))?.ID;
      if (messageId) {
        const detail = await fetch(`http://127.0.0.1:54324/api/v1/message/${messageId}`);
        assert.ok(detail.ok);
        const mail = await detail.json();
        token = `${mail.Text} ${mail.HTML}`.match(/\b\d{6}\b/)?.[0];
      }
      if (!token) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        ok(await otpClient.auth.signInWithOtp({ email }));
      }
    }
    assert.ok(token, "Expected a six-digit code in the email template.");
    const invalidToken = token === "000000" ? "111111" : "000000";
    assert.ok((await otpClient.auth.verifyOtp({ email, token: invalidToken, type: "email" })).error);
    const verified = ok(await otpClient.auth.verifyOtp({ email, token, type: "email" }));
    assert.ok(verified.session);
    assert.ok(verified.user.email_confirmed_at);
    assert.equal((await getCategories(otpClient)).length, 6);
    assert.ok((await otpClient.auth.verifyOtp({ email, token, type: "email" })).error, "OTP reuse must fail.");
  });

  await t.test("profiles initialize automatically and only their owner may edit", async () => {
    assert.equal((await getMyProfile(seller.client)).id, seller.id);
    const profile = await updateMyProfile(seller.client, { display_name: "Fixture seller", bio: "Test only" });
    assert.equal(profile.display_name, "Fixture seller");
    const attempted = ok(await buyer.client.from("profiles").update({ display_name: "Intruder" })
      .eq("id", seller.id).select());
    assert.deepEqual(attempted, []);
    assert.equal((await getMyProfile(seller.client)).display_name, "Fixture seller");
  });

  await t.test("seller creates drafts with database-assigned identity; buyers cannot see them", async () => {
    draft = await createListing(seller.client, {
      title: "Fixture 100% textbook", description: "Test only", category_id: "textbooks",
      condition: "good", price_cents: 1250,
    });
    listingIds.push(draft.id);
    assert.equal(draft.seller_id, seller.id);
    assert.equal(draft.price_cents, 1250);
    assert.equal(draft.status, "draft");
    assert.equal(await getListing(buyer.client, draft.id), null);
    assert.ok((await getMyListings(seller.client)).some((listing) => listing.id === draft.id));
    assert.ok((await buyer.client.from("listings").insert({
      seller_id: seller.id, title: "Forged owner", description: "Test", category_id: "textbooks",
      condition: "good", price_cents: 1,
    })).error, "Direct owner forgery must fail, independently of helpers.");
  });

  await t.test("published listings support category, literal search and pagination", async () => {
    published = await updateOwnListing(seller.client, draft.id, { status: "available" });
    const found = await browseListings(buyer.client, { categoryId: "textbooks", search: "100%", limit: 1 });
    assert.equal(found.length, 1);
    assert.equal(found[0].id, published.id);
    assert.deepEqual(await browseListings(buyer.client, { categoryId: "furniture", search: "100%" }), []);
    assert.ok(!(await browseListings(buyer.client, { search: "100_" })).some((listing) => listing.id === draft.id));
    await assert.rejects(browseListings(buyer.client, { limit: 101 }));
    await assert.rejects(browseListings(buyer.client, { offset: -1 }));
  });

  await t.test("ownership, price, category and status constraints survive direct requests", async () => {
    await assert.rejects(updateOwnListing(buyer.client, draft.id, { title: "Unauthorized" }));
    for (const change of [{ price_cents: -1 }, { category_id: "not-a-category" }, { status: "sold" }]) {
      assert.ok((await seller.client.from("listings").update(change).eq("id", draft.id)).error);
    }
    assert.ok((await seller.client.from("listings").update({ seller_id: buyer.id }).eq("id", draft.id)).error);
    assert.equal((await getListing(buyer.client, draft.id)).title, "Fixture 100% textbook");
  });

  await t.test("favorites are private, removable, and unique", async () => {
    await saveFavorite(buyer.client, draft.id);
    assert.ok((await getFavorites(buyer.client)).some((favorite) => favorite.listing_id === draft.id));
    assert.ok(!(await getFavorites(seller.client)).some((favorite) => favorite.listing_id === draft.id));
    await assert.rejects(saveFavorite(buyer.client, draft.id));
    await removeFavorite(buyer.client, draft.id);
    assert.ok(!(await getFavorites(buyer.client)).some((favorite) => favorite.listing_id === draft.id));
  });

  await t.test("archival hides listings from buyers and blocks new favorites", async () => {
    assert.equal((await archiveOwnListing(seller.client, draft.id)).status, "archived");
    assert.equal(await getListing(buyer.client, draft.id), null);
    await assert.rejects(saveFavorite(buyer.client, draft.id));
    assert.equal((await getListing(seller.client, draft.id)).status, "archived");
  });

  await t.test("anonymous requests cannot read marketplace data", async () => {
    for (const table of ["profiles", "categories", "listings", "favorites"]) {
      assert.ok((await anonymous.from(table).select("*")).error, `${table} must deny anonymous access`);
    }
  });
});
