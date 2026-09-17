'use server';

import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/modules/auth/session';
import { criarCliente } from '@/modules/clientes/repository';

export async function criarClienteAction(formData: FormData) {
  const { supabase } = await requireStaff();
  const nome = String(formData.get('nome') ?? '').trim();
  const telefone = String(formData.get('telefone') ?? '').replace(/\D/g, '');
  const cpf = String(formData.get('cpf') ?? '').replace(/\D/g, '');
  const endereco = String(formData.get('endereco') ?? '').trim();
  const tags = String(formData.get('tags') ?? '').split(',').map((v) => v.trim()).filter(Boolean);
  const foto = formData.get('foto');
  let avatarUrl = '';

  if (foto instanceof File && foto.size > 0) {
    if (foto.size > 5 * 1024 * 1024) throw new Error('A foto deve ter no máximo 5 MB.');
    const ext = foto.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `clientes/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, foto, { upsert: false, contentType: foto.type });
    if (error) throw error;
    avatarUrl = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
  }

  await criarCliente(supabase, { nome, telefone, cpf, endereco, tags, avatarUrl });
  revalidatePath('/clientes');
  revalidatePath('/');
}
