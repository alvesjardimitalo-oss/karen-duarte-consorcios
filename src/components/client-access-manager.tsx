'use client';
import { useState } from 'react';
import { KeyRound, MessageCircle } from 'lucide-react';

export function ClientAccessManager({clientId,hasAccess}:{clientId:string;hasAccess:boolean}){
 const [loading,setLoading]=useState(false),[error,setError]=useState(''),[credentials,setCredentials]=useState<{login:string,password:string,name:string,phone:string}|null>(null);
 async function generate(){
  setLoading(true);setError('');
  try{
   const r=await fetch('/api/clients/access',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({clientId})});
   const d=await r.json();if(!r.ok)throw new Error(d.error||'Falha ao gerar acesso.');
   setCredentials(d);
  }catch(e){setError(e instanceof Error?e.message:'Falha ao gerar acesso.')}finally{setLoading(false)}
 }
 function whatsapp(){
  if(!credentials)return;
  const number='55'+credentials.phone.replace(/\D/g,'');
  const msg=`Olá, ${credentials.name}! Seu acesso ao aplicativo Karen Martins está liberado.\n\nLogin: ${credentials.login}\nSenha temporária: ${credentials.password}\n\nPor segurança, altere sua senha depois de entrar.`;
  window.open(`https://wa.me/${number}?text=${encodeURIComponent(msg)}`,'_blank','noopener,noreferrer');
 }
 return <section className="client-list-card client-history-card">
  <div className="list-heading"><div><p className="eyebrow">ACESSO AO APLICATIVO</p><h2>{hasAccess?'Acesso ativo':'Acesso ainda não criado'}</h2></div><KeyRound size={22}/></div>
  <p className="muted">{hasAccess?'Você pode gerar uma nova senha e enviar ao cliente.':'Crie o login do cliente usando o telefone já cadastrado.'}</p>
  <button type="button" className="primary" onClick={generate} disabled={loading}>{loading?'Gerando...':hasAccess?'Gerar nova senha':'Criar acesso'}</button>
  {error&&<p className="form-error" role="alert">{error}</p>}
  {credentials&&<div style={{marginTop:16,padding:16,border:'1px solid #eadde3',borderRadius:14}}>
   <strong>Acesso pronto</strong><p style={{margin:'8px 0'}}>Login: <b>{credentials.login}</b><br/>Senha temporária: <b>{credentials.password}</b></p>
   <button type="button" className="primary" onClick={whatsapp}><MessageCircle size={17}/> Enviar pelo WhatsApp</button>
   <small className="muted" style={{display:'block',marginTop:8}}>A senha é exibida somente agora e não é salva no cadastro do cliente.</small>
  </div>}
 </section>;
}