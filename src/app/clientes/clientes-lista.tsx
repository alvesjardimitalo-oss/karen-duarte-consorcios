'use client';

import Link from 'next/link';
import { Search, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';

type Cliente = { id:string; name:string; phone:string; cpf:string|null; tags:string[]|null; avatar_url:string|null; active:boolean };

export function ClientesLista({ clientes }: { clientes: Cliente[] }) {
  const [busca,setBusca]=useState('');
  const [status,setStatus]=useState<'todos'|'ativos'|'inativos'>('todos');
  const filtrados=useMemo(()=>{
    const q=busca.trim().toLowerCase();
    return clientes.filter(c=>{
      const okStatus=status==='todos'||(status==='ativos'?c.active:!c.active);
      const texto=[c.name,c.phone,c.cpf??'',...(c.tags??[])].join(' ').toLowerCase();
      return okStatus&&(!q||texto.includes(q));
    });
  },[clientes,busca,status]);

  return <>
    <div className="client-tools">
      <label className="search-box"><Search size={17}/><input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar nome, telefone, CPF ou tag" /></label>
      <div className="filter-tabs">
        {(['todos','ativos','inativos'] as const).map(v=><button type="button" className={status===v?'selected':''} onClick={()=>setStatus(v)} key={v}>{v[0].toUpperCase()+v.slice(1)}</button>)}
      </div>
    </div>
    {filtrados.length===0?<div className="empty-clients"><UserRound size={38}/><strong>Nenhum cliente encontrado</strong><span>Altere a busca ou os filtros.</span></div>:<div className="client-list">{filtrados.map(c=><Link href={`/clientes/${c.id}`} className="client-row" key={c.id}>{c.avatar_url?<img src={c.avatar_url} alt="" className="client-avatar"/>:<div className="client-avatar fallback"><UserRound size={22}/></div>}<div className="client-main"><strong>{c.name}</strong><span>{c.phone}</span></div><div className="client-extra"><span>{c.cpf||'CPF não informado'}</span><small className={c.active?'status-active':'status-inactive'}>{c.active?'Ativo':'Inativo'}</small></div></Link>)}</div>}
  </>;
}
