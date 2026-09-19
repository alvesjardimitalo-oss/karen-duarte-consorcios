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
        <div className="login-brand"><div className="butterfly">♡</div><strong>Karen Martins</strong><span>COSMÉTICOS • CONSÓRCIOS</span></div>
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
          {mode === 'cliente' && <p className="muted" style={{margin:0}}>Primeiro acesso? A ativação segura da conta será disponibilizada aqui.</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
          {message && <p role="status" style={{color:'#6b7f67',fontWeight:600}}>{message}</p>}
          <button className="primary login-submit" disabled={loading}>{loading?'Entrando...':'Entrar'}</button>
        </form>
        <small className="muted">O acesso é individual. Nunca compartilhe sua senha.</small>
      </section>
    </main>
  );
}
