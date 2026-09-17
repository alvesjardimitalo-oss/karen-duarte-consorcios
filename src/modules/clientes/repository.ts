import type { SupabaseClient } from '@supabase/supabase-js';
import { clienteSchema, type ClienteInput } from './schema';

export async function listarClientes(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('clients')
    .select('id,name,phone,cpf,address,tags,avatar_url,active,created_at')
    .order('name');

  if (error) throw error;
  return data;
}

export async function criarCliente(supabase: SupabaseClient, input: ClienteInput) {
  const value = clienteSchema.parse(input);
  const { data, error } = await supabase
    .from('clients')
    .insert({
      name: value.nome,
      phone: value.telefone,
      cpf: value.cpf || null,
      address: value.endereco || null,
      tags: value.tags,
      avatar_url: value.avatarUrl || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
