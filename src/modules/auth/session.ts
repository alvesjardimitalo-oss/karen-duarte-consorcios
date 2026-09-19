import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type AppRole = 'SUPER_ADMIN' | 'ADMIN' | 'RECEBEDOR' | 'CLIENTE';

export async function requireSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile, error } = await supabase.from('profiles').select('id,name,phone,role,active,avatar_url').eq('id', user.id).single();
  if (error || !profile?.active) redirect('/login');
  return { supabase, user, profile: profile as { id:string; name:string; phone:string|null; role:AppRole; active:boolean; avatar_url:string|null } };
}

export async function requireStaff() {
  const session=await requireSession();
  if(!['SUPER_ADMIN','ADMIN','RECEBEDOR'].includes(session.profile.role)) redirect('/cliente');
  return session;
}

export async function requireAdminManager() {
  const session=await requireSession();
  if(!['SUPER_ADMIN','ADMIN'].includes(session.profile.role)) redirect('/');
  return session;
}

export async function requireClient() {
  const session = await requireSession();
  const { data: client, error } = await session.supabase
    .from('clients')
    .select('id,name,phone,profile_id,active')
    .eq('profile_id', session.user.id)
    .eq('active', true)
    .maybeSingle();
  if (error || !client) redirect('/portal');
  return { ...session, client };
}
