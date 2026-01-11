"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import {
  PAYMENT_METHOD_LABELS,
  formatCurrency,
  PaymentMethod,
} from "@/convex/lib/financialValidators";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: Id<"transactions">;
  totalAmount: number;
  paidAmount: number;
  type: "payable" | "receivable";
  onSuccess?: () => void;
}

export function PaymentDialog({
  open,
  onOpenChange,
  transactionId,
  totalAmount,
  paidAmount,
  type,
  onSuccess,
}: PaymentDialogProps) {
  const remainingBalance = totalAmount - paidAmount;

  const [amount, setAmount] = useState(remainingBalance.toString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>();
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recordPayment = useMutation(api.transactions.mutations.recordPayment);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const paymentAmount = Number(amount);
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        throw new Error("Valor inválido");
      }
      if (paymentAmount > remainingBalance) {
        throw new Error(`Valor excede o saldo restante de ${formatCurrency(remainingBalance)}`);
      }

      await recordPayment({
        id: transactionId,
        amount: paymentAmount,
        paymentMethod,
        paidAt: new Date(paidAt).getTime(),
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao registrar pagamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const actionLabel = type === "payable" ? "Registrar Pagamento" : "Registrar Recebimento";
  const title = type === "payable" ? "Registrar Pagamento" : "Registrar Recebimento";
  const description = type === "payable"
    ? "Informe os detalhes do pagamento realizado"
    : "Informe os detalhes do recebimento";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="rounded-md bg-muted p-3">
            <div className="flex justify-between text-sm">
              <span>Valor Total:</span>
              <span className="font-medium">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Já Pago:</span>
              <span className="font-medium">{formatCurrency(paidAmount)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span>Saldo Restante:</span>
              <span className="text-primary">{formatCurrency(remainingBalance)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor do Pagamento (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={remainingBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
            <Select
              value={paymentMethod || ""}
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
            >
              <SelectTrigger>
                <SelectValue>
                  {paymentMethod ? PAYMENT_METHOD_LABELS[paymentMethod] : "Selecione a forma de pagamento"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidAt">Data do Pagamento</Label>
            <Input
              id="paidAt"
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {actionLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
