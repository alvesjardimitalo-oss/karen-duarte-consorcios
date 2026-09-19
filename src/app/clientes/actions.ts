'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireStaff, requireAdminManager } from '@/modules/auth/session';
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
  const { supabase }=await requireStaff();
  const avatarUrl=await uploadAvatar(supabase,formData.get('foto'));
  await criarCliente(supabase,{nome:String(formData.get('nome')??'').trim(),telefone:String(formData.get('telefone')??'').replace(/\D/g,''),cpf:String(formData.get('cpf')??'').replace(/\D/g,''),endereco:String(formData.get('endereco')??'').trim(),tags:String(formData.get('tags')??'').split(',').map(v=>v.trim()).filter(Boolean),avatarUrl});
  revalidatePath('/clientes'); revalidatePath('/');
}

export async function atualizarClienteAction(formData:FormData) {
  const { supabase, profile }=await requireStaff();
  const id=String(formData.get('id')??'');
  const avatarUrl=await uploadAvatar(supabase,formData.get('foto'));
  const update:any={name:String(formData.get('nome')??'').trim(),phone:String(formData.get('telefone')??'').replace(/\D/g,''),cpf:String(formData.get('cpf')??'').replace(/\D/g,'')||null,address:String(formData.get('endereco')??'').trim()||null,tags:String(formData.get('tags')??'').split(',').map(v=>v.trim()).filter(Boolean)};
  if(['SUPER_ADMIN','ADMIN'].includes(profile.role)) update.active=formData.get('active')==='on';
  if(avatarUrl) update.avatar_url=avatarUrl;
  if(update.name.length<2||update.phone.length<10) throw new Error('Nome e telefone são obrigatórios.');
  const { error }=await supabase.from('clients').update(update).eq('id',id);
  if(error) redirect(`/clientes/${id}?erro=${encodeURIComponent(error.code==='23505'?'Este telefone já está cadastrado em outro cliente.':'Não foi possível salvar as alterações do cliente.')}`);
  revalidatePath('/clientes'); revalidatePath(`/clientes/${id}`); revalidatePath('/'); redirect(`/clientes/${id}?salvo=1`);
}
