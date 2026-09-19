'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage(){
 const router=useRouter();
 const[mode,setMode]=useState<'cliente'|'admin'>('cliente');
 const[login,setLogin]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(false);
 function changeMode(next:'cliente'|'admin'){setMode(next);setLogin('');setPassword('');setError('')}
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setError('');setLoading(true);
  try{
   const supabase=createClient();
   if(mode==='cliente'){
    let d=login.replace(/\D/g,'');if(d.startsWith('55')&&d.length>=12)d=d.slice(2);
    const{error:a}=await supabase.auth.signInWithPassword({phone:'+55'+d,password});if(a)throw a;
   }else{
    const{error:a}=await supabase.auth.signInWithPassword({email:login.trim(),password});if(a)throw a;
   }
   router.replace('/');router.refresh();
  }catch{setError(mode==='cliente'?'Telefone ou senha inválidos.':'E-mail ou senha inválidos.')}finally{setLoading(false)}
 }
 return <main className="login-page"><section className="login-card">
  <div className="login-brand"><div className="butterfly">♡</div><strong>Karen Martins</strong><span>COSMÉTICOS • CONSÓRCIOS</span></div>
  <div><p className="eyebrow">{mode==='cliente'?'ÁREA DO CLIENTE':'ÁREA ADMINISTRATIVA'}</p><h1>{mode==='cliente'?'Bem-vinda!':'Acesso da equipe'}</h1><p className="muted">{mode==='cliente'?'Entre com o telefone e a senha enviados pela Karen.':'Entre com seu e-mail e senha de administrador.'}</p></div>
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
   <button type="button" className={mode==='cliente'?'primary':''} onClick={()=>changeMode('cliente')}>Cliente</button>
   <button type="button" className={mode==='admin'?'primary':''} onClick={()=>changeMode('admin')}>Admin</button>
  </div>
  <form onSubmit={submit} className="login-form">
   <label>{mode==='cliente'?'Telefone':'E-mail'}<input type={mode==='cliente'?'tel':'email'} autoComplete={mode==='cliente'?'tel':'email'} value={login} onChange={e=>setLogin(e.target.value)} required placeholder={mode==='cliente'?'(33) 99999-9999':'admin@exemplo.com'}/></label>
   <label>Senha<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} placeholder="Sua senha"/></label>
   {error&&<p className="form-error" role="alert">{error}</p>}
   <button className="primary login-submit" disabled={loading}>{loading?'Entrando...':'Entrar'}</button>
  </form>
  {mode==='cliente'&&<small className="muted">Ainda não recebeu seu acesso? Fale com a Karen.</small>}
 </section></main>;
}