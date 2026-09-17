import Link from 'next/link';
import { ArrowLeft, Camera, Search, UserRound, Users } from 'lucide-react';
import { requireStaff } from '@/modules/auth/session';
import { listarClientes } from '@/modules/clientes/repository';
import { criarClienteAction } from './actions';

export default async function ClientesPage() {
  const { supabase } = await requireStaff();
  const clientes = await listarClientes(supabase);

  return (
    <main className="clients-page">
      <div className="clients-wrap">
        <header className="clients-header">
          <div><Link href="/" className="back-link"><ArrowLeft size={17}/> Dashboard</Link><p className="eyebrow">CARTEIRA DE CLIENTES</p><h1>Clientes</h1><p className="muted">Cadastre e acompanhe seus clientes em um só lugar.</p></div>
          <div className="clients-count"><Users size={20}/><strong>{clientes.length}</strong><span>clientes</span></div>
        </header>

        <section className="client-form-card">
          <div className="form-heading"><div><p className="eyebrow">NOVO CADASTRO</p><h2>Novo cliente</h2></div><span className="required-note">* somente nome e telefone são obrigatórios</span></div>
          <form action={criarClienteAction} className="client-form">
            <label className="photo-field"><div className="avatar-placeholder"><UserRound size={34}/><span className="camera-badge"><Camera size={14}/></span></div><div><strong>Foto de perfil</strong><small>JPG, PNG ou WebP · até 5 MB</small><input name="foto" type="file" accept="image/jpeg,image/png,image/webp" /></div></label>
            <div className="form-grid">
              <label><span>Nome *</span><input name="nome" required minLength={2} placeholder="Nome do cliente" /></label>
              <label><span>Telefone *</span><input name="telefone" required inputMode="tel" placeholder="(33) 99999-9999" /></label>
              <label><span>CPF</span><input name="cpf" inputMode="numeric" placeholder="Opcional" /></label>
              <label><span>Tags</span><input name="tags" placeholder="VIP, indicação, bairro..." /></label>
              <label className="full"><span>Endereço</span><input name="endereco" placeholder="Opcional" /></label>
            </div>
            <button className="primary save-client" type="submit">Cadastrar cliente</button>
          </form>
        </section>

        <section className="client-list-card">
          <div className="list-heading"><div><p className="eyebrow">CADASTRADOS</p><h2>Todos os clientes</h2></div><div className="search-box"><Search size={17}/><span>Busca estará disponível nesta lista</span></div></div>
          {clientes.length === 0 ? <div className="empty-clients"><UserRound size={38}/><strong>Nenhum cliente cadastrado ainda</strong><span>O primeiro cadastro aparecerá aqui.</span></div> : <div className="client-list">{clientes.map((cliente) => <article className="client-row" key={cliente.id}>{cliente.avatar_url ? <img src={cliente.avatar_url} alt="" className="client-avatar" /> : <div className="client-avatar fallback"><UserRound size={22}/></div>}<div className="client-main"><strong>{cliente.name}</strong><span>{cliente.phone}</span></div><div className="client-extra"><span>{cliente.cpf || 'CPF não informado'}</span><small>{cliente.active ? 'Ativo' : 'Inativo'}</small></div></article>)}</div>}
        </section>
      </div>
    </main>
  );
}
