import { NextResponse } from 'next/server';
export const revalidate=21600;
const URL='https://www.boticario.com.br/promocao/mimo-do-dia';
function strip(v:string){return v.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim()}
export async function GET(){
 try{
  const r=await fetch(URL,{next:{revalidate:21600},headers:{'user-agent':'Mozilla/5.0 KarenMartinsPortal/1.0'}});
  if(!r.ok)throw new Error('source');
  const text=strip(await r.text());
  const title=(text.match(/(MIMO SURPRESA[^.]{0,100})/i)?.[1]||'Promoções O Boticário').trim();
  const period=text.match(/Promoção válida de (\d{2})\/(\d{2})\/(\d{4}) a (\d{2})\/(\d{2})\/(\d{4})/i);
  const end=period?`${period[6]}-${period[5]}-${period[4]}`:null;
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  if(end&&end<today)throw new Error('expired');
  const desc=(text.match(/Promoção válida[^.]*\.\s*([^.]*(?:mimo|desconto|OFF|oferta)[^.]*\.)/i)?.[1]||'Confira a campanha vigente e os produtos participantes no site oficial.').trim();
  return NextResponse.json({title,description:desc,url:URL,validUntil:end,source:'live'},{headers:{'Cache-Control':'public, s-maxage=21600, stale-while-revalidate=86400'}});
 }catch{
  return NextResponse.json({title:'Novidades O Boticário',description:'Confira as novidades e ofertas disponíveis neste ciclo.',url:'https://www.boticario.com.br/promocao',validUntil:null,source:'fallback'},{headers:{'Cache-Control':'public, s-maxage=3600'}});
 }
}