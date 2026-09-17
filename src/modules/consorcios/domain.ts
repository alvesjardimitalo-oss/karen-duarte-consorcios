export type ConsortiumStatus = 'FORMACAO' | 'ATIVO' | 'FINALIZADO' | 'CANCELADO';

export interface Consortium {
  id: string;
  name: string;
  participantLimit: number;
  monthlyInstallmentCents: number;
  durationMonths: number;
  drawDay: number;
  status: ConsortiumStatus;
}

export function calculateMonthlyCredit(consortium: Pick<Consortium, 'participantLimit' | 'monthlyInstallmentCents'>) {
  return consortium.participantLimit * consortium.monthlyInstallmentCents;
}

export function canDeleteConsortium(hasFinancialMovement: boolean) {
  return !hasFinancialMovement;
}
