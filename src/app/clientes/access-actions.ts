'use server';

import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/modules/auth/session';

export async function revisarSolicitacaoAcessoAction(formData: FormData) {
 const { supabase, profile } = await requireStaff();
 if (!['SUPER_ADMIN','ADMIN'].includes(profile.role)) throw new Error('Acesso negado.');
 const id=String(formData.get('id')??'');
 const approve=String(formData.get('decision')??'')==='approve';
 const {data,error}=await supabase.rpc('review_client_access_request',{p_request:id,p_approve:approve});
 if(error) throw new Error(error.message);
 revalidatePath('/clientes');
 return approve?String(data??''):'';
}
