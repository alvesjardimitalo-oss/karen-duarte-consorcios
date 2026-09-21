import Link from 'next/link';
import { TicketCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

const money = new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const dt=(v:string)=>new Date(v).toLocaleString('pt-BR');

export default async function PortalVouchers(){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return <main className="client-portal"><div className="portal-wrap"><Link className="primary" href="/login">Entrar</Link></div></main>;
  const {data:client}=await supabase.from('clients').select('id,name').eq('profile_id',user.id).maybeSingle();
  if(!client)return <main className="client-portal"><div className="portal-wrap"><h1>Cadastro não vinculado</h1></div></main>;
  const [{data},{data:historical}]=await Promise.all([supabase.from('vouchers').select('id,code,original_credit,available_balance,reserved_balance,status,created_at,voucher_transactions(id,type,amount,balance_after,created_at,customer_orders(receipt_number))').eq('client_id',client.id).order('created_at',{ascending:false}),supabase.from('historical_voucher_matches').select('id,credit_amount,recorded_sale_amount,confidence,sale_date,item_count,notes,consortia(name)').eq('client_id',client.id).in('confidence',['PROVAVEL','CONFIRMADO']).order('sale_date',{ascending:false})]);
  const rows=(data??[]) as any[],history=(historical??[]) as any[];
  const issued=rows.reduce((s,v)=>s+Number(v.original_credit||0),0),available=rows.reduce((s,v)=>s+Number(v.available_balance||0),0),historicalCredit=history.reduce((s,h)=>s+Number(h.credit_amount||0),0);
  return <main className="client-portal"><div className="portal-wrap">
    <Link href="/portal" className="back-link">← Minha área</Link>
    <header className="clients-header"><div><p className="eyebrow">MEUS CRÉDITOS</p><h1>Contemplações e vouchers</h1><p className="muted">Acompanhe seus créditos, saldo disponível e onde cada voucher foi utilizado.</p></div></header>
    <div className="stats"><article className="stat"><span>Crédito recebido</span><strong>{money.format(issued||historicalCredit)}</strong></article><article className="stat"><span>Saldo disponível</span><strong>{money.format(available)}</strong></article><article className="stat"><span>Resgates históricos</span><strong>{history.length}</strong></article></div>
    <div className="voucher-ledger">{rows.map(v=><article className="voucher-ledger-card" key={v.id}><div className="list-heading"><div><span>Voucher</span><h2>{v.code??'Sem código'}</h2></div><b>{money.format(Number(v.available_balance||0))} disponível</b></div><div className="voucher-balance"><span>Crédito {money.format(Number(v.original_credit||0))}</span><span>Em uso/reservado {money.format(Number(v.reserved_balance||0))}</span><strong>{String(v.status).replaceAll('_',' ')}</strong></div><div className="voucher-moves">{(v.voucher_transactions??[]).sort((a:any,b:any)=>b.created_at.localeCompare(a.created_at)).map((t:any)=><div key={t.id}><span>{dt(t.created_at)} · {String(t.type).replaceAll('_',' ')}{t.customer_orders?.receipt_number?' · compra #'+String(t.customer_orders.receipt_number).padStart(6,'0'):''}</span><b>{money.format(Number(t.amount))}</b><small>Saldo após: {money.format(Number(t.balance_after||0))}</small></div>)}</div></article>)}</div>
    {history.length>0&&<section className="portal-section"><div><p className="eyebrow">MEU HISTÓRICO DO CONSÓRCIO</p><h2>Resgates já realizados</h2><p className="muted">Estes registros fazem parte do mesmo consórcio atual e foram trazidos do histórico anterior.</p></div><div className="voucher-ledger">{history.map((h:any)=><article className="voucher-ledger-card" key={h.id}><div className="list-heading"><div><span>{h.consortia?.name??'Consórcio'}</span><h2>Resgate {h.sale_date?new Date(h.sale_date+'T12:00:00').toLocaleDateString('pt-BR'):''}</h2></div><b>{h.item_count??0} item(ns)</b></div><div className="voucher-balance"><span>Crédito do consórcio {money.format(Number(h.credit_amount||0))}</span><span>Valor registrado na retirada {money.format(Number(h.recorded_sale_amount||0))}</span><strong>RESGATE HISTÓRICO</strong></div><p className="muted">{h.notes}</p></article>)}</div></section>}{!rows.length&&!history.length&&<section className="portal-welcome"><TicketCheck/><h2>Nenhum voucher disponível</h2><p>Quando você for contemplada, o crédito aparecerá aqui com todo o histórico.</p></section>}
  </div></main>;
}