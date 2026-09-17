import type { SupabaseClient } from '@supabase/supabase-js';
import { clienteSchema, type ClienteInput } from './schema';

export async function listarClientes(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('clients')
    .select('id,name,phone,cpf,address,tags,active,created_at')
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
      cpf: value.cpf,
      address: value.endereco,
      tags: value.tags,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
