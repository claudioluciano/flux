import { describe, it, expect } from "vitest";
import {
  normalizeDocument,
  isValidCPF,
  isValidCNPJ,
  validateDocument,
  formatCPF,
  formatCNPJ,
  formatDocument,
} from "@/convex/lib/validators";
import {
  VALID_CPFS,
  INVALID_CPFS,
  VALID_CNPJS,
  INVALID_CNPJS,
  generateValidCPF,
  generateValidCNPJ,
} from "@/tests/helpers/test-data";

describe("normalizeDocument", () => {
  it("removes dots, dashes, and slashes from CPF", () => {
    expect(normalizeDocument("529.982.247-25")).toBe("52998224725");
  });

  it("removes dots, dashes, and slashes from CNPJ", () => {
    expect(normalizeDocument("11.222.333/0001-81")).toBe("11222333000181");
  });

  it("returns unchanged if already normalized", () => {
    expect(normalizeDocument("52998224725")).toBe("52998224725");
    expect(normalizeDocument("11222333000181")).toBe("11222333000181");
  });

  it("removes any non-digit characters", () => {
    expect(normalizeDocument("abc123def456")).toBe("123456");
    expect(normalizeDocument("(11) 99999-9999")).toBe("11999999999");
  });

  it("returns empty string for non-numeric input", () => {
    expect(normalizeDocument("abcdef")).toBe("");
  });
});

describe("isValidCPF", () => {
  describe("valid CPFs", () => {
    it.each(VALID_CPFS)("validates %s as valid", (cpf) => {
      expect(isValidCPF(cpf)).toBe(true);
    });
  });

  describe("invalid CPFs", () => {
    it.each(INVALID_CPFS)("rejects %s as invalid", (cpf) => {
      expect(isValidCPF(cpf)).toBe(false);
    });
  });

  it("rejects CPFs with all same digits", () => {
    for (let i = 0; i <= 9; i++) {
      const samedigits = String(i).repeat(11);
      expect(isValidCPF(samedigits)).toBe(false);
    }
  });

  it("rejects CPFs with wrong length", () => {
    expect(isValidCPF("1234567890")).toBe(false); // 10 digits
    expect(isValidCPF("123456789012")).toBe(false); // 12 digits
  });

  it("validates generated CPFs", () => {
    // Generate and validate 10 random CPFs
    for (let i = 0; i < 10; i++) {
      const cpf = generateValidCPF();
      expect(isValidCPF(cpf)).toBe(true);
    }
  });
});

describe("isValidCNPJ", () => {
  describe("valid CNPJs", () => {
    it.each(VALID_CNPJS)("validates %s as valid", (cnpj) => {
      expect(isValidCNPJ(cnpj)).toBe(true);
    });
  });

  describe("invalid CNPJs", () => {
    it.each(INVALID_CNPJS)("rejects %s as invalid", (cnpj) => {
      expect(isValidCNPJ(cnpj)).toBe(false);
    });
  });

  it("rejects CNPJs with all same digits", () => {
    for (let i = 0; i <= 9; i++) {
      const samedigits = String(i).repeat(14);
      expect(isValidCNPJ(samedigits)).toBe(false);
    }
  });

  it("rejects CNPJs with wrong length", () => {
    expect(isValidCNPJ("1234567890123")).toBe(false); // 13 digits
    expect(isValidCNPJ("123456789012345")).toBe(false); // 15 digits
  });

  it("validates generated CNPJs", () => {
    // Generate and validate 10 random CNPJs
    for (let i = 0; i < 10; i++) {
      const cnpj = generateValidCNPJ();
      expect(isValidCNPJ(cnpj)).toBe(true);
    }
  });
});

describe("validateDocument", () => {
  describe("individual (CPF)", () => {
    it("returns valid for correct CPF", () => {
      const result = validateDocument("52998224725", "individual");
      expect(result).toEqual({ valid: true });
    });

    it("returns error for wrong length", () => {
      const result = validateDocument("123456789", "individual");
      expect(result).toEqual({
        valid: false,
        error: "CPF deve ter 11 dígitos",
      });
    });

    it("returns error for invalid CPF", () => {
      const result = validateDocument("11111111111", "individual");
      expect(result).toEqual({ valid: false, error: "CPF inválido" });
    });

    it("handles formatted CPF", () => {
      const result = validateDocument("529.982.247-25", "individual");
      expect(result).toEqual({ valid: true });
    });
  });

  describe("company (CNPJ)", () => {
    it("returns valid for correct CNPJ", () => {
      const result = validateDocument("11222333000181", "company");
      expect(result).toEqual({ valid: true });
    });

    it("returns error for wrong length", () => {
      const result = validateDocument("123456789012", "company");
      expect(result).toEqual({
        valid: false,
        error: "CNPJ deve ter 14 dígitos",
      });
    });

    it("returns error for invalid CNPJ", () => {
      const result = validateDocument("11111111111111", "company");
      expect(result).toEqual({ valid: false, error: "CNPJ inválido" });
    });

    it("handles formatted CNPJ", () => {
      const result = validateDocument("11.222.333/0001-81", "company");
      expect(result).toEqual({ valid: true });
    });
  });
});

describe("formatCPF", () => {
  it("formats unformatted CPF", () => {
    expect(formatCPF("52998224725")).toBe("529.982.247-25");
  });

  it("formats already formatted CPF (normalizes first)", () => {
    expect(formatCPF("529.982.247-25")).toBe("529.982.247-25");
  });

  it("returns original for invalid length", () => {
    expect(formatCPF("123")).toBe("123");
    expect(formatCPF("12345678901234")).toBe("12345678901234");
  });
});

describe("formatCNPJ", () => {
  it("formats unformatted CNPJ", () => {
    expect(formatCNPJ("11222333000181")).toBe("11.222.333/0001-81");
  });

  it("formats already formatted CNPJ (normalizes first)", () => {
    expect(formatCNPJ("11.222.333/0001-81")).toBe("11.222.333/0001-81");
  });

  it("returns original for invalid length", () => {
    expect(formatCNPJ("123")).toBe("123");
    expect(formatCNPJ("1234567890123456")).toBe("1234567890123456");
  });
});

describe("formatDocument", () => {
  it("formats CPF for individual entity type", () => {
    expect(formatDocument("52998224725", "individual")).toBe("529.982.247-25");
  });

  it("formats CNPJ for company entity type", () => {
    expect(formatDocument("11222333000181", "company")).toBe(
      "11.222.333/0001-81"
    );
  });
});
