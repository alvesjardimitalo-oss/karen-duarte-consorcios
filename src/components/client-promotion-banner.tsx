'use client';
import { useEffect, useState } from 'react';
import { ExternalLink, Gift } from 'lucide-react';
type Promo={title:string;description:string;url:string;validUntil?:string|null;source:'live'|'fallback'};
export function ClientPromotionBanner(){
 const [promo,setPromo]=useState<Promo|null>(null);
 useEffect(()=>{fetch('/api/portal/promocao-boticario').then(r=>r.ok?r.json():null).then(setPromo).catch(()=>{})},[]);
 const p=promo??{title:'Novidades O Boticário',description:'Confira as novidades e ofertas disponíveis neste ciclo.',url:'https://www.boticario.com.br/promocao',source:'fallback' as const};
 return <a className="portal-promo-banner portal-promo-live" href={p.url} target="_blank" rel="noreferrer"><div className="promo-icon"><Gift size={28}/></div><div><small>DESTAQUE DO CICLO · O BOTICÁRIO</small><h2>{p.title}</h2><p>{p.description}</p>{p.validUntil&&<span>Válido até {new Date(p.validUntil+'T12:00:00').toLocaleDateString('pt-BR')}</span>}</div><ExternalLink className="promo-external" size={20}/></a>
}