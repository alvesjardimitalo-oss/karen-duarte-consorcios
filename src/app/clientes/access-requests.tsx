'use client';

import { useState, useTransition } from 'react';
import { revisarSolicitacaoAcessoAction } from './access-actions';

type RequestItem={id:string;phone:string;requested_at:string;clients:{name:string}|null};

export function SolicitacoesAcesso({items}:{items:RequestItem[]}) {
 const [code,setCode]=useState(''); const [pending,start]=useTransition();
 if(!items.length&&!code)return null;
 function review(id:string,approve:boolean){
  const fd=new FormData();fd.set('id',id);fd.set('decision',approve?'approve':'reject');
  start(async()=>{const result=await revisarSolicitacaoAcessoAction(fd);if(result)setCode(result);});
 }
 return <section className="client-list-card" style={{marginBottom:20}}>
  <div className="list-heading"><div><p className="eyebrow">ACESSO AO APP</p><h2>Solicitações de ativação</h2></div><strong>{items.length} pendente{items.length===1?'':'s'}</strong></div>
  {code&&<div style={{padding:16,borderRadius:14,background:'#fff4f8',margin:'0 16px 16px'}}><strong>Código aprovado: {code}</strong><p className="muted" style={{marginBottom:0}}>Copie e envie ao cliente. Por segurança, este código é exibido somente nesta aprovação.</p><button type="button" onClick={()=>setCode('')} style={{marginTop:8}}>Fechar</button></div>}
  <div style={{display:'grid',gap:10,padding:16}}>
   {items.map(r=><div key={r.id} style={{display:'flex',gap:12,alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',padding:'12px 0',borderBottom:'1px solid #eee'}}>
    <div><strong>{r.clients?.name??'Cliente'}</strong><div className="muted">{r.phone} · {new Date(r.requested_at).toLocaleString('pt-BR')}</div></div>
    <div style={{display:'flex',gap:8}}><button type="button" disabled={pending} onClick={()=>review(r.id,false)}>Rejeitar</button><button type="button" className="primary" disabled={pending} onClick={()=>review(r.id,true)}>Aprovar</button></div>
   </div>)}
  </div>
 </section>;
}
