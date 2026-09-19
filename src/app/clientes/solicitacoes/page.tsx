import Link from 'next/link';
import { ArrowLeft, BellRing } from 'lucide-react';
import { StaffNav } from '@/components/staff-nav';
import { requireStaff } from '@/modules/auth/session';
import { SolicitacoesAcesso } from '../access-requests';

export default async function SolicitacoesClientesPage(){
 const {supabase,profile}=await requireStaff();
 if(!['SUPER_ADMIN','ADMIN'].includes(profile.role)) return <><StaffNav profile={profile} active="clientes"/><main className="clients-page with-app-nav"><div className="clients-wrap"><p>Acesso restrito à administração.</p></div></main></>;
 const {data:rows}=await supabase.from('client_access_requests').select('id,client_id,phone,status,request_type,requested_at,activation_expires_at,activation_attempts').in('status',['PENDENTE','APROVADA','PROCESSANDO']).order('requested_at',{ascending:true});
 const ids=[...new Set((rows??[]).map((r:any)=>r.client_id).filter(Boolean))];
 const {data:clients}=ids.length?await supabase.from('clients').select('id,name').in('id',ids):{data:[] as any[]};
 const names=new Map((clients??[]).map((c:any)=>[c.id,c.name]));
 const items=(rows??[]).map((r:any)=>({...r,clients:{name:names.get(r.client_id)??'Cliente'}}));
 return <><StaffNav profile={profile} active="clientes"/><main className="clients-page with-app-nav"><div className="clients-wrap">
  <header className="clients-header"><div><Link href="/clientes" className="back-link"><ArrowLeft size={17}/> Clientes</Link><p className="eyebrow">CLIENTES / ACESSOS</p><h1>Solicitações de acesso</h1><p className="muted">Aprove primeiros acessos e acompanhe liberações em andamento.</p></div></header>
  <section className="access-admin-panel"><div className="access-admin-title"><div className="access-admin-icon"><BellRing size={22}/></div><div><p className="eyebrow">FILA DE LIBERAÇÃO</p><h2>{items.length?`${items.length} cliente${items.length===1?'':'s'} aguardando liberação`:'Nenhuma solicitação pendente'}</h2><p className="muted">Após aprovar, o código de ativação será exibido para envio ao cliente.</p></div></div><SolicitacoesAcesso items={items as any}/></section>
 </div></main></>;
}