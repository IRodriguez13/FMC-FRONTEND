import { test, expect } from '@playwright/test';
import { loginAs, clearSession } from './helpers/auth.js';
import { ACCOUNTS, DEMO_PASSWORD } from './helpers/seed.js';

test.describe('Flujos enterprise', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('panel negocio carga datos del local', async ({ page }) => {
    await loginAs(page, {
      email: ACCOUNTS.enterprisePremium,
      password: DEMO_PASSWORD,
      mode: 'enterprise',
    });
    await expect(page.getByText(/Plan Enterprise/i)).toBeVisible();
    await expect(page.getByText('Premium').first()).toBeVisible();
  });

  test('mapa carga para usuario autenticado', async ({ page }) => {
    await loginAs(page, {
      email: ACCOUNTS.consumerPremium,
      password: DEMO_PASSWORD,
    });
    await page.goto('/map');
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 20_000 });
  });
});
