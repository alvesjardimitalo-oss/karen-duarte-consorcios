import { CalendarDays, CheckCircle2, Clock3, Trophy, Users } from 'lucide-react';
import { requireAdminManager } from '@/modules/auth/session';
import { StaffNav } from '@/components/staff-nav';
import { criarSorteioAction, concluirSorteioAction } from './actions';

export default async function SorteiosPage() {
  const { supabase, profile } = await requireAdminManager();
  const [{ data: consortia }, { data: draws }, { data: members }] = await Promise.all([
    supabase.from('consortia').select('id,name,status').in('status', ['FORMACAO', 'ATIVO']).order('name'),
    supabase.from('draws').select('id,consortium_id,draw_number,scheduled_for,completed_at,winner_member_id,consortia(name,credit_amount)').order('scheduled_for', { ascending: true }),
    supabase.from('consortium_members').select('id,consortium_id,clients(name,phone),contemplations(id,vouchers(id,code,available_balance,status))').order('joined_at')
  ]);
  const cs=(consortia??[]) as any[], ds=(draws??[]) as any[], ms=(members??[]) as any[];
  const pending=ds.filter(d=>!d.completed_at), completed=ds.filter(d=>d.completed_at);
  const next=pending[0];

  return <main className="clients-page with-app-nav draws-page">
    <StaffNav profile={profile} active="sorteios"/>
    <div className="clients-wrap">
      <header className="clients-header draws-header">
        <div><p className="eyebrow">GESTÃO DE CONSÓRCIOS</p><h1>Sorteios</h1><p className="muted">Organize a agenda e registre as contemplações das turmas.</p></div>
        <div className="draws-summary">
          <span><CalendarDays size={18}/><b>{pending.length}</b><small>agendados</small></span>
          <span><Trophy size={18}/><b>{completed.length}</b><small>concluídos</small></span>
        </div>
      </header>

      {next && <section className="next-draw-card">
        <div className="next-draw-icon"><CalendarDays size={24}/></div>
        <div><p className="eyebrow">PRÓXIMO SORTEIO</p><h2>{next.consortia?.name} · Sorteio {next.draw_number}</h2><p>{new Date(next.scheduled_for+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})}</p></div>
        <span className="draw-status scheduled"><Clock3 size={15}/> Agendado</span>
      </section>}

      <section className="client-list-card draw-create-card">
        <div className="list-heading"><div><p className="eyebrow">NOVA DATA</p><h2>Agendar sorteio</h2><p className="muted">Escolha a turma e a data do próximo sorteio.</p></div></div>
        <form action={criarSorteioAction} className="draw-form-modern">
          <label><span>Turma</span><select name="consortium_id" required defaultValue=""><option value="" disabled>Selecione a turma</option>{cs.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
          <label><span>Data do sorteio</span><div className="draw-date-field"><CalendarDays size={18}/><input type="date" name="scheduled_for" required/></div></label>
          <button className="primary draw-submit"><CalendarDays size={17}/>Agendar sorteio</button>
        </form>
      </section>

      <section className="client-list-card">
        <div className="list-heading"><div><p className="eyebrow">AGENDA</p><h2>Sorteios da Karen</h2><p className="muted">{ds.length} registro{ds.length===1?'':'s'} na agenda.</p></div></div>
        <div className="draw-list-modern">{ds.length===0?<div className="empty-clients"><Trophy size={34}/><strong>Nenhum sorteio agendado</strong><span>Use o formulário acima para criar o primeiro.</span></div>:ds.map(d=>{
          const eligible=ms.filter(m=>m.consortium_id===d.consortium_id&&!(m.contemplations?.length));
          const winner=ms.find(m=>m.id===d.winner_member_id),voucher=winner?.contemplations?.[0]?.vouchers?.[0];
          return <article className={'draw-card-modern '+(d.completed_at?'is-completed':'')} key={d.id}>
            <div className="draw-card-date"><b>{new Date(d.scheduled_for+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit'})}</b><span>{new Date(d.scheduled_for+'T12:00:00').toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</span></div>
            <div className="draw-card-info"><span className={'draw-status '+(d.completed_at?'completed':'scheduled')}>{d.completed_at?<><CheckCircle2 size={14}/>Concluído</>:<><Clock3 size={14}/>Agendado</>}</span><h3>{d.consortia?.name} · Sorteio {d.draw_number}</h3><p><Users size={15}/>{eligible.length} participante{eligible.length===1?'':'s'} {eligible.length===1?'elegível':'elegíveis'}</p>{d.completed_at&&<strong className="winner-name"><Trophy size={15}/> Contemplado: {winner?.clients?.name??'—'}</strong>}{voucher&&<small className="draw-voucher-code">Voucher {voucher.code} · saldo {Number(voucher.available_balance).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</small>}</div>
            {!d.completed_at&&<form action={concluirSorteioAction} className="draw-winner-form-modern"><input type="hidden" name="draw_id" value={d.id}/><label><span>Contemplado</span><select name="winner_member_id" required defaultValue=""><option value="" disabled>Selecionar participante</option>{eligible.map(m=><option value={m.id} key={m.id}>{m.clients?.name}</option>)}</select></label><button className="primary"><Trophy size={16}/>Confirmar</button></form>}
          </article>})}</div>
      </section>
    </div>
  </main>;
}