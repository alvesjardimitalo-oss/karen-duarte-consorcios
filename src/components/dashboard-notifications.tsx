'use client';
import Link from 'next/link';
import { Bell, UserPlus, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Props={pendingAccess:number;newClients24h:number};

export function DashboardNotifications({pendingAccess,newClients24h}:Props){
 const [open,setOpen]=useState(false); const ref=useRef<HTMLDivElement>(null);
 const count=pendingAccess+newClients24h;
 useEffect(()=>{function close(e:MouseEvent){if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false)}document.addEventListener('mousedown',close);return()=>document.removeEventListener('mousedown',close)},[]);
 return <div className="dashboard-notifications" ref={ref}>
  <button type="button" className="icon dashboard-bell" aria-label={count?`${count} notificações`:'Notificações'} aria-expanded={open} onClick={()=>setOpen(v=>!v)}>
   <Bell size={19}/>{count>0&&<span className="notification-badge">{count>99?'99+':count}</span>}
  </button>
  {open&&<div className="notification-popover">
   <div className="notification-popover-head"><div><p className="eyebrow">NOTIFICAÇÕES</p><strong>Central de avisos</strong></div><span>{count}</span></div>
   <div className="notification-list">
    {pendingAccess>0&&<Link href="/clientes#solicitacoes-acesso" className="notification-item" onClick={()=>setOpen(false)}><span className="notification-item-icon"><ShieldCheck size={18}/></span><span><strong>Solicitação de acesso</strong><small>{pendingAccess} cliente{pendingAccess===1?'':'s'} aguardando aprovação</small><b>Ver e aprovar</b></span></Link>}
    {newClients24h>0&&<Link href="/clientes" className="notification-item" onClick={()=>setOpen(false)}><span className="notification-item-icon"><UserPlus size={18}/></span><span><strong>Novo cliente cadastrado</strong><small>{newClients24h} cadastro{newClients24h===1?'':'s'} nas últimas 24 horas</small><b>Ver clientes</b></span></Link>}
    {count===0&&<div className="notification-empty">Nenhuma notificação nova.</div>}
   </div>
  </div>}
 </div>
}