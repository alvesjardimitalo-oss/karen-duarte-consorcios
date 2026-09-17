import { Bell, CalendarDays, CircleDollarSign, Gift, LayoutDashboard, Package, Plus, ReceiptText, Search, Sparkles, TicketCheck, Users } from 'lucide-react';
import { requireStaff } from '@/modules/auth/session';
import { LogoutButton } from '@/components/logout-button';

const menu = [
  ['Dashboard', LayoutDashboard], ['Consórcios', Gift], ['Clientes', Users], ['Parcelas', ReceiptText],
  ['Sorteios', CalendarDays], ['Contemplações', TicketCheck], ['Produtos', Package],
] as const;

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default async function Home() {
  const { supabase, profile } = await requireStaff();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

  const [consortiaResult, clientsResult, installmentsResult, paymentsResult, overdueResult, vouchersResult, nextDrawResult] = await Promise.all([
    supabase.from('consortia').select('id', { count: 'exact', head: true }).eq('status', 'ATIVO'),
    supabase.from('clients').select('id', { count: 'exact', head: true }).eq('active', true),
    supabase.from('installments').select('amount,status').gte('due_date', monthStart.slice(0, 10)).lt('due_date', nextMonth.slice(0, 10)),
    supabase.from('payments').select('amount').eq('status', 'CONFIRMADO').gte('confirmed_at', monthStart).lt('confirmed_at', nextMonth),
    supabase.from('installments').select('amount', { count: 'exact' }).eq('status', 'VENCIDA'),
    supabase.from('vouchers').select('available_balance').in('status', ['DISPONIVEL', 'PARCIAL']),
    supabase.from('draws').select('scheduled_date,consortium_id').eq('completed', false).gte('scheduled_date', now.toISOString().slice(0, 10)).order('scheduled_date', { ascending: true }).limit(1).maybeSingle(),
  ]);

  const installments = installmentsResult.data ?? [];
  const payments = paymentsResult.data ?? [];
  const overdue = overdueResult.data ?? [];
  const vouchers = vouchersResult.data ?? [];
  const expected = installments.reduce((sum: number, row: { amount: number | string | null }) => sum + Number(row.amount ?? 0), 0);
  const received = payments.reduce((sum: number, row: { amount: number | string | null }) => sum + Number(row.amount ?? 0), 0);
  const overdueAmount = overdue.reduce((sum: number, row: { amount: number | string | null }) => sum + Number(row.amount ?? 0), 0);
  const voucherBalance = vouchers.reduce((sum: number, row: { available_balance: number | string | null }) => sum + Number(row.available_balance ?? 0), 0);
  const paidCount = installments.filter((row: { status: string | null }) => row.status === 'PAGA').length;
  const pendingCount = Math.max(installments.length - paidCount, 0);
  const percent = expected > 0 ? Math.min(100, (received / expected) * 100) : 0;

  let nextConsortiumName = 'Nenhum sorteio agendado';
  if (nextDrawResult.data?.consortium_id) {
    const { data } = await supabase.from('consortia').select('name,participant_limit,credit_amount').eq('id', nextDrawResult.data.consortium_id).maybeSingle();
    if (data?.name) nextConsortiumName = data.name;
  }

  const firstName = profile.name?.trim().split(/\s+/)[0] || 'Admin';
  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(now);
  const drawDate = nextDrawResult.data?.scheduled_date ? new Date(`${nextDrawResult.data.scheduled_date}T12:00:00`) : null;
  const drawDay = drawDate ? String(drawDate.getDate()).padStart(2, '0') : '--';
  const drawMonth = drawDate ? new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(drawDate).replace('.', '').toUpperCase() : '---';

  const stats = [
    { label: 'Turmas ativas', value: String(consortiaResult.count ?? 0), note: 'dados do Supabase', icon: Users },
    { label: 'Clientes', value: String(clientsResult.count ?? 0), note: 'cadastros ativos', icon: Sparkles },
    { label: 'Previsto no mês', value: money.format(expected), note: `${money.format(received)} recebido`, icon: CircleDollarSign },
    { label: 'Parcelas em atraso', value: String(overdueResult.count ?? 0), note: `${money.format(overdueAmount)} pendente`, icon: ReceiptText },
  ];

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><div className="butterfly">♡</div><div><strong>Karen Martins</strong><span>CONSÓRCIOS</span></div></div>
        <nav>{menu.map(([label, Icon], i) => <button className={i === 0 ? 'active' : ''} key={label}><Icon size={19}/>{label}</button>)}</nav>
        <div className="sidebar-card"><span>Perfil conectado</span><strong>{profile.role}</strong><small>{profile.name}</small></div>
      </aside>

      <section className="content">
        <header><div><p className="eyebrow">VISÃO GERAL</p><h1>Bom dia, {firstName}!</h1><p className="muted">Acompanhe suas turmas e recebimentos em um só lugar.</p></div><div className="actions"><button className="icon"><Search size={19}/></button><button className="icon"><Bell size={19}/></button><LogoutButton/><button className="primary"><Plus size={18}/> Novo consórcio</button></div></header>

        <div className="stats">{stats.map(({label,value,note,icon:Icon}) => <article className="stat" key={label}><div className="stat-icon"><Icon size={21}/></div><span>{label}</span><strong>{value}</strong><small>{note}</small></article>)}</div>

        <div className="grid">
          <article className="panel wide"><div className="panel-title"><div><p className="eyebrow">RECEBIMENTOS</p><h2>Resumo de {monthName}</h2></div><span className="pill">{percent.toFixed(1).replace('.', ',')}% recebido</span></div><div className="money"><strong>{money.format(received)}</strong><span>de {money.format(expected)} previstos</span></div><div className="progress"><i style={{ width: `${percent}%` }} /></div><div className="split"><span><b>{paidCount}</b> parcelas pagas</span><span><b>{pendingCount}</b> pendentes</span></div></article>
          <article className="panel"><p className="eyebrow">PRÓXIMO SORTEIO</p><div className="date-card"><b>{drawDay}</b><span>{drawMonth}</span></div><h2>{nextConsortiumName}</h2><p className="muted">Agenda atualizada pelo banco de dados.</p><button className="secondary">Abrir turma</button></article>
          <article className="panel"><p className="eyebrow">VOUCHERS</p><h2>{vouchers.length} com saldo disponível</h2><p className="muted">Créditos disponíveis ou parcialmente utilizados.</p><div className="voucher"><TicketCheck/><div><strong>{money.format(voucherBalance)}</strong><span>saldo total disponível</span></div></div><button className="secondary">Ver vouchers</button></article>
          <article className="panel wide"><div className="panel-title"><div><p className="eyebrow">SISTEMA</p><h2>Base conectada</h2></div><span className="pill">{profile.role}</span></div><p className="muted">Os indicadores desta tela agora são consultados diretamente no Supabase e respeitam a sessão autenticada e as políticas RLS.</p></article>
        </div>
      </section>
    </main>
  );
}
