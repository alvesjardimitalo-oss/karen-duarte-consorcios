import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdmin } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

const digits=(v:string)=>String(v??'').replace(/\D/g,'').replace(/^55(?=\d{10,11}$)/,'');
const makePassword=()=>{
  const n=crypto.getRandomValues(new Uint32Array(1))[0].toString().padStart(10,'0').slice(0,6);
  return `Karen@${n}`;
};

function message(error:unknown,fallback:string){
  return error instanceof Error && error.message ? error.message : fallback;
}

export async function POST(req:NextRequest){
 try{
  const session=await createClient();
  const {data:{user},error:userError}=await session.auth.getUser();
  if(userError||!user)return NextResponse.json({error:'Sua sessão expirou. Entre novamente.'},{status:401});

  const {data:me,error:profileError}=await session.from('profiles').select('role,active').eq('id',user.id).maybeSingle();
  if(profileError||!me?.active||!['SUPER_ADMIN','ADMIN'].includes(me.role)){
    return NextResponse.json({error:'Somente administradores podem criar acesso de clientes.'},{status:403});
  }

  const body=await req.json().catch(()=>({}));
  const clientId=String(body?.clientId??'').trim();
  if(!clientId)return NextResponse.json({error:'Cliente não informado.'},{status:400});

  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!serviceKey){
    console.error('[clients/access] Supabase admin env missing',{url:Boolean(url),serviceKey:Boolean(serviceKey)});
    return NextResponse.json({error:'Configuração administrativa do servidor ausente. Verifique SUPABASE_SERVICE_ROLE_KEY na Vercel.'},{status:500});
  }

  const admin=createAdmin(url,serviceKey,{auth:{autoRefreshToken:false,persistSession:false,detectSessionInUrl:false}});
  const {data:client,error:clientError}=await admin.from('clients').select('id,name,phone,profile_id,active').eq('id',clientId).maybeSingle();
  if(clientError)throw new Error(`Falha ao consultar cliente: ${clientError.message}`);
  if(!client)return NextResponse.json({error:'Cliente não encontrado.'},{status:404});
  if(!client.active)return NextResponse.json({error:'Ative o cadastro do cliente antes de criar o acesso.'},{status:409});

  const phone=digits(client.phone);
  if(!/^\d{10,11}$/.test(phone))return NextResponse.json({error:'O telefone do cliente precisa ter DDD e 10 ou 11 dígitos.'},{status:400});
  const authPhone=`+55${phone}`;
  const password=makePassword();

  const {data:phoneProfiles,error:phoneProfileError}=await admin.from('profiles').select('id,role').eq('phone',phone);
  if(phoneProfileError)throw new Error(`Falha ao validar telefone: ${phoneProfileError.message}`);
  const conflicting=(phoneProfiles??[]).find(p=>p.id!==client.profile_id);
  if(conflicting&&conflicting.role!=='CLIENTE'){
    return NextResponse.json({error:'Este telefone já pertence a um acesso administrativo. Use outro telefone no cadastro do cliente.'},{status:409});
  }

  let uid=client.profile_id as string|null;
  if(uid){
    const {data:u}=await admin.auth.admin.getUserById(uid);
    if(!u?.user)uid=null;
  }

  if(!uid){
    let page=1;
    while(!uid){
      const {data:list,error:listError}=await admin.auth.admin.listUsers({page,perPage:100});
      if(listError)throw new Error(`Falha ao consultar usuários: ${listError.message}`);
      const found=list.users.find(u=>digits(String(u.phone??''))===phone);
      if(found)uid=found.id;
      if(found||list.users.length<100)break;
      page++;
      if(page>100)break;
    }
  }

  if(uid){
    const {error:updateError}=await admin.auth.admin.updateUserById(uid,{
      phone:authPhone,password,phone_confirm:true,
      user_metadata:{name:client.name,client_id:client.id}
    });
    if(updateError)throw new Error(`Falha ao atualizar usuário: ${updateError.message}`);
  }else{
    const {data:created,error:createError}=await admin.auth.admin.createUser({
      phone:authPhone,password,phone_confirm:true,
      user_metadata:{name:client.name,client_id:client.id}
    });
    if(createError||!created.user)throw new Error(`Falha ao criar usuário: ${createError?.message??'usuário não retornado pelo Auth'}`);
    uid=created.user.id;
  }

  const {error:profileUpsertError}=await admin.from('profiles').upsert({
    id:uid,name:client.name,phone,role:'CLIENTE',active:true
  },{onConflict:'id'});
  if(profileUpsertError)throw new Error(`Usuário criado, mas o perfil não pôde ser vinculado: ${profileUpsertError.message}`);

  const {data:linked,error:linkError}=await admin.from('clients').update({profile_id:uid}).eq('id',client.id).select('id,profile_id').maybeSingle();
  if(linkError||!linked)throw new Error(`Usuário criado, mas o cliente não pôde ser vinculado: ${linkError?.message??'nenhuma linha atualizada'}`);

  return NextResponse.json({ok:true,login:phone,password,name:client.name,phone,hasAccess:true});
 }catch(error){
  console.error('[clients/access]',error);
  return NextResponse.json({error:message(error,'Não foi possível criar o acesso do cliente.')},{status:500});
 }
}
