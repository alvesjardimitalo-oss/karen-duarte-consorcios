import { z } from 'zod';

export const consorcioSchema = z.object({
  nome: z.string().trim().min(3, 'Informe o nome da turma'),
  participantes: z.coerce.number().int().min(2).max(100),
  valorParcela: z.coerce.number().positive(),
  meses: z.coerce.number().int().min(1).max(120),
  diaVencimento: z.coerce.number().int().min(1).max(28),
  diaSorteio: z.coerce.number().int().min(1).max(28),
});

export type ConsorcioInput = z.infer<typeof consorcioSchema>;

export function calcularCreditoMensal(input: Pick<ConsorcioInput, 'participantes' | 'valorParcela'>) {
  return Math.round(input.participantes * input.valorParcela * 100) / 100;
}
