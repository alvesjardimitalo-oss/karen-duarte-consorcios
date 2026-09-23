import 'server-only';import{createClient}from'@supabase/supabase-js';
const SOURCES=[
 {brand:'O Boticário',title:'Catálogo Digital O Boticário',url:'https://catalogo.boticario.com.br/',sort:10},
 {brand:'Eudora',title:'Catálogo Digital Eudora',url:'https://catalogo.eudora.com.br/',sort:20},
 {brand:'Avon',title:'Coleção Digital Avon',url:'https://www.avon.com.br/c/colecao-digital',sort:30}
];
function cycle(html:string){const text=html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');return text.match(/(?:Ciclo|ciclo)\s*(\d{1,2})(?:\s*[\/-]\s*(\d{4}))?/i)?.[0]??null}
async function check(s:(typeof SOURCES)[number]){const c=new AbortController(),timer=setTimeout(()=>c.abort(),12000);try{const r=await fetch(s.url,{cache:'no-store',signal:c.signal,headers:{'user-agent':'Mozilla/5.0 KarenMartinsRevistas/1.0','accept':'text/html,application/xhtml+xml'}});if(!r.ok)return{...s,ok:false,cycle:null,status:r.status};const html=await r.text();return{...s,ok:true,cycle:cycle(html),status:r.status}}catch{return{...s,ok:false,cycle:null,status:0}}finally{clearTimeout(timer)}}
export async function syncOfficialMagazines(){
 const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!);
 const checked=await Promise.all(SOURCES.map(check));let published=0,updated=0,failed=0;
 for(const s of checked){if(!s.ok){failed++;continue}
  const{data:existing}=await db.from('catalogs').select('id,active,cycle').eq('brand',s.brand).eq('view_url',s.url).maybeSingle();
  const row={brand:s.brand,title:s.title,cycle:s.cycle,view_url:s.url,download_url:null,active:true,sort_order:s.sort,updated_at:new Date().toISOString()};
  if(existing){const{error}=await db.from('catalogs').update(row).eq('id',existing.id);if(error)failed++;else updated++}
  else{const{error}=await db.from('catalogs').insert(row);if(error)failed++;else published++}
 }
 return{ok:failed===0,published,updated,failed,sources:checked.map(x=>({brand:x.brand,ok:x.ok,cycle:x.cycle,status:x.status}))};
}
