/**
 * Financial validators and labels for the Financial module
 */

// Account type labels (Portuguese)
export const ACCOUNT_TYPE_LABELS = {
  revenue: "Receita",
  expense: "Despesa",
  cost: "Custo",
} as const;

export type AccountType = keyof typeof ACCOUNT_TYPE_LABELS;

// Transaction type labels
export const TRANSACTION_TYPE_LABELS = {
  payable: "Conta a Pagar",
  receivable: "Conta a Receber",
} as const;

export type TransactionType = keyof typeof TRANSACTION_TYPE_LABELS;

// Transaction status labels and colors
export const TRANSACTION_STATUS_LABELS = {
  pending: "Pendente",
  partial: "Parcial",
  paid: "Pago",
  overdue: "Vencido",
  cancelled: "Cancelado",
} as const;

export const TRANSACTION_STATUS_COLORS = {
  pending: "yellow",
  partial: "blue",
  paid: "green",
  overdue: "red",
  cancelled: "gray",
} as const;

export type TransactionStatus = keyof typeof TRANSACTION_STATUS_LABELS;

// Payment method labels
export const PAYMENT_METHOD_LABELS = {
  cash: "Dinheiro",
  pix: "PIX",
  transfer: "Transferência",
  credit_card: "Cartão de Crédito",
  debit_card: "Cartão de Débito",
  boleto: "Boleto",
  check: "Cheque",
} as const;

export type PaymentMethod = keyof typeof PAYMENT_METHOD_LABELS;

// Default accounts to seed for new organizations
export const DEFAULT_ACCOUNTS = {
  revenue: [
    { code: "R001", name: "Vendas de Produtos" },
    { code: "R002", name: "Vendas de Serviços" },
    { code: "R003", name: "Outras Receitas" },
  ],
  expense: [
    { code: "D001", name: "Salários e Encargos" },
    { code: "D002", name: "Aluguel" },
    { code: "D003", name: "Água e Energia" },
    { code: "D004", name: "Internet e Telefone" },
    { code: "D005", name: "Marketing e Publicidade" },
    { code: "D006", name: "Material de Escritório" },
    { code: "D007", name: "Impostos e Taxas" },
    { code: "D008", name: "Outras Despesas" },
  ],
  cost: [
    { code: "C001", name: "Fornecedores" },
    { code: "C002", name: "Frete e Transporte" },
    { code: "C003", name: "Materiais e Insumos" },
  ],
} as const;

// Validation functions

/**
 * Validate that amount is a positive number
 */
export function validateAmount(amount: number): { valid: boolean; error?: string } {
  if (typeof amount !== "number" || isNaN(amount)) {
    return { valid: false, error: "Valor deve ser um número" };
  }
  if (amount <= 0) {
    return { valid: false, error: "Valor deve ser maior que zero" };
  }
  return { valid: true };
}

/**
 * Validate that due date is not before issue date
 */
export function validateDates(
  issueDate: number,
  dueDate: number
): { valid: boolean; error?: string } {
  if (dueDate < issueDate) {
    return { valid: false, error: "Data de vencimento não pode ser anterior à data de emissão" };
  }
  return { valid: true };
}

/**
 * Validate payment amount doesn't exceed remaining balance
 */
export function validatePaymentAmount(
  paymentAmount: number,
  totalAmount: number,
  paidAmount: number
): { valid: boolean; error?: string } {
  const remaining = totalAmount - paidAmount;
  if (paymentAmount <= 0) {
    return { valid: false, error: "Valor do pagamento deve ser maior que zero" };
  }
  if (paymentAmount > remaining) {
    return { valid: false, error: `Valor excede o saldo restante de R$ ${remaining.toFixed(2)}` };
  }
  return { valid: true };
}

/**
 * Format currency value to Brazilian Real
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Format date to Brazilian format
 */
export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(timestamp));
}

/**
 * Check if a transaction is overdue
 */
export function isOverdue(dueDate: number, status: TransactionStatus): boolean {
  if (status === "paid" || status === "cancelled") {
    return false;
  }
  return dueDate < Date.now();
}

/**
 * Calculate remaining balance
 */
export function getRemainingBalance(amount: number, paidAmount: number): number {
  return Math.max(0, amount - paidAmount);
}

/**
 * Determine transaction status based on payment progress
 */
export function calculateStatus(
  amount: number,
  paidAmount: number,
  dueDate: number,
  currentStatus: TransactionStatus
): TransactionStatus {
  if (currentStatus === "cancelled") {
    return "cancelled";
  }
  if (paidAmount >= amount) {
    return "paid";
  }
  if (paidAmount > 0) {
    return "partial";
  }
  if (dueDate < Date.now()) {
    return "overdue";
  }
  return "pending";
}
