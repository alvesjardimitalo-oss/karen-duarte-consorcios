'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireSession } from '@/modules/auth/session';

export async function atualizarMeuPerfilAction(formData: FormData) {
  const { supabase, user, profile } = await requireSession();
  const name=String(formData.get('nome')??'').trim();
  const phone=String(formData.get('telefone')??'').replace(/\D/g,'');
  if(name.length<2) throw new Error('Informe seu nome.');
  const foto=formData.get('foto');
  let avatarUrl=profile.avatar_url??'';
  if(foto instanceof File&&foto.size>0){
    if(foto.size>5*1024*1024) throw new Error('A foto deve ter no máximo 5 MB.');
    if(!['image/jpeg','image/png','image/webp'].includes(foto.type)) throw new Error('Formato de foto inválido.');
    const ext=foto.type==='image/png'?'png':foto.type==='image/webp'?'webp':'jpg';
    const path=`${user.id}-${crypto.randomUUID()}.${ext}`;
    const bytes=new Uint8Array(await foto.arrayBuffer());
    const {error}=await supabase.storage.from('avatars').upload(path,bytes,{contentType:foto.type,cacheControl:'3600'});
    if(error) throw new Error(`Falha ao enviar foto: ${error.message}`);
    avatarUrl=supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
  }
  const {error}=await supabase.rpc('update_my_profile',{p_name:name,p_phone:phone||null,p_avatar_url:avatarUrl||null});
  if(error) throw new Error(error.message);
  revalidatePath('/'); revalidatePath('/perfil'); redirect('/perfil');
}
