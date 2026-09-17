'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setMessage('');
    if (password.length < 8) { setError('A nova senha deve ter pelo menos 8 caracteres.'); return; }
    if (password !== confirmPassword) { setError('As senhas não conferem.'); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setMessage('Senha alterada com sucesso. Entrando no sistema...');
      setTimeout(() => { router.replace('/'); router.refresh(); }, 900);
    } catch {
      setError('O link de recuperação é inválido ou expirou. Solicite um novo link.');
    } finally { setLoading(false); }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand"><div className="butterfly">♡</div><strong>Karen Martins</strong><span>COSMÉTICOS • CONSÓRCIOS</span></div>
        <div><p className="eyebrow">NOVA SENHA</p><h1>Redefinir senha</h1><p className="muted">Crie uma nova senha para acessar sua conta.</p></div>
        <form onSubmit={handleSubmit} className="login-form">
          <label>Nova senha<input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} placeholder="Mínimo de 8 caracteres" /></label>
          <label>Confirmar nova senha<input type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} placeholder="Digite novamente" /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          {message && <p role="status" style={{color:'#6b7f67',fontWeight:600}}>{message}</p>}
          <button className="primary login-submit" disabled={loading}>{loading ? 'Salvando...' : 'Redefinir senha'}</button>
        </form>
      </section>
    </main>
  );
}
