/**
 * Test data fixtures for unit and integration tests
 */

// Valid CPFs (mathematically correct check digits)
export const VALID_CPFS = [
  "529.982.247-25",
  "52998224725",
  "111.444.777-35",
  "11144477735",
  "123.456.789-09",
  "12345678909",
];

// Invalid CPFs
export const INVALID_CPFS = [
  "111.111.111-11", // All same digits
  "000.000.000-00", // All zeros
  "123.456.789-00", // Invalid check digits
  "123", // Too short
  "12345678901234", // Too long
  "abc.def.ghi-jk", // Non-numeric
];

// Valid CNPJs (mathematically correct check digits)
export const VALID_CNPJS = [
  "11.222.333/0001-81",
  "11222333000181",
  "11.444.777/0001-61",
  "11444777000161",
];

// Invalid CNPJs
export const INVALID_CNPJS = [
  "11.111.111/1111-11", // All same digits
  "00.000.000/0000-00", // All zeros
  "12.345.678/0001-99", // Invalid check digits
  "123", // Too short
];

// CPF generator for E2E tests
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

// CNPJ generator for E2E tests
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

// Entity test data generators
export function generateEntityData(type: "company" | "individual" = "company") {
  const timestamp = Date.now();
  return {
    name:
      type === "company"
        ? `Test Company ${timestamp} LTDA`
        : `Test Person ${timestamp}`,
    tradeName: type === "company" ? `TestCo ${timestamp}` : undefined,
    document: type === "company" ? generateValidCNPJ() : generateValidCPF(),
    email: `test-${timestamp}@example.com`,
    phone: "(11) 99999-9999",
    entityType: type,
    isClient: true,
    isSupplier: false,
  };
}
