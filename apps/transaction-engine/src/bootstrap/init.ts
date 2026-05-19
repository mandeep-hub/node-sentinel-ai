import { seedUsers } from "../services/seedUsers";

import { seedCurrencies } from "../services/seedCurrencies";

import { seedBalances } from "../services/seedBalances";

import { updateCryptoPrices } from "../services/fxService";

import { startTransactionJobs } from "../jobs/transactionJob";

export async function initializeApp() {
  await seedUsers();

  await seedCurrencies();

  await seedBalances();

  await updateCryptoPrices();

  setInterval(updateCryptoPrices, 40000);

  startTransactionJobs();
}
