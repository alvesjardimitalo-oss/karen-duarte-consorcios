import Link from 'next/link';
import {CheckCircle2,ReceiptText} from 'lucide-react';
import {requireStaff} from '@/modules/auth/session';

const money=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const when=(v:string)=>new Date(v).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'});

export default async function ComprovantePage({params}:{params:Promise<{id:string}>}){
 const{id}=await params;const{supabase}=await requireStaff();
 const{data:p}=await supabase.from('payments').select('id,amount,method,status,confirmed_at,receipt_number,notes,installments(installment_number,consortium_members(clients(name,phone),consortia(name,duration_months)))').eq('id',id).maybeSingle();
 if(!p)return <main className="clients-page"><div className="clients-wrap narrow"><Link href="/parcelas" className="back-link">← Parcelas</Link><section className="receipt-card"><h1>Comprovante não encontrado</h1></section></div></main>;
 const x=p as any,m=x.installments?.consortium_members;
 return <main className="clients-page receipt-page"><div className="clients-wrap narrow"><Link href="/parcelas" className="back-link no-print">← Parcelas</Link><section className="receipt-card"><div className="receipt-brand"><div className="receipt-mark">KM</div><div><strong>Karen Martins</strong><span>COSMÉTICOS & CONSÓRCIOS</span></div></div><div className="receipt-ok"><CheckCircle2 size={34}/><div><p className="eyebrow">PAGAMENTO CONFIRMADO</p><h1>Comprovante de pagamento</h1></div></div><div className="receipt-number"><ReceiptText size={16}/><span>{x.receipt_number??x.id}</span></div><div className="receipt-grid"><div><span>Cliente</span><strong>{m?.clients?.name??'—'}</strong></div><div><span>Telefone</span><strong>{m?.clients?.phone??'—'}</strong></div><div><span>Consórcio</span><strong>{m?.consortia?.name??'—'}</strong></div><div><span>Parcela</span><strong>{x.installments?.installment_number}/{m?.consortia?.duration_months??'—'}</strong></div><div><span>Forma de pagamento</span><strong>{x.method}</strong></div><div><span>Data e hora</span><strong>{x.confirmed_at?when(x.confirmed_at):'—'}</strong></div></div><div className="receipt-total"><span>Valor pago</span><strong>{money.format(Number(x.amount))}</strong></div>{x.notes&&<div className="receipt-note"><span>Observação</span><p>{x.notes}</p></div>}<p className="receipt-footer">Pagamento registrado no sistema Karen Martins Cosméticos & Consórcios.</p><div className="receipt-actions no-print"><button className="primary" onClick={undefined as any}>Use imprimir/compartilhar do navegador</button></div></section></div></main>;
}
