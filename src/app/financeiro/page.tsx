import{ArrowDownCircle,ArrowUpCircle,CalendarClock,CircleDollarSign,Landmark,TriangleAlert,WalletCards}from'lucide-react';
import{requireStaff}from'@/modules/auth/session';
import{StaffNav}from'@/components/staff-nav';

const money=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const date=(v:string)=>new Date(v+'T12:00:00').toLocaleDateString('pt-BR');
const n=(v:any)=>Number(v??0);

export default async function Financeiro(){
 const{supabase,profile}=await requireStaff();
 const today=new Date(),todayKey=today.toISOString().slice(0,10),monthStart=new Date(today.getFullYear(),today.getMonth(),1).toISOString().slice(0,10),nextMonth=new Date(today.getFullYear(),today.getMonth()+1,1).toISOString().slice(0,10);
 const[{data:pay},{data:rec},{data:paidRec},{data:orders},{data:vouchers}]=await Promise.all([
  supabase.from('accounts_payable').select('id,supplier_name,description,due_date,amount,status,paid_at,paid_amount').order('due_date'),
  supabase.from('installments').select('id,due_date,amount,status').in('status',['A_VENCER','VENCIDA']).order('due_date'),
  supabase.from('installments').select('id,amount,paid_at,status').eq('status','PAGA').gte('paid_at',monthStart).lt('paid_at',nextMonth),
  supabase.from('purchase_orders').select('id,total_amount,status,ordered_at,received_at,payment_method'),
  supabase.from('vouchers').select('id,original_credit,available_balance,reserved_balance,status')
 ]);
 const payable=(pay??[])as any[],receivable=(rec??[])as any[],paid=(paidRec??[])as any[],purchases=(orders??[])as any[],vs=(vouchers??[])as any[];
 const openPay=payable.filter(x=>x.status!=='PAGO'&&x.status!=='CANCELADO'),p=openPay.reduce((s,x)=>s+n(x.amount),0),r=receivable.reduce((s,x)=>s+n(x.amount),0);
 const overdueRec=receivable.filter(x=>x.due_date<todayKey),overduePay=openPay.filter(x=>x.due_date<todayKey);
 const receivedMonth=paid.reduce((s,x)=>s+n(x.amount),0),paidMonth=payable.filter(x=>x.status==='PAGO'&&x.paid_at&&String(x.paid_at).slice(0,10)>=monthStart&&String(x.paid_at).slice(0,10)<nextMonth).reduce((s,x)=>s+n(x.paid_amount||x.amount),0);
 const boughtMonth=purchases.filter(x=>x.ordered_at>=monthStart&&x.ordered_at<nextMonth).reduce((s,x)=>s+n(x.total_amount),0);
 const voucherFace=vs.reduce((s,x)=>s+n(x.original_credit),0),voucherAvailable=vs.reduce((s,x)=>s+n(x.available_balance),0),voucherReserved=vs.reduce((s,x)=>s+n(x.reserved_balance),0);
 const next=[...receivable.map(x=>({...x,type:'RECEBER'})),...openPay.map(x=>({...x,type:'PAGAR'}))].sort((a,b)=>a.due_date.localeCompare(b.due_date)).slice(0,12);
 return <><StaffNav profile={profile} active="financeiro"/><main className="clients-page with-app-nav"><div className="clients-wrap">
  <header className="clients-header"><div><p className="eyebrow">CENTRAL FINANCEIRA</p><h1>Financeiro</h1><p className="muted">Caixa, compromissos, recebimentos e vouchers separados para não confundir crédito do cliente com dinheiro da operação.</p></div></header>
  <div className="stats">
   <article className="stat"><div className="stat-icon"><ArrowUpCircle/></div><span>A receber</span><strong>{money.format(r)}</strong><small>{receivable.length} parcelas abertas</small></article>
   <article className="stat"><div className="stat-icon"><ArrowDownCircle/></div><span>A pagar</span><strong>{money.format(p)}</strong><small>{openPay.length} compromissos</small></article>
   <article className="stat"><div className="stat-icon"><WalletCards/></div><span>Saldo projetado</span><strong>{money.format(r-p)}</strong><small>recebíveis menos compromissos</small></article>
   <article className="stat"><div className="stat-icon"><CircleDollarSign/></div><span>Recebido no mês</span><strong>{money.format(receivedMonth)}</strong><small>parcelas pagas no mês atual</small></article>
  </div>
  <div className="stats">
   <article className="stat"><div className="stat-icon"><Landmark/></div><span>Compras no mês</span><strong>{money.format(boughtMonth)}</strong><small>pedidos emitidos no período</small></article>
   <article className="stat"><div className="stat-icon"><ArrowDownCircle/></div><span>Pago no mês</span><strong>{money.format(paidMonth)}</strong><small>fornecedores efetivamente pagos</small></article>
   <article className="stat"><div className="stat-icon"><TriangleAlert/></div><span>Em atraso</span><strong>{money.format(overdueRec.reduce((s,x)=>s+n(x.amount),0))}</strong><small>{overdueRec.length} recebíveis · {overduePay.length} contas a pagar</small></article>
   <article className="stat"><div className="stat-icon"><CalendarClock/></div><span>Vouchers disponíveis</span><strong>{money.format(voucherAvailable)}</strong><small>{money.format(voucherReserved)} reservado · face {money.format(voucherFace)}</small></article>
  </div>
  <section className="client-list-card"><div className="list-heading"><div><p className="eyebrow">AGENDA FINANCEIRA</p><h2>Próximos vencimentos</h2></div></div><div className="product-list">{next.length?next.map((x:any)=><article className="product-row" key={x.type+x.id}><div><span>{x.type==='RECEBER'?'Entrada prevista':'Pagamento previsto'} · {date(x.due_date)}</span><strong>{x.type==='RECEBER'?'Parcela de consórcio':x.description}</strong>{x.type==='PAGAR'&&<small>{x.supplier_name}</small>}</div><div><small>Valor</small><b>{money.format(n(x.amount))}</b></div><span className={x.due_date<todayKey?'danger':'secondary'}>{x.due_date<todayKey?'ATRASADO':x.type}</span></article>):<p className="muted">Nenhum vencimento pendente.</p>}</div></section>
  <section className="client-list-card"><div className="list-heading"><div><p className="eyebrow">CONTAS A PAGAR</p><h2>Fornecedores</h2></div></div><div className="product-list">{openPay.length?openPay.map((x:any)=><article className="product-row" key={x.id}><div><span>{x.supplier_name} · vence {date(x.due_date)}</span><strong>{x.description}</strong></div><div><small>Valor</small><b>{money.format(n(x.amount))}</b></div><span className={x.due_date<todayKey?'danger':'secondary'}>{x.due_date<todayKey?'ATRASADO':x.status}</span></article>):<p className="muted">Nenhuma conta de fornecedor em aberto.</p>}</div></section>
  <p className="muted" style={{marginTop:16}}>Resultado econômico (DRE) será apurado pelo custo efetivo das mercadorias e vendas. O valor de face do voucher não é tratado como receita nem como pagamento ao fornecedor.</p>
 </div></main></>;
}