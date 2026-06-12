/**
 * Cuentas demo — deben coincidir con DataSeeder (fmcbackend).
 * Password común: DemoPassword = SeedPass-123
 */
export const DEMO_PASSWORD = 'SeedPass-123';

/** @typedef {{ role: string, email: string, password: string, loginAs: 'consumer' | 'enterprise' }} DemoAccount */

/** @type {DemoAccount[]} */
export const DEMO_ACCOUNTS = [
  { role: 'Consumidor Free', email: 'consumidor@seed.fmc', password: DEMO_PASSWORD, loginAs: 'consumer' },
  { role: 'Consumidor Premium', email: 'consumidor-premium@seed.fmc', password: DEMO_PASSWORD, loginAs: 'consumer' },
  { role: 'Enterprise Standard', email: 'enterprise-standard@seed.fmc', password: DEMO_PASSWORD, loginAs: 'enterprise' },
  { role: 'Enterprise Premium', email: 'enterprise-premium@seed.fmc', password: DEMO_PASSWORD, loginAs: 'enterprise' },
  { role: 'Enterprise Recoleta (Premium)', email: 'enterprise-recoleta@seed.fmc', password: DEMO_PASSWORD, loginAs: 'enterprise' },
  { role: 'Enterprise Caballito (Standard)', email: 'enterprise-caballito@seed.fmc', password: DEMO_PASSWORD, loginAs: 'enterprise' },
];

export const DEMO_CONSUMER_EMAILS = DEMO_ACCOUNTS.filter((a) => a.loginAs === 'consumer').map((a) => a.email);
