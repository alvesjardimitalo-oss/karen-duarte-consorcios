import { NextResponse } from 'next/server';
export const revalidate=21600;
const ROOT='https://www.boticario.com.br/promocao';
const LEGACY=ROOT+'/mimo-do-dia';
function strip(v:string){return v.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/\s+/g,' ').trim()}
function today(){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
function parse(html:string,url:string){
 const text=strip(html);
 const period=text.match(/Promoção válida de (\d{2})\/(\d{2})\/(\d{4}) a (\d{2})\/(\d{2})\/(\d{4})/i);
 const end=period?`${period[6]}-${period[5]}-${period[4]}`:null;
 if(end&&end<today())return null;
 const raw=(text.match(/(MIMO SURPRESA[^.]{0,100})/i)?.[1]||text.match(/((?:ATÉ|GANHE|LEVE|COMPRE|DESCONTO|OFERTA)[^.]{12,90})/i)?.[1]||'Promoções O Boticário').trim();
 const title=raw.replace(/Promoção válida[\s\S]*$/i,'').replace(/\s+/g,' ').trim().slice(0,82);
 const desc=(text.match(/Promoção válida[^.]*\.\s*([^.]*(?:mimo|desconto|OFF|oferta|brinde)[^.]*\.)/i)?.[1]||'Confira a campanha vigente e os produtos participantes no site oficial.').trim().slice(0,180);
 return {title:title||'Promoções O Boticário',description:desc,url,validUntil:end,source:'live' as const};
}
async function get(url:string){const r=await fetch(url,{next:{revalidate:21600},headers:{'user-agent':'Mozilla/5.0 KarenMartinsPortal/1.0'}});if(!r.ok)return null;return {html:await r.text(),url}}
export async function GET(){
 try{
  const landing=await get(ROOT);
  if(landing){
   const links=[...landing.html.matchAll(/href=["']([^"']*\/promocao\/[^"'?#]+)[^"']*["']/gi)].map(m=>m[1]).map(v=>v.startsWith('http')?v:new URL(v,'https://www.boticario.com.br').toString());
   const unique=[...new Set(links)].filter(v=>!v.includes('/institucional/')).slice(0,8);
   for(const url of unique){const page=await get(url);if(page){const promo=parse(page.html,page.url);if(promo)return NextResponse.json(promo,{headers:{'Cache-Control':'public, s-maxage=21600, stale-while-revalidate=86400'}})}}
   const own=parse(landing.html,ROOT);if(own)return NextResponse.json(own,{headers:{'Cache-Control':'public, s-maxage=21600, stale-while-revalidate=86400'}});
  }
  const legacy=await get(LEGACY);if(legacy){const promo=parse(legacy.html,legacy.url);if(promo)return NextResponse.json(promo)}
 }catch{}
 return NextResponse.json({title:'Novidades O Boticário',description:'Confira as novidades e ofertas disponíveis neste ciclo.',url:ROOT,validUntil:null,source:'fallback'},{headers:{'Cache-Control':'public, s-maxage=3600'}});
}