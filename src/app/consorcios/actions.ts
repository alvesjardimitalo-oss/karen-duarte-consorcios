'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireStaff } from '@/modules/auth/session';

function numberValue(value: FormDataEntryValue | null) {
  return Number(String(value ?? '').replace(',', '.'));
}

export async function criarConsorcioAction(formData: FormData) {
  const { supabase, profile } = await requireStaff();
  const name = String(formData.get('name') ?? '').trim();
  const participantLimit = Number(formData.get('participant_limit'));
  const installmentAmount = numberValue(formData.get('installment_amount'));
  const durationMonths = Number(formData.get('duration_months'));
  const dueDay = Number(formData.get('due_day'));
  const drawDay = Number(formData.get('draw_day'));
  const startsOn = String(formData.get('starts_on') ?? '');

  if (name.length < 2) throw new Error('Informe o nome da turma.');
  if (!Number.isInteger(participantLimit) || participantLimit < 2) throw new Error('Quantidade de participantes inválida.');
  if (!Number.isFinite(installmentAmount) || installmentAmount <= 0) throw new Error('Valor da parcela inválido.');
  if (!Number.isInteger(durationMonths) || durationMonths < 1) throw new Error('Duração inválida.');
  if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 28) throw new Error('Dia de vencimento deve ser entre 1 e 28.');
  if (!Number.isInteger(drawDay) || drawDay < 1 || drawDay > 28) throw new Error('Dia do sorteio deve ser entre 1 e 28.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startsOn)) throw new Error('Informe a data de início.');

  const { error } = await supabase.from('consortia').insert({
    name,
    participant_limit: participantLimit,
    installment_amount: installmentAmount,
    duration_months: durationMonths,
    due_day: dueDay,
    draw_day: drawDay,
    starts_on: startsOn,
    status: 'FORMACAO',
    created_by: profile.id,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/consorcios');
  revalidatePath('/');
  redirect('/consorcios');
}
