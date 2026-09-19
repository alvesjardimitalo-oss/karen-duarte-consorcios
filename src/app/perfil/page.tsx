import Link from 'next/link';
import { StaffNav } from '@/components/staff-nav';
import { ArrowLeft, Camera, ShieldCheck, UserRound } from 'lucide-react';
import { requireSession } from '@/modules/auth/session';
import { atualizarMeuPerfilAction } from './actions';
import { AvatarFileInput } from '@/components/avatar-file-input';

export default async function PerfilPage(){
  const {user,profile}=await requireSession();
  return <><StaffNav profile={profile} active="perfil"/><main className="clients-page with-app-nav"><div className="clients-wrap narrow"><header className="clients-header"><div><Link href="/" className="back-link"><ArrowLeft size={17}/> Dashboard</Link><p className="eyebrow">MINHA CONTA</p><h1>Meu perfil</h1><p className="muted">Personalize como você aparece dentro da plataforma.</p></div></header><section className="client-form-card profile-card"><form action={atualizarMeuPerfilAction} className="client-form"><label className="photo-field">{profile.avatar_url?<img src={profile.avatar_url} className="profile-avatar" alt=""/>:<div className="avatar-placeholder large"><UserRound size={42}/><span className="camera-badge"><Camera size={14}/></span></div>}<div><strong>Minha foto</strong><small>JPG, PNG ou WebP · fotos grandes são otimizadas automaticamente</small><AvatarFileInput/></div></label><div className="profile-role"><ShieldCheck size={18}/><div><span>Nível de acesso</span><strong>{profile.role}</strong></div></div><div className="form-grid"><label><span>Nome *</span><input name="nome" required defaultValue={profile.name}/></label><label><span>Telefone</span><input name="telefone" defaultValue={profile.phone??''}/></label><label className="full"><span>E-mail de acesso</span><input value={user.email??''} disabled/><small>O e-mail de autenticação não é alterado por esta tela.</small></label></div><button className="primary save-client" type="submit">Salvar meu perfil</button></form></section></div></main></>;
}
