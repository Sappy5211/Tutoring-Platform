import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const personaRoutes = [
  { path: "/app/home", heading: "Good morning, Aarav." },
  { path: "/parent/overview", heading: "Aarav is building steady momentum" },
  { path: "/teacher/dashboard", heading: "Good morning, Meera." },
  { path: "/author/library", heading: "Curriculum library" },
];

for (const { path, heading } of personaRoutes) {
  test(`${path} is navigable, accessible, and contained`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test("practice accepts maths input and opens contextual AI", async ({
  page,
}) => {
  await page.goto("/app/practice");
  await expect(
    page.getByText("Make x the subject of the formula:"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Ask VIDYA" }).last().click();
  await expect(
    page.getByRole("complementary", { name: "VIDYA AI coach" }),
  ).toBeVisible();
  await page
    .getByPlaceholder("Ask about what feels confusing…")
    .fill("Why does this operation move to the other side?");
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(
    page.getByRole("button", { name: "I’m still stuck" }),
  ).toBeVisible();
});

test("dark theme remains usable", async ({ page }) => {
  await page.goto("/app/home");
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(
    page.getByRole("heading", { name: "Good morning, Aarav." }),
  ).toBeVisible();
});

test("teacher booking requires preparation, duration, and a time", async ({
  page,
}) => {
  await page.goto("/app/teachers");
  await page.getByRole("button", { name: /View times/ }).click();

  await expect(page.getByRole("heading", { name: "Meera Iyer" })).toBeVisible();
  const continueButton = page.getByRole("button", {
    name: "Continue to confirmation",
  });
  await expect(continueButton).toBeDisabled();

  await page
    .getByLabel("Nature of your query Required")
    .fill("I can form the equation but get stuck isolating the variable.");
  await page.getByRole("button", { name: /30 min/ }).click();
  await expect(continueButton).toBeDisabled();
  await page.getByRole("button", { name: /15:00/ }).click();
  await expect(continueButton).toBeEnabled();

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(results.violations).toEqual([]);

  await continueButton.click();
  await expect(
    page.getByRole("heading", {
      name: "Your session with Meera Iyer is ready.",
    }),
  ).toBeVisible();
  await expect(page.getByText("30 minutes")).toBeVisible();
  await expect(
    page.getByText(
      "I can form the equation but get stuck isolating the variable.",
    ),
  ).toBeVisible();
});
