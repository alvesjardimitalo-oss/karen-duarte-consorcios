import type { SupabaseClient } from '@supabase/supabase-js';
import { clienteSchema, type ClienteInput } from './schema';

export async function listarClientes(supabase: SupabaseClient) {
  const { data, error } = await supabase.from('clients').select('id,name,phone,cpf,address,tags,avatar_url,active,created_at').order('name');
  if (error) throw error; return data;
}
export async function criarCliente(supabase: SupabaseClient, input: ClienteInput) {
  const value=clienteSchema.parse(input);
  const {data,error}=await supabase.rpc('create_client',{p_name:value.nome,p_phone:value.telefone,p_cpf:value.cpf||null,p_address:value.endereco||null,p_tags:value.tags,p_avatar_url:value.avatarUrl||null});
  if(error)throw error; return data;
}
