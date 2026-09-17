import { Bell, CalendarDays, CircleDollarSign, Gift, LayoutDashboard, Package, Plus, ReceiptText, Search, Sparkles, TicketCheck, Users } from 'lucide-react';

const stats = [
  { label: 'Turmas ativas', value: '8', note: '+2 este mês', icon: Users },
  { label: 'Clientes', value: '76', note: '72 em dia', icon: Sparkles },
  { label: 'Previsto no mês', value: 'R$ 2.660', note: 'R$ 2.415 recebido', icon: CircleDollarSign },
  { label: 'Parcelas em atraso', value: '7', note: 'R$ 245 pendente', icon: ReceiptText },
];

const menu = [
  ['Dashboard', LayoutDashboard], ['Consórcios', Gift], ['Clientes', Users], ['Parcelas', ReceiptText],
  ['Sorteios', CalendarDays], ['Contemplações', TicketCheck], ['Produtos', Package],
];

export default function Home() {
  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><div className="butterfly">♡</div><div><strong>Karen Martins</strong><span>CONSÓRCIOS</span></div></div>
        <nav>{menu.map(([label, Icon], i) => <button className={i === 0 ? 'active' : ''} key={label as string}><Icon size={19}/>{label as string}</button>)}</nav>
        <div className="sidebar-card"><span>Próximo sorteio</span><strong>20 SET</strong><small>Turma Primavera • R$ 350</small></div>
      </aside>

      <section className="content">
        <header><div><p className="eyebrow">VISÃO GERAL</p><h1>Bom dia, Karen!</h1><p className="muted">Acompanhe suas turmas e recebimentos em um só lugar.</p></div><div className="actions"><button className="icon"><Search size={19}/></button><button className="icon"><Bell size={19}/></button><button className="primary"><Plus size={18}/> Novo consórcio</button></div></header>

        <div className="stats">{stats.map(({label,value,note,icon:Icon}) => <article className="stat" key={label}><div className="stat-icon"><Icon size={21}/></div><span>{label}</span><strong>{value}</strong><small>{note}</small></article>)}</div>

        <div className="grid">
          <article className="panel wide"><div className="panel-title"><div><p className="eyebrow">RECEBIMENTOS</p><h2>Resumo de setembro</h2></div><span className="pill">90,8% recebido</span></div><div className="money"><strong>R$ 2.415,00</strong><span>de R$ 2.660,00 previstos</span></div><div className="progress"><i /></div><div className="split"><span><b>69</b> parcelas pagas</span><span><b>7</b> pendentes</span></div></article>
          <article className="panel"><p className="eyebrow">PRÓXIMO SORTEIO</p><div className="date-card"><b>20</b><span>SET</span></div><h2>Turma Primavera</h2><p className="muted">10 participantes • Crédito R$ 350</p><button className="secondary">Abrir turma</button></article>
          <article className="panel"><p className="eyebrow">CONTEMPLAÇÕES</p><h2>5 aguardando produtos</h2><p className="muted">Clientes com crédito disponível para resgate.</p><div className="voucher"><TicketCheck/><div><strong>R$ 1.180,00</strong><span>saldo total disponível</span></div></div><button className="secondary">Ver vouchers</button></article>
          <article className="panel wide"><div className="panel-title"><div><p className="eyebrow">TURMAS</p><h2>Consórcios em andamento</h2></div><button className="link">Ver todos</button></div><div className="groups"><div><span className="dot"/><p><strong>Turma Primavera</strong><small>10 participantes • 6/10 meses</small></p><b>R$ 35/mês</b></div><div><span className="dot"/><p><strong>Turma Encanto</strong><small>10 participantes • 3/10 meses</small></p><b>R$ 35/mês</b></div><div><span className="dot"/><p><strong>Turma Essência</strong><small>8 participantes • 8/8 meses</small></p><b>R$ 40/mês</b></div></div></article>
        </div>
      </section>
    </main>
  );
}
