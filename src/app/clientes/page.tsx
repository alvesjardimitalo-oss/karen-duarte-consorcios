import Link from 'next/link';
import { StaffNav } from '@/components/staff-nav';
import { ArrowLeft, Camera, UserRound, Users } from 'lucide-react';
import { requireStaff } from '@/modules/auth/session';
import { listarClientes } from '@/modules/clientes/repository';
import { criarClienteAction } from './actions';
import { ClientesLista } from './clientes-lista';
import { AvatarFileInput } from '@/components/avatar-file-input';
import { SolicitacoesAcesso } from './access-requests';

export default async function ClientesPage() {
  const { supabase, profile } = await requireStaff();
  const clientes = await listarClientes(supabase);
  const { data: memberships } = await supabase.from('consortium_members').select('client_id,active,consortia(name,status)').eq('active',true);
  const groupsByClient = new Map<string,string[]>();
  for (const m of (memberships??[]) as any[]) { const name=m.consortia?.name; if(!name) continue; const arr=groupsByClient.get(m.client_id)??[]; if(!arr.includes(name)) arr.push(name); groupsByClient.set(m.client_id,arr); }
  const clientesComConsorcios=clientes.map(c=>({...c,consortia:groupsByClient.get(c.id)??[]}));
  const isAdmin=['SUPER_ADMIN','ADMIN'].includes(profile.role);
  const { data: accessRequests } = isAdmin ? await supabase.from('client_access_requests').select('id,phone,status,request_type,requested_at,activation_expires_at,activation_attempts,clients(name)').in('status',['PENDENTE','APROVADA']).order('requested_at',{ascending:true}) : { data: [] as any[] };

  return <><StaffNav profile={profile} active="clientes"/><main className="clients-page with-app-nav"><div className="clients-wrap">
    <header className="clients-header"><div><Link href="/" className="back-link"><ArrowLeft size={17}/> Dashboard</Link><p className="eyebrow">CARTEIRA DE CLIENTES</p><h1>Clientes</h1><p className="muted">Cadastre, encontre e acompanhe seus clientes.</p></div><div className="clients-count"><Users size={20}/><strong>{clientes.length}</strong><span>clientes</span></div></header>
    {isAdmin && <SolicitacoesAcesso items={(accessRequests??[]) as any}/>}\n    <details className="client-form-card new-client-details"><summary><span><b>+ Novo cliente</b><small>Cadastrar uma nova pessoa</small></span></summary><div className="form-heading"><div><p className="eyebrow">NOVO CADASTRO</p><h2>Novo cliente</h2></div><span className="required-note">* somente nome e telefone são obrigatórios</span></div><form action={criarClienteAction} className="client-form"><label className="photo-field"><div className="avatar-placeholder"><UserRound size={34}/><span className="camera-badge"><Camera size={14}/></span></div><div><strong>Foto de perfil</strong><small>JPG, PNG ou WebP · até 5 MB</small><AvatarFileInput/></div></label><div className="form-grid"><label><span>Nome *</span><input name="nome" required minLength={2} placeholder="Nome do cliente" /></label><label><span>Telefone *</span><input name="telefone" required inputMode="tel" placeholder="(33) 99999-9999" /></label><label><span>CPF</span><input name="cpf" inputMode="numeric" placeholder="Opcional" /></label><label><span>Tags</span><input name="tags" placeholder="VIP, indicação, bairro..." /></label><label className="full"><span>Endereço</span><input name="endereco" placeholder="Opcional" /></label></div><button className="primary save-client" type="submit">Cadastrar cliente</button></form></details>
    <section className="client-list-card clients-existing"><div className="list-heading"><div><p className="eyebrow">CADASTRADOS</p><h2>Todos os clientes</h2></div></div><ClientesLista clientes={clientesComConsorcios}/></section>
  </div></main></>;
}
