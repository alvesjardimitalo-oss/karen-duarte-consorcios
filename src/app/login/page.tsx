'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [recovering, setRecovering] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (authError) throw authError;
      router.replace('/'); router.refresh();
    } catch {
      setError('E-mail ou senha inválidos.');
    } finally { setLoading(false); }
  }

  async function handleRecovery() {
    setError(''); setMessage('');
    const normalizedEmail = email.trim();
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
        <div className="login-brand"><img className="brand-logo login-logo" src="/karen-martins-consorcios.svg" alt="Karen Martins Cosméticos e Consórcios" /></div>
        <div><p className="eyebrow">ÁREA SEGURA</p><h1>Bem-vinda!</h1><p className="muted">Entre para acompanhar turmas, parcelas, sorteios e contemplações.</p></div>
        <form onSubmit={handleSubmit} className="login-form">
          <label>E-mail<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com" /></label>
          <label>Senha<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Sua senha" /></label>
          <button type="button" onClick={handleRecovery} disabled={recovering} style={{background:'none',border:0,padding:0,color:'#d6457d',fontWeight:700,textAlign:'right',cursor:'pointer'}}>{recovering ? 'Enviando...' : 'Esqueci minha senha'}</button>
          {error && <p className="form-error" role="alert">{error}</p>}
          {message && <p role="status" style={{color:'#6b7f67',fontWeight:600}}>{message}</p>}
          <button className="primary login-submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>
        <small className="muted">O acesso é individual. Nunca compartilhe sua senha.</small>
      </section>
    </main>
  );
}
