import { test, expect } from "@playwright/test";

test("starter navigation identifies unfinished features honestly", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Six people. One project." })).toBeVisible();
  await page.getByRole("link", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("heading", { name: "GMU sign in" })).toBeVisible();
  await expect(page.getByText("It does not collect or save information yet.", { exact: false })).toBeVisible();
  await expect(page.getByRole("textbox")).toHaveCount(0);
});
