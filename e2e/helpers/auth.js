/** @typedef {'consumer' | 'enterprise'} LoginMode */

/**
 * @param {import('@playwright/test').Page} page
 * @param {{ email: string, password: string, mode?: LoginMode }} opts
 */
export async function loginAs(page, { email, password, mode = 'consumer' }) {
  await page.goto('/login');

  if (mode === 'enterprise') {
    await page.getByRole('button', { name: /Negocio/i }).click();
  }

  await page.getByPlaceholder('tu@email.com').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();

  if (mode === 'enterprise') {
    await page.waitForURL(/\/enterprise/);
  } else {
    await page.waitForURL(/\/explore/);
  }
}

/** @param {import('@playwright/test').Page} page */
export async function clearSession(page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.removeItem('fmc_token');
    localStorage.removeItem('fmc_role');
    localStorage.removeItem('fmc_email');
    localStorage.removeItem('fmc_favorites');
  });
}
