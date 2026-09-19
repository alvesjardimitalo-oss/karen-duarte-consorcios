'use client';
import Link from 'next/link';
import {useState} from 'react';
import{Boxes,BookOpen,CalendarDays,ChevronDown,Gift,LayoutDashboard,ReceiptText,History,ShoppingBag,ShoppingCart,TicketCheck,UserRound,Users,WalletCards}from'lucide-react';
type Profile={name:string;role:string;avatar_url:string|null};
type Item={key:string;href:string;label:string;Icon:any;admin?:boolean;children?:{href:string;label:string}[]};
export function StaffNav({profile,active}:{profile:Profile;active?:string}){
 const isAdmin=['SUPER_ADMIN','ADMIN'].includes(profile.role);
 const all:Item[]=[
  {key:'dashboard',href:'/',label:'Dashboard',Icon:LayoutDashboard},
  {key:'consorcios',href:'/consorcios',label:'Consórcios',Icon:Gift,admin:true,children:[{href:'/consorcios',label:'Turmas'},{href:'/sorteios',label:'Sorteios'},{href:'/calendario',label:'Calendário'},{href:'/contemplacoes',label:'Contemplações'},{href:'/vouchers',label:'Vouchers'}]},
  {key:'clientes',href:'/clientes',label:'Clientes',Icon:Users,children:[{href:'/clientes',label:'Todos os clientes'},{href:'/clientes#solicitacoes-acesso',label:'Solicitações de acesso'},{href:'/parcelas',label:'A receber'}]},
  {key:'pedidos',href:'/pedidos',label:'Vendas',Icon:ShoppingBag,children:[{href:'/pedidos',label:'PDV / Nova venda'},{href:'/pedidos/historico',label:'Histórico de vendas'}]},
  {key:'catalogo',href:'/catalogo',label:'Produtos',Icon:BookOpen,admin:true,children:[{href:'/catalogo',label:'Catálogo'},{href:'/compras',label:'Compras'},{href:'/estoque',label:'Pronta entrega'}]},
  {key:'financeiro',href:'/financeiro',label:'Financeiro',Icon:WalletCards,admin:true,children:[{href:'/financeiro',label:'Visão financeira'},{href:'/financeiro/caixa',label:'Caixa'}]}
 ];
 const items=all.filter(x=>isAdmin||!x.admin);
 const [open,setOpen]=useState<string|null>(active==='parcelas'?'clientes':active==='historico-vendas'?'pedidos':['sorteios','calendario','contemplacoes','vouchers'].includes(active??'')?'consorcios':['compras','estoque'].includes(active??'')?'catalogo':active??null);
 return <aside className="app-nav">
  <Link href="/" className="app-nav-brand"><img src="/karen-martins-logo.svg" alt="Karen Martins Cosméticos" className="official-brand-logo"/></Link>
  <nav className="app-nav-main">{items.map(({key,href,label,Icon,children})=><div className={'nav-group '+(open===key?'open':'')} key={key}>
   <div className={'nav-row '+(active===key?'active':'')}>
    <Link href={href} className="nav-main-link"><Icon size={19}/><span>{label}</span></Link>
    {children&&<button type="button" className="nav-toggle" aria-label={'Abrir menu '+label} aria-expanded={open===key} onClick={()=>setOpen(open===key?null:key)}><ChevronDown size={15}/></button>}
   </div>
   {children&&open===key&&<div className="nav-submenu">{children.map(ch=><Link key={ch.href+ch.label} href={ch.href}>{ch.label}</Link>)}</div>}
  </div>)}</nav>
  <Link href="/perfil" className="app-nav-profile">{profile.avatar_url?<img src={profile.avatar_url} alt=""/>:<i><UserRound size={19}/></i>}<div><small>Meu perfil</small><strong>{profile.name}</strong><span>{profile.role}</span></div></Link>
 </aside>
}