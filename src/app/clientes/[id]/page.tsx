import Link from 'next/link';
import { ArrowLeft, Camera, UserRound } from 'lucide-react';
import { notFound } from 'next/navigation';
import { requireStaff } from '@/modules/auth/session';
import { atualizarClienteAction } from '../actions';

export default async function ClientePerfil({ params }: { params: Promise<{id:string}> }) {
  const { id }=await params;
  const { supabase }=await requireStaff();
  const { data:cliente }=await supabase.from('clients').select('id,name,phone,cpf,address,tags,avatar_url,active,created_at').eq('id',id).maybeSingle();
  if(!cliente) notFound();
  return <main className="clients-page"><div className="clients-wrap narrow">
    <header className="clients-header"><div><Link href="/clientes" className="back-link"><ArrowLeft size={17}/> Clientes</Link><p className="eyebrow">PERFIL DO CLIENTE</p><h1>{cliente.name}</h1><p className="muted">Dados pessoais e personalização do perfil.</p></div></header>
    <section className="client-form-card profile-card">
      <form action={atualizarClienteAction} className="client-form"><input type="hidden" name="id" value={cliente.id}/>
        <label className="photo-field">{cliente.avatar_url?<img src={cliente.avatar_url} className="profile-avatar" alt=""/>:<div className="avatar-placeholder large"><UserRound size={42}/><span className="camera-badge"><Camera size={14}/></span></div>}<div><strong>Foto de perfil</strong><small>O cliente também poderá personalizar sua própria foto.</small><input name="foto" type="file" accept="image/jpeg,image/png,image/webp"/></div></label>
        <div className="form-grid"><label><span>Nome *</span><input name="nome" required defaultValue={cliente.name}/></label><label><span>Telefone *</span><input name="telefone" required defaultValue={cliente.phone}/></label><label><span>CPF</span><input name="cpf" defaultValue={cliente.cpf??''}/></label><label><span>Tags</span><input name="tags" defaultValue={(cliente.tags??[]).join(', ')}/></label><label className="full"><span>Endereço</span><input name="endereco" defaultValue={cliente.address??''}/></label><label className="toggle-line"><input name="active" type="checkbox" defaultChecked={cliente.active}/><span>Cliente ativo</span></label></div>
        <button className="primary save-client" type="submit">Salvar alterações</button>
      </form>
    </section>
  </div></main>;
}
