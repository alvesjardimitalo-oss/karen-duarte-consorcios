import type { SupabaseClient } from '@supabase/supabase-js';
import { consorcioSchema, calcularCreditoMensal, type ConsorcioInput } from './schema';

export async function listarConsorcios(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('consortia')
    .select('id,name,participant_limit,installment_amount,duration_months,credit_amount,due_day,draw_day,starts_on,status,created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function criarConsorcio(supabase: SupabaseClient, input: ConsorcioInput) {
  const value = consorcioSchema.parse(input);
  const credito = calcularCreditoMensal(value);

  const { data, error } = await supabase
    .from('consortia')
    .insert({
      name: value.nome,
      participant_limit: value.participantes,
      installment_amount: value.valorParcela,
      duration_months: value.meses,
      due_day: value.diaVencimento,
      draw_day: value.diaSorteio,
      status: 'FORMACAO',
    })
    .select()
    .single();

  if (error) throw error;
  return { ...data, creditoCalculado: credito };
}
