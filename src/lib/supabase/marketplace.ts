import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "./database.types";

type Client = SupabaseClient<Database>;
export type Listing = Tables<"listings">;
export type ListingStatus = "draft" | "available" | "archived";
export type ListingCondition = "new" | "like_new" | "good" | "fair";
export type ListingInput = {
  title: string;
  description: string;
  category_id: string;
  condition: ListingCondition;
  price_cents: number;
  status?: "draft" | "available";
};

function requireData<T>({ data, error }: { data: T | null; error: unknown }): T {
  if (error) throw error;
  if (data === null) throw new Error("The requested record is unavailable.");
  return data;
}

async function currentUserId(client: Client) {
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("Sign in before accessing your marketplace data.");
  return data.user.id;
}

export async function getCategories(client: Client) {
  return requireData(await client.from("categories").select("*").order("name"));
}

export async function browseListings(
  client: Client,
  options: { search?: string; categoryId?: string; offset?: number; limit?: number } = {},
) {
  const { search, categoryId, offset = 0, limit = 20 } = options;
  if (!Number.isSafeInteger(offset) || offset < 0 ||
      !Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
    throw new Error("Use a nonnegative offset and a limit between 1 and 100.");
  }
  let query = client.from("listings").select("*").eq("status", "available");
  if (categoryId) query = query.eq("category_id", categoryId);
  if (search?.trim()) {
    // Escape LIKE wildcards so a search term is treated as literal text.
    const literal = search.trim().replace(/[\\%_]/g, "\\$&");
    query = query.ilike("title", `%${literal}%`);
  }
  return requireData(await query.order("created_at", { ascending: false })
    .order("id", { ascending: false }).range(offset, offset + limit - 1));
}

export async function getListing(client: Client, id: string) {
  const { data, error } = await client.from("listings").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  // RLS deliberately makes an inaccessible listing indistinguishable from a missing one.
  return data;
}

export async function getMyListings(client: Client) {
  const userId = await currentUserId(client);
  return requireData(await client.from("listings").select("*").eq("seller_id", userId)
    .order("created_at", { ascending: false }));
}

export async function createListing(client: Client, input: ListingInput) {
  // Identity, currency, and timestamps come from the database, never the form.
  return requireData(await client.from("listings").insert({
    title: input.title.trim(), description: input.description.trim(),
    category_id: input.category_id, condition: input.condition,
    price_cents: input.price_cents, status: input.status ?? "draft",
  }).select("*").single());
}

export async function updateOwnListing(client: Client, id: string, input: Partial<ListingInput>) {
  const changes: Database["public"]["Tables"]["listings"]["Update"] = {};
  if (input.title !== undefined) changes.title = input.title.trim();
  if (input.description !== undefined) changes.description = input.description.trim();
  if (input.category_id !== undefined) changes.category_id = input.category_id;
  if (input.condition !== undefined) changes.condition = input.condition;
  if (input.price_cents !== undefined) changes.price_cents = input.price_cents;
  if (input.status !== undefined) changes.status = input.status;
  if (Object.keys(changes).length === 0) throw new Error("Provide at least one listing field to update.");
  // RLS checks ownership even if a caller bypasses this helper entirely.
  return requireData(await client.from("listings").update(changes).eq("id", id).select("*").single());
}

export async function archiveOwnListing(client: Client, id: string) {
  return requireData(await client.from("listings").update({ status: "archived" })
    .eq("id", id).select("*").single());
}

export async function getMyProfile(client: Client) {
  const userId = await currentUserId(client);
  return requireData(await client.from("profiles").select("*").eq("id", userId).single());
}

export async function updateMyProfile(client: Client, input: { display_name: string; bio: string }) {
  const userId = await currentUserId(client);
  return requireData(await client.from("profiles").update({
    display_name: input.display_name.trim(), bio: input.bio.trim(),
  }).eq("id", userId).select("*").single());
}

export async function getFavorites(client: Client) {
  return requireData(await client.from("favorites").select("*").order("created_at", { ascending: false }));
}

export async function saveFavorite(client: Client, listingId: string) {
  return requireData(await client.from("favorites").insert({ listing_id: listingId }).select("*").single());
}

export async function removeFavorite(client: Client, listingId: string) {
  const { error } = await client.from("favorites").delete().eq("listing_id", listingId);
  if (error) throw error;
}
