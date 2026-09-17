'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireStaff } from '@/modules/auth/session';

function numberValue(value: FormDataEntryValue | null) { return Number(String(value ?? '').replace(',', '.')); }

export async function criarConsorcioAction(formData: FormData) {
  const { supabase, profile } = await requireStaff();
  const name=String(formData.get('name')??'').trim(), participantLimit=Number(formData.get('participant_limit')), installmentAmount=numberValue(formData.get('installment_amount')), durationMonths=Number(formData.get('duration_months')), dueDay=Number(formData.get('due_day')), drawDay=Number(formData.get('draw_day')), startsOn=String(formData.get('starts_on')??'');
  if(name.length<2)throw new Error('Informe o nome da turma.'); if(!Number.isInteger(participantLimit)||participantLimit<2)throw new Error('Quantidade de participantes inválida.'); if(!Number.isFinite(installmentAmount)||installmentAmount<=0)throw new Error('Valor da parcela inválido.'); if(!Number.isInteger(durationMonths)||durationMonths<1)throw new Error('Duração inválida.'); if(!Number.isInteger(dueDay)||dueDay<1||dueDay>28)throw new Error('Dia de vencimento deve ser entre 1 e 28.'); if(!Number.isInteger(drawDay)||drawDay<1||drawDay>28)throw new Error('Dia do sorteio deve ser entre 1 e 28.'); if(!/^\d{4}-\d{2}-\d{2}$/.test(startsOn))throw new Error('Informe a data de início.');
  const {error}=await supabase.from('consortia').insert({name,participant_limit:participantLimit,installment_amount:installmentAmount,duration_months:durationMonths,due_day:dueDay,draw_day:drawDay,starts_on:startsOn,status:'FORMACAO',created_by:profile.id}); if(error)throw new Error(error.message); revalidatePath('/consorcios'); revalidatePath('/'); redirect('/consorcios');
}

export async function adicionarParticipanteAction(formData: FormData) {
  const { supabase } = await requireStaff();
  const consortiumId=String(formData.get('consortium_id')??''), clientId=String(formData.get('client_id')??'');
  if(!consortiumId||!clientId)throw new Error('Selecione o cliente.');
  const {error}=await supabase.rpc('add_consortium_member',{p_consortium_id:consortiumId,p_client_id:clientId});
  if(error)throw new Error(error.message);
  revalidatePath(`/consorcios/${consortiumId}`); revalidatePath('/consorcios'); revalidatePath('/'); redirect(`/consorcios/${consortiumId}`);
}
