'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length >= 12) return `+${digits}`;
  return `+55${digits}`;
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'cliente' | 'admin'>('cliente');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [activating, setActivating] = useState(false);
  const [activationMode, setActivationMode] = useState(false);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMode, setResetMode] = useState(false);

  function changeMode(next: 'cliente' | 'admin') {
    setMode(next); setIdentifier(''); setPassword(''); setError(''); setMessage('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setMessage(''); setLoading(true);
    try {
      const supabase = createClient();
      const credentials = mode === 'cliente'
        ? { phone: normalizePhone(identifier), password }
        : { email: identifier.trim(), password };
      const { error: authError } = await supabase.auth.signInWithPassword(credentials);
      if (authError) throw authError;
      router.replace(mode === 'cliente' ? '/portal' : '/');
      router.refresh();
    } catch {
      setError(mode === 'cliente' ? 'Telefone ou senha inválidos.' : 'E-mail ou senha inválidos.');
    } finally { setLoading(false); }
  }

  async function handleFirstAccess() {
    setError(''); setMessage('');
    const phone = normalizePhone(identifier);
    if (phone.length < 13) { setError('Digite seu telefone com DDD.'); return; }
    setRequesting(true);
    try {
      const supabase = createClient();
      const { data: requestState, error: requestError } = await supabase.rpc('request_client_access', { p_phone: phone });
      if (requestError) throw requestError;
      if (requestState === 'PENDING') {
        setMessage('Já existe uma liberação em andamento para este telefone. Se você já recebeu o código, informe-o abaixo e crie sua senha. Caso ainda não tenha recebido, aguarde a aprovação da administração.');
      } else {
        setMessage('Sua solicitação de inscrição na plataforma foi enviada. Aguarde a aprovação da administração e o recebimento do código. Quando receber, informe-o abaixo e crie sua senha.');
      }
      setResetMode(false);
      setCode('');
      setNewPassword('');
      setActivationMode(true);
    } catch {
      setError('Não foi possível solicitar o acesso agora.');
    } finally { setRequesting(false); }
  }

  async function handleActivation() {
    setError(''); setMessage('');
    if (!/^[0-9]{6}$/.test(code) || newPassword.length < 8) { setError('Informe o código de 6 dígitos e uma senha com pelo menos 8 caracteres.'); return; }
    setActivating(true);
    try {
      const supabase = createClient();
      const { data, error: invokeError } = await supabase.functions.invoke('activate-client-account', { body: { phone: normalizePhone(identifier), code, password: newPassword } });
      if (invokeError) {
        const response = (invokeError as any)?.context;
        if (response && typeof response.json === 'function') {
          try {
            const detail = await response.json();
            throw new Error(detail?.stage ? `${detail.error ?? 'Falha na ativação'} (${detail.stage})` : detail?.error ?? invokeError.message);
          } catch (parsed) {
            if (parsed instanceof Error && parsed.message !== invokeError.message) throw parsed;
          }
        }
        throw new Error(invokeError.message || 'Não foi possível concluir a ativação.');
      }
      if (data?.error) throw new Error(data?.stage ? `${data.error} (${data.stage})` : data.error);
      const { error: loginError } = await supabase.auth.signInWithPassword({ phone: normalizePhone(identifier), password: newPassword });
      if (loginError) throw loginError;
      router.replace('/portal'); router.refresh();
    } catch (activationError) {
      const detail = activationError instanceof Error ? activationError.message : String(activationError);
      setError(detail || 'Não foi possível concluir a ativação.');
    } finally { setActivating(false); }
  }

  async function requestClientReset() {
    setError(''); setMessage('');
    try {
      const supabase=createClient();
      const {error}=await supabase.rpc('request_client_password_reset',{p_phone:normalizePhone(identifier)});
      if(error) throw error;
      setResetMode(true); setActivationMode(false);
      setMessage('Se houver uma conta ativa para este telefone, a solicitação será encaminhada para aprovação.');
    } catch { setError('Não foi possível solicitar a recuperação para este telefone.'); }
  }

  async function completeClientReset() {
    setError(''); setMessage('');
    if(!/^[0-9]{6}$/.test(code)||newPassword.length<8){setError('Informe o código de 6 dígitos e uma senha com pelo menos 8 caracteres.');return;}
    setActivating(true);
    try{
      const response=await fetch('/api/auth/client-password-reset',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({phone:normalizePhone(identifier),code,password:newPassword})});
      const result=await response.json();
      if(!response.ok)throw new Error(result?.error||'Não foi possível redefinir a senha.');
      setResetMode(false);setCode('');setNewPassword('');setMessage('Senha alterada. Você já pode entrar com a nova senha.');
    }catch(e){setError(e instanceof Error?e.message:'Não foi possível redefinir a senha.');}
    finally{setActivating(false);}
  }

  async function handleRecovery() {
    setError(''); setMessage('');
    const normalizedEmail = identifier.trim();
    if (!normalizedEmail) { setError('Digite seu e-mail acima para redefinir a senha.'); return; }
    setRecovering(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/redefinir-senha`;
      const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, { redirectTo });
      if (recoveryError) throw recoveryError;
      setMessage('Enviamos um link de recuperação para o seu e-mail.');
    } catch (recoveryError) {
      const detail = recoveryError instanceof Error ? recoveryError.message : String(recoveryError);
      console.error('Erro ao solicitar recuperação de senha:', recoveryError);
      setError(`Falha na recuperação: ${detail}`);
    } finally { setRecovering(false); }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand"><img src="/karen-martins-logo.svg" alt="Karen Martins Cosméticos e Consórcios" className="official-login-logo"/></div>
        <div><p className="eyebrow">ÁREA SEGURA</p><h1>Bem-vinda!</h1><p className="muted">Entre para acompanhar turmas, parcelas, sorteios e contemplações.</p></div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          <button type="button" className={mode==='cliente'?'primary':'secondary'} onClick={()=>changeMode('cliente')}>Sou cliente</button>
          <button type="button" className={mode==='admin'?'primary':'secondary'} onClick={()=>changeMode('admin')}>Administração</button>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'cliente'
            ? <label>Telefone<input type="tel" inputMode="tel" autoComplete="tel" value={identifier} onChange={(e)=>setIdentifier(e.target.value)} required placeholder="(31) 99999-9999" /></label>
            : <label>E-mail<input type="email" autoComplete="email" value={identifier} onChange={(e)=>setIdentifier(e.target.value)} required placeholder="seu@email.com" /></label>}
          <label>Senha<input type="password" autoComplete="current-password" value={password} onChange={(e)=>setPassword(e.target.value)} required minLength={6} placeholder="Sua senha" /></label>
          {mode === 'admin' && <button type="button" onClick={handleRecovery} disabled={recovering} style={{background:'none',border:0,padding:0,color:'#d6457d',fontWeight:700,textAlign:'right',cursor:'pointer'}}>{recovering?'Enviando...':'Esqueci minha senha'}</button>}
          {mode === 'cliente' && !activationMode && <button type="button" onClick={handleFirstAccess} disabled={requesting} style={{background:'none',border:0,padding:0,color:'#d6457d',fontWeight:700,textAlign:'right',cursor:'pointer'}}>{requesting?'Enviando solicitação...':'Primeiro acesso / Solicitar ativação'}</button>}
          {mode === 'cliente' && !resetMode && <button type="button" onClick={()=>setActivationMode(v=>!v)} style={{background:'none',border:0,padding:0,color:'#6b7f67',fontWeight:700,textAlign:'right',cursor:'pointer'}}>{activationMode?'Voltar ao login':'Já tenho meu código de ativação'}</button>}
          {mode === 'cliente' && !activationMode && !resetMode && <button type="button" onClick={requestClientReset} style={{background:'none',border:0,padding:0,color:'#6b7f67',fontWeight:700,textAlign:'right',cursor:'pointer'}}>Esqueci minha senha</button>}
          {mode === 'cliente' && resetMode && <div style={{display:'grid',gap:10}}><label>Código de recuperação<input inputMode="numeric" maxLength={6} value={code} onChange={(e)=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" /></label><label>Nova senha<input type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} placeholder="Mínimo de 8 caracteres" /></label><button type="button" className="primary" disabled={activating} onClick={completeClientReset}>{activating?'Alterando...':'Definir nova senha'}</button><button type="button" onClick={()=>setResetMode(false)}>Voltar</button></div>}
          {mode === 'cliente' && activationMode && <div style={{display:'grid',gap:10}}><label>Código de ativação<input inputMode="numeric" maxLength={6} value={code} onChange={(e)=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" /></label><label>Crie sua senha<input type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} placeholder="Mínimo de 8 caracteres" /></label><button type="button" className="primary" disabled={activating} onClick={handleActivation}>{activating?'Ativando...':'Ativar minha conta'}</button></div>}
          {error && <p className="form-error" role="alert">{error}</p>}
          {message && <p role="status" style={{color:'#6b7f67',fontWeight:600}}>{message}</p>}
          <button className="primary login-submit" disabled={loading}>{loading?'Entrando...':'Entrar'}</button>
        </form>
        <small className="muted">O acesso é individual. Nunca compartilhe sua senha.</small>
      </section>
    </main>
  );
}
