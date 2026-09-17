'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      router.replace('/');
      router.refresh();
    } catch {
      setError('E-mail ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand"><div className="butterfly">♡</div><strong>Karen Martins</strong><span>COSMÉTICOS • CONSÓRCIOS</span></div>
        <div><p className="eyebrow">ÁREA SEGURA</p><h1>Bem-vinda!</h1><p className="muted">Entre para acompanhar turmas, parcelas, sorteios e contemplações.</p></div>
        <form onSubmit={handleSubmit} className="login-form">
          <label>E-mail<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com" /></label>
          <label>Senha<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Sua senha" /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary login-submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>
        <small className="muted">O acesso é individual. Nunca compartilhe sua senha.</small>
      </section>
    </main>
  );
}
