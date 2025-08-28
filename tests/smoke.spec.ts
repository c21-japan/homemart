import { test, expect } from "@playwright/test";

test("public routes", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/ホームマート/);
  await page.goto("/buy");
  await page.goto("/contact");
});

test("admin redirects when not logged in", async ({ page }) => {
  await page.goto("/admin");
  // Clerkのサインインページにリダイレクトされることを確認
  await expect(page).toHaveURL(/sign-in|login|clerk/);
});

test("health API endpoint", async ({ page }) => {
  const response = await page.request.get("/api/health");
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data.ok).toBe(true);
});
