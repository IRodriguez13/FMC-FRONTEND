import { test, expect } from '@playwright/test';
import { loginAs, clearSession } from './helpers/auth.js';
import { ACCOUNTS, DEMO_PASSWORD } from './helpers/seed.js';

test.describe('Autenticación', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('login consumidor redirige a explorar', async ({ page }) => {
    await loginAs(page, {
      email: ACCOUNTS.consumerFree,
      password: DEMO_PASSWORD,
      mode: 'consumer',
    });
    await expect(page.getByRole('heading', { name: 'Buscar cafeterías' })).toBeVisible();
    await expect(page.getByText(/Hola,/)).toBeVisible();
  });

  test('login enterprise redirige al panel', async ({ page }) => {
    await loginAs(page, {
      email: ACCOUNTS.enterprisePremium,
      password: DEMO_PASSWORD,
      mode: 'enterprise',
    });
    await expect(page.getByRole('heading', { name: 'Mi cafetería' })).toBeVisible();
  });

  test('credenciales inválidas muestran error', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('tu@email.com').fill('no-existe@seed.fmc');
    await page.locator('input[type="password"]').fill('mala-clave');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText('Email o contraseña incorrectos')).toBeVisible();
  });

  test('logout vuelve a estado anónimo', async ({ page }) => {
    await loginAs(page, {
      email: ACCOUNTS.consumerFree,
      password: DEMO_PASSWORD,
    });
    await page.getByRole('button', { name: 'Menú de cuenta' }).click();
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await expect(page.getByRole('link', { name: 'Iniciar sesión' })).toBeVisible();
  });
});
