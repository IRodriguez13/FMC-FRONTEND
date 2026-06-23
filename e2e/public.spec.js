import { test, expect } from '@playwright/test';

test.describe('Rutas públicas', () => {
  test('home carga y enlaza a explorar', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /explorar/i }).first()).toBeVisible();
  });

  test('página de ayuda renderiza primeros pasos', async ({ page }) => {
    await page.goto('/demo');
    await expect(page.getByRole('heading', { name: 'Primeros pasos' })).toBeVisible();
    await expect(page.getByRole('link', { name: /login/i })).toBeVisible();
  });

  test('términos renderiza', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: /términos/i })).toBeVisible();
  });
});
