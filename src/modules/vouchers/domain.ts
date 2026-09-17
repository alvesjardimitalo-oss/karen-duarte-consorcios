export type VoucherStatus = 'DISPONIVEL' | 'PARCIAL' | 'RESERVADO' | 'UTILIZADO' | 'CANCELADO';

export interface VoucherBalance {
  originalCreditCents: number;
  consumedCents: number;
  reservedCents: number;
}

export function availableVoucherBalance(voucher: VoucherBalance) {
  return Math.max(0, voucher.originalCreditCents - voucher.consumedCents - voucher.reservedCents);
}

export function calculateRedemption(voucher: VoucherBalance, productsTotalCents: number) {
  const available = availableVoucherBalance(voucher);
  const voucherAmount = Math.min(available, productsTotalCents);
  const pixComplement = Math.max(0, productsTotalCents - voucherAmount);

  return {
    availableBeforeCents: available,
    voucherAmountCents: voucherAmount,
    pixComplementCents: pixComplement,
    requiresPixConfirmation: pixComplement > 0,
  };
}
