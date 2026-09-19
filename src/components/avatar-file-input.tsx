'use client';
import { useState } from 'react';

const LIMIT=4.7*1024*1024;
async function compress(file:File){
 if(file.size<=LIMIT) return file;
 const bitmap=await createImageBitmap(file);
 let w=bitmap.width,h=bitmap.height;
 const max=1600;
 if(Math.max(w,h)>max){const scale=max/Math.max(w,h);w=Math.round(w*scale);h=Math.round(h*scale)}
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext('2d');if(!ctx) throw new Error('Não foi possível processar a foto.');
 ctx.drawImage(bitmap,0,0,w,h);bitmap.close();
 let quality=.82,blob:Blob|null=null;
 do{blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',quality));quality-=.1}while(blob&&blob.size>LIMIT&&quality>=.42);
 if(!blob||blob.size>LIMIT) throw new Error('Não foi possível reduzir a foto abaixo de 5 MB.');
 return new File([blob],file.name.replace(/\.[^.]+$/,'.jpg'),{type:'image/jpeg',lastModified:Date.now()});
}
export function AvatarFileInput(){const[status,setStatus]=useState('');return <div><input name="foto" type="file" accept="image/jpeg,image/png,image/webp" onChange={async e=>{const input=e.currentTarget,file=input.files?.[0];if(!file)return;try{setStatus(file.size>LIMIT?'Otimizando foto...':'');const optimized=await compress(file);if(optimized!==file){const dt=new DataTransfer();dt.items.add(optimized);input.files=dt.files;setStatus('Foto otimizada para envio.')}else setStatus('')}catch(err){input.value='';setStatus(err instanceof Error?err.message:'Erro ao processar a foto.')}}}/>{status&&<small className="photo-status">{status}</small>}</div>}
