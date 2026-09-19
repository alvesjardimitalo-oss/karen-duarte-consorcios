'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireStaff } from '@/modules/auth/session';

function numberValue(value: FormDataEntryValue | null) { return Number(String(value ?? '').replace(',', '.')); }

export async function criarConsorcioAction(formData: FormData) {
  const { supabase, profile } = await requireStaff();
  const name=String(formData.get('name')??'').trim(), participantLimit=Number(formData.get('participant_limit')), installmentAmount=numberValue(formData.get('installment_amount')), durationMonths=Number(formData.get('duration_months')), dueDay=Number(formData.get('due_day')), drawDay=Number(formData.get('draw_day')), startsOn=String(formData.get('starts_on')??''), dueRule=String(formData.get('due_rule')??'FIXED_DAY'), dueBusinessDay=Number(formData.get('due_business_day')||0);
  if(name.length<2)throw new Error('Informe o nome da turma.'); if(!Number.isInteger(participantLimit)||participantLimit<2)throw new Error('Quantidade de participantes inválida.'); if(!Number.isFinite(installmentAmount)||installmentAmount<=0)throw new Error('Valor da parcela inválido.'); if(!Number.isInteger(durationMonths)||durationMonths<1)throw new Error('Duração inválida.'); if(dueRule==='FIXED_DAY'&&(!Number.isInteger(dueDay)||dueDay<1||dueDay>28))throw new Error('Dia de vencimento deve ser entre 1 e 28.'); if(dueRule==='BUSINESS_DAY'&&(!Number.isInteger(dueBusinessDay)||dueBusinessDay<1||dueBusinessDay>20))throw new Error('Dia útil inválido.'); if(!Number.isInteger(drawDay)||drawDay<1||drawDay>28)throw new Error('Dia do sorteio deve ser entre 1 e 28.'); if(!/^\d{4}-\d{2}-\d{2}$/.test(startsOn))throw new Error('Informe a data de início.');
  const {error}=await supabase.from('consortia').insert({name,participant_limit:participantLimit,installment_amount:installmentAmount,duration_months:durationMonths,due_day:dueRule==='FIXED_DAY'?dueDay:1,due_rule:dueRule,due_business_day:dueRule==='BUSINESS_DAY'?dueBusinessDay:null,draw_day:drawDay,starts_on:startsOn,status:'FORMACAO',created_by:profile.id}); if(error)throw new Error(error.message); revalidatePath('/consorcios'); revalidatePath('/'); redirect('/consorcios');
}

export async function adicionarParticipanteAction(formData: FormData) {
  const { supabase } = await requireStaff();
  const consortiumId=String(formData.get('consortium_id')??''), clientId=String(formData.get('client_id')??'');
  if(!consortiumId||!clientId)throw new Error('Selecione o cliente.');
  const {error}=await supabase.rpc('add_consortium_member',{p_consortium_id:consortiumId,p_client_id:clientId});
  if(error)throw new Error(error.message);
  revalidatePath(`/consorcios/${consortiumId}`); revalidatePath('/consorcios'); revalidatePath('/'); redirect(`/consorcios/${consortiumId}`);
}

export async function formarNovoGrupoAction(formData: FormData){
  const {supabase}=await requireStaff();
  const sourceId=String(formData.get('source_consortium_id')??''),name=String(formData.get('name')??'').trim(),participantLimit=Number(formData.get('participant_limit')),installmentAmount=numberValue(formData.get('installment_amount')),durationMonths=Number(formData.get('duration_months')),dueDay=Number(formData.get('due_day')),drawDay=Number(formData.get('draw_day')),startsOn=String(formData.get('starts_on')??''),dueRule=String(formData.get('due_rule')??'FIXED_DAY'),dueBusinessDay=Number(formData.get('due_business_day')||0);
  const reuseClientIds=formData.getAll('reuse_client_ids').map(String).filter(Boolean);
  if(!sourceId||name.length<2)throw new Error('Informe os dados do novo grupo.');
  const{data:newId,error}=await supabase.rpc('create_new_group_from_finished_consortium',{p_source_consortium_id:sourceId,p_name:name,p_participant_limit:participantLimit,p_installment_amount:installmentAmount,p_duration_months:durationMonths,p_due_day:dueDay,p_draw_day:drawDay,p_starts_on:startsOn,p_reuse_client_ids:reuseClientIds,p_due_rule:dueRule,p_due_business_day:dueRule==='BUSINESS_DAY'?dueBusinessDay:null});
  if(error)throw new Error(error.message);
  revalidatePath('/consorcios');revalidatePath('/');redirect(`/consorcios/${newId}`);
}

export async function reservarMesAction(formData:FormData){
 const{supabase}=await requireStaff();const consortiumId=String(formData.get('consortium_id')),memberId=String(formData.get('member_id')),month=String(formData.get('scheduled_month'));
 if(!consortiumId||!memberId||!/^\\d{4}-\\d{2}-01$/.test(month))throw new Error('Dados da programação inválidos.');
 const{error}=await supabase.rpc('reserve_consortium_month',{p_consortium_id:consortiumId,p_member_id:memberId,p_scheduled_month:month});if(error)throw new Error(error.message);revalidatePath(\`/consorcios/\${consortiumId}\`);
}
export async function gerarCalendarioAction(formData:FormData){
 const{supabase}=await requireStaff();const id=String(formData.get('consortium_id')??'');if(!id)throw new Error('Turma inválida.');
 const{error}=await supabase.rpc('generate_consortium_schedule',{p_consortium_id:id});if(error)throw new Error(error.message);revalidatePath(\`/consorcios/\${id}\`);revalidatePath('/consorcios');revalidatePath('/sorteios');
}
export async function trocarMesesAction(formData:FormData){const{supabase}=await requireStaff();const id=String(formData.get('consortium_id')),a=String(formData.get('first_schedule_id')),b=String(formData.get('second_schedule_id'));if(!a||!b||a===b)throw new Error('Selecione duas pessoas diferentes.');const{error}=await supabase.rpc('swap_consortium_schedule',{p_first:a,p_second:b});if(error)throw new Error(error.message);revalidatePath(`/consorcios/${id}`);}
