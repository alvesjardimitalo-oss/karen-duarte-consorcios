'use server';

import { revalidatePath } from 'next/cache';
import { redirect, RedirectType } from 'next/navigation';
import { requireStaff, requireAdminManager } from '@/modules/auth/session';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { criarCliente } from '@/modules/clientes/repository';

async function uploadAvatar(supabase:any, foto:FormDataEntryValue|null) {
  if (!(foto instanceof File) || foto.size===0) return '';
  if (foto.size>5*1024*1024) throw new Error('A foto deve ter no máximo 5 MB.');
  if (!['image/jpeg','image/png','image/webp'].includes(foto.type)) throw new Error('Formato de foto inválido.');
  const ext=foto.type==='image/png'?'png':foto.type==='image/webp'?'webp':'jpg';
  const path=`${crypto.randomUUID()}.${ext}`;
  const bytes=new Uint8Array(await foto.arrayBuffer());
  const { error }=await supabase.storage.from('avatars').upload(path,bytes,{upsert:false,contentType:foto.type,cacheControl:'3600'});
  if(error) throw new Error(`Falha ao enviar foto: ${error.message}`);
  return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
}

export async function criarClienteAction(formData: FormData) {
  await requireStaff();

  const nome=String(formData.get('nome')??'').trim();
  const telefone=String(formData.get('telefone')??'').replace(/\D/g,'');
  if(nome.length<2||telefone.length<10) redirect(`/clientes?erro=${encodeURIComponent('Nome e telefone são obrigatórios.')}`, RedirectType.replace);

  const admin=createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{autoRefreshToken:false,persistSession:false}});
  try{
    const avatarUrl=await uploadAvatar(admin,formData.get('foto'));
    await criarCliente(admin,{nome,telefone,cpf:String(formData.get('cpf')??'').replace(/\D/g,''),endereco:String(formData.get('endereco')??'').trim(),tags:String(formData.get('tags')??'').split(',').map(v=>v.trim()).filter(Boolean),avatarUrl});
  }catch(error:any){
    const message=error?.code==='23505'
      ? 'Este telefone já está cadastrado em outro cliente.'
      : error?.message?.includes('foto')
        ? error.message
        : 'Não foi possível cadastrar o cliente. Tente novamente.';
    redirect(`/clientes?erro=${encodeURIComponent(message)}`, RedirectType.replace);
  }

  revalidatePath('/clientes'); revalidatePath('/');
  redirect('/clientes?cadastrado=1', RedirectType.replace);
}

export async function atualizarClienteAction(formData:FormData) {
  const { supabase, profile }=await requireStaff();
  const id=String(formData.get('id')??'');
  const avatarUrl=await uploadAvatar(supabase,formData.get('foto'));
  const update:any={name:String(formData.get('nome')??'').trim(),phone:String(formData.get('telefone')??'').replace(/\D/g,''),cpf:String(formData.get('cpf')??'').replace(/\D/g,'')||null,address:String(formData.get('endereco')??'').trim()||null,tags:String(formData.get('tags')??'').split(',').map(v=>v.trim()).filter(Boolean)};
  if(['SUPER_ADMIN','ADMIN'].includes(profile.role)) update.active=formData.get('active')==='on';
  if(avatarUrl) update.avatar_url=avatarUrl;
  if(update.name.length<2||update.phone.length<10) throw new Error('Nome e telefone são obrigatórios.');
  const admin=createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{autoRefreshToken:false,persistSession:false}});
  const { data:saved, error }=await admin.from('clients').update(update).eq('id',id).select('id').maybeSingle();
  if(!error&&!saved) redirect(`/clientes/${id}?erro=${encodeURIComponent('Cliente não foi atualizado. Tente novamente.')}`, RedirectType.replace);
  if(error) redirect(`/clientes/${id}?erro=${encodeURIComponent(error.code==='23505'?'Este telefone já está cadastrado em outro cliente.':'Não foi possível salvar as alterações do cliente.')}`, RedirectType.replace);
  revalidatePath('/clientes'); revalidatePath(`/clientes/${id}`); revalidatePath('/');
  redirect(`/clientes/${id}?salvo=1`, RedirectType.replace);
}
