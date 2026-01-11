/**
 * E2E Test data fixtures
 * Uses faker for realistic Brazilian-localized test data
 */

import { faker } from "@faker-js/faker/locale/pt_BR";

// Fixed test account (seeded once, used by all authenticated tests)
export const TEST_USER = {
  email: "e2e-test@flux.local",
  password: "TestPassword123!",
  name: "E2E Test User",
};

export const TEST_ORG = {
  name: "E2E Test Organization",
};

// Generate unique user data for register tests
export function generateUserData() {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: "TestPassword123!",
  };
}

// CPF generator - faker doesn't have valid Brazilian CPF algorithm
export function generateValidCPF(): string {
  const randomDigits = Array.from({ length: 9 }, () =>
    Math.floor(Math.random() * 10)
  );

  // Ensure not all same digits
  if (randomDigits.every((d) => d === randomDigits[0])) {
    randomDigits[0] = (randomDigits[0] + 1) % 10;
  }

  // Calculate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += randomDigits[i] * (10 - i);
  }
  let d1 = 11 - (sum % 11);
  d1 = d1 >= 10 ? 0 : d1;

  // Calculate second check digit
  sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += randomDigits[i] * (11 - i);
  }
  sum += d1 * 2;
  let d2 = 11 - (sum % 11);
  d2 = d2 >= 10 ? 0 : d2;

  return [...randomDigits, d1, d2].join("");
}

// CNPJ generator - faker doesn't have valid Brazilian CNPJ algorithm
export function generateValidCNPJ(): string {
  const randomDigits = Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 10)
  );

  // Ensure not all same digits
  if (randomDigits.every((d) => d === randomDigits[0])) {
    randomDigits[0] = (randomDigits[0] + 1) % 10;
  }

  // Add branch number (0001)
  randomDigits.push(0, 0, 0, 1);

  // Calculate first check digit
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = randomDigits.reduce((acc, digit, i) => acc + digit * weights1[i], 0);
  let d1 = 11 - (sum % 11);
  d1 = d1 >= 10 ? 0 : d1;

  // Calculate second check digit
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = randomDigits.reduce((acc, digit, i) => acc + digit * weights2[i], 0);
  sum += d1 * 2;
  let d2 = 11 - (sum % 11);
  d2 = d2 >= 10 ? 0 : d2;

  return [...randomDigits, d1, d2].join("");
}

// Generate Brazilian phone number
function generateBrazilianPhone(): string {
  const ddd = faker.helpers.arrayElement(["11", "21", "31", "41", "51", "61", "71", "81"]);
  const prefix = faker.string.numeric(5);
  const suffix = faker.string.numeric(4);
  return `(${ddd}) ${prefix}-${suffix}`;
}

// Entity test data generators with faker
export function generateCompanyData() {
  return {
    name: faker.company.name() + " LTDA",
    tradeName: faker.company.name(),
    document: generateValidCNPJ(),
    email: faker.internet.email(),
    phone: generateBrazilianPhone(),
  };
}

export function generateIndividualData() {
  return {
    name: faker.person.fullName(),
    document: generateValidCPF(),
    email: faker.internet.email(),
    phone: generateBrazilianPhone(),
  };
}
