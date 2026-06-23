import { test, expect } from '@playwright/test';
import { loginAs, clearSession } from './helpers/auth.js';
import {
  ACCOUNTS,
  DEMO_PASSWORD,
  SEED_CAFE_PALERMO_ID,
  SEED_CAFE_PALERMO_NAME,
} from './helpers/seed.js';

test.describe('Flujos consumidor', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('explorar lista cafeterías del API', async ({ page }) => {
    await loginAs(page, {
      email: ACCOUNTS.consumerFree,
      password: DEMO_PASSWORD,
    });
    await expect(page.getByRole('link', { name: 'Ver perfil' }).first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test('perfil muestra email del usuario', async ({ page }) => {
    await loginAs(page, {
      email: ACCOUNTS.consumerPremium,
      password: DEMO_PASSWORD,
    });
    await page.goto('/profile');
    await expect(page.getByText(ACCOUNTS.consumerPremium)).toBeVisible();
    await expect(page.getByText(/Premium/i).first()).toBeVisible();
  });

  test('detalle cafetería seed muestra nombre y reseñas', async ({ page }) => {
    await loginAs(page, {
      email: ACCOUNTS.consumerFree,
      password: DEMO_PASSWORD,
    });
    await page.goto(`/cafe/${SEED_CAFE_PALERMO_ID}`);
    await expect(page.getByRole('heading', { name: SEED_CAFE_PALERMO_NAME })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('heading', { name: 'Reseñas' })).toBeVisible();
  });

  test('consumidor Premium ve cupón y puede ir a descargar PDF', async ({ page }) => {
    await loginAs(page, {
      email: ACCOUNTS.consumerPremium,
      password: DEMO_PASSWORD,
    });
    await page.goto(`/cafe/${SEED_CAFE_PALERMO_ID}`);
    await expect(page.getByText(/de descuento/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: /Descargar PDF/i })).toBeVisible();
  });

  test('consumidor Free ve CTA Pasar a Premium en local con beneficio', async ({ page }) => {
    await loginAs(page, {
      email: ACCOUNTS.consumerFree,
      password: DEMO_PASSWORD,
    });
    await page.goto(`/cafe/${SEED_CAFE_PALERMO_ID}`);
    await expect(page.getByRole('link', { name: 'Pasar a Premium' })).toBeVisible({
      timeout: 15_000,
    });
  });

  test('favoritos vacío invita a explorar', async ({ page }) => {
    await loginAs(page, {
      email: ACCOUNTS.consumerFree,
      password: DEMO_PASSWORD,
    });
    await page.goto('/favorites');
    await expect(page.getByRole('heading', { name: 'Mis Favoritos' })).toBeVisible();
  });

  test('checkout Premium muestra plan consumidor', async ({ page }) => {
    await loginAs(page, {
      email: ACCOUNTS.consumerFree,
      password: DEMO_PASSWORD,
    });
    await page.goto('/checkout/consumer-premium');
    await expect(page.getByRole('heading', { name: 'Plan Premium — Consumidor' })).toBeVisible();
  });
});
