import Link from 'next/link';
import { BookOpen, CalendarDays, LayoutDashboard, ShoppingBag, TicketCheck, UserRound } from 'lucide-react';

export function ClientNav({name,active}:{name:string;active?:string}){
 const items=[
  ['dashboard','/portal','Início',LayoutDashboard],
  ['parcelas','/portal/parcelas','Parcelas',CalendarDays],
  ['vouchers','/portal/vouchers','Créditos',TicketCheck],
  ['pedidos','/portal/meus-pedidos','Compras',ShoppingBag],
  ['revistas','/portal/pedidos','Revistas',BookOpen],
 ] as const;
 return <aside className="client-app-nav">
  <Link href="/portal" className="client-nav-brand"><img src="/karen-martins-logo.svg" alt="Karen Martins Cosméticos"/></Link>
  <div className="client-nav-caption"><span>ÁREA DO CLIENTE</span><strong>{name}</strong></div>
  <nav>{items.map(([key,href,label,Icon])=><Link href={href} className={active===key?'active':''} key={key}><Icon size={19}/><span>{label}</span></Link>)}</nav>
  <Link href="/portal" className="client-nav-profile"><i><UserRound size={19}/></i><div><small>Minha conta</small><strong>{name}</strong><span>Cliente Karen Martins</span></div></Link>
 </aside>
}