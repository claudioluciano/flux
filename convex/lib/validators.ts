import { v } from "convex/values";

/**
 * Normalize a document (CPF or CNPJ) by removing all non-digit characters
 */
export function normalizeDocument(doc: string): string {
  return doc.replace(/\D/g, "");
}

/**
 * Validate a CPF (Brazilian individual tax ID)
 * CPF has 11 digits with 2 check digits
 */
export function isValidCPF(cpf: string): boolean {
  const cleaned = normalizeDocument(cpf);

  // Must be 11 digits
  if (cleaned.length !== 11) return false;

  // Reject known invalid patterns (all same digits)
  if (/^(\d)\1+$/.test(cleaned)) return false;

  // Calculate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[9])) return false;

  // Calculate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cleaned[10]);
}

/**
 * Validate a CNPJ (Brazilian company tax ID)
 * CNPJ has 14 digits with 2 check digits
 */
export function isValidCNPJ(cnpj: string): boolean {
  const cleaned = normalizeDocument(cnpj);

  // Must be 14 digits
  if (cleaned.length !== 14) return false;

  // Reject known invalid patterns (all same digits)
  if (/^(\d)\1+$/.test(cleaned)) return false;

  // CNPJ checksum weights
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  // Calculate first check digit
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(cleaned[12])) return false;

  // Calculate second check digit
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  return digit2 === parseInt(cleaned[13]);
}

/**
 * Validate a document based on entity type
 */
export function validateDocument(
  document: string,
  entityType: "company" | "individual"
): { valid: boolean; error?: string } {
  const normalized = normalizeDocument(document);

  if (entityType === "individual") {
    if (normalized.length !== 11) {
      return { valid: false, error: "CPF deve ter 11 dígitos" };
    }
    if (!isValidCPF(normalized)) {
      return { valid: false, error: "CPF inválido" };
    }
  } else {
    if (normalized.length !== 14) {
      return { valid: false, error: "CNPJ deve ter 14 dígitos" };
    }
    if (!isValidCNPJ(normalized)) {
      return { valid: false, error: "CNPJ inválido" };
    }
  }

  return { valid: true };
}

/**
 * Format CPF for display: 000.000.000-00
 */
export function formatCPF(cpf: string): string {
  const cleaned = normalizeDocument(cpf);
  if (cleaned.length !== 11) return cpf;
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/**
 * Format CNPJ for display: 00.000.000/0000-00
 */
export function formatCNPJ(cnpj: string): string {
  const cleaned = normalizeDocument(cnpj);
  if (cleaned.length !== 14) return cnpj;
  return cleaned.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    "$1.$2.$3/$4-$5"
  );
}

/**
 * Format document based on type
 */
export function formatDocument(
  document: string,
  entityType: "company" | "individual"
): string {
  return entityType === "individual"
    ? formatCPF(document)
    : formatCNPJ(document);
}

// Shared Convex validators for entity arguments
export const entityArgsValidator = {
  name: v.string(),
  tradeName: v.optional(v.string()),
  document: v.string(),
  entityType: v.union(v.literal("company"), v.literal("individual")),
  isClient: v.boolean(),
  isSupplier: v.boolean(),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  website: v.optional(v.string()),
  address: v.optional(
    v.object({
      street: v.string(),
      number: v.string(),
      complement: v.optional(v.string()),
      neighborhood: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      country: v.optional(v.string()),
    })
  ),
  stateRegistration: v.optional(v.string()),
  municipalRegistration: v.optional(v.string()),
  notes: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
};

// Document category validator
export const documentCategoryValidator = v.union(
  v.literal("contrato_social"),
  v.literal("alteracao_social"),
  v.literal("cnpj"),
  v.literal("contrato_cliente"),
  v.literal("alvara"),
  v.literal("certidao"),
  v.literal("other")
);

// Document category labels for display
export const DOCUMENT_CATEGORY_LABELS: Record<string, string> = {
  contrato_social: "Contrato Social",
  alteracao_social: "Alteração Social",
  cnpj: "CNPJ",
  contrato_cliente: "Contrato de Cliente",
  alvara: "Alvará",
  certidao: "Certidão",
  other: "Outro",
};
