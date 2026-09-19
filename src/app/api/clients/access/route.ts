import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdmin } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

const digits=(v:string)=>v.replace(/\D/g,'').replace(/^55(?=\d{10,11}$)/,'');
const makePassword=()=>`Karen@${crypto.getRandomValues(new Uint32Array(1))[0].toString().slice(0,6).padEnd(6,'7')}`;

export async function POST(req:NextRequest){
 const session=await createClient();
 const {data:{user}}=await session.auth.getUser();
 if(!user)return NextResponse.json({error:'Não autenticado.'},{status:401});
 const {data:me}=await session.from('profiles').select('role').eq('id',user.id).maybeSingle();
 if(!me||!['SUPER_ADMIN','ADMIN'].includes(me.role))return NextResponse.json({error:'Sem permissão.'},{status:403});
 const {clientId}=await req.json();
 const admin=createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{autoRefreshToken:false,persistSession:false}});
 const {data:client,error}=await admin.from('clients').select('id,name,phone,profile_id').eq('id',clientId).maybeSingle();
 if(error||!client)return NextResponse.json({error:'Cliente não encontrado.'},{status:404});
 const phone=digits(client.phone),authPhone='+55'+phone,password=makePassword();
 const {data:phoneProfile}=await admin.from('profiles').select('id,role').eq('phone',phone).maybeSingle();
 if(phoneProfile&&phoneProfile.id!==client.profile_id&&phoneProfile.role!=='CLIENTE')return NextResponse.json({error:'Este telefone já pertence a um acesso administrativo. Use outro telefone no cadastro do cliente para criar um acesso separado.'},{status:409});
 let uid=client.profile_id as string|null;
 if(uid){
   const {data:u,error:e}=await admin.auth.admin.getUserById(uid);
   if(e||!u.user)uid=null;
 }
 if(!uid){
   for(let page=1;page<=20&&!uid;page++){
     const {data:list,error:e}=await admin.auth.admin.listUsers({page,perPage:100});
     if(e)return NextResponse.json({error:'Falha ao consultar acessos.'},{status:500});
     const found=list.users.find(u=>digits(String(u.phone??''))===phone);
     if(found)uid=found.id;
     if(list.users.length<100)break;
   }
 }
 if(uid){
   const {error:e}=await admin.auth.admin.updateUserById(uid,{phone:authPhone,password,phone_confirm:true,user_metadata:{name:client.name}});
   if(e)return NextResponse.json({error:'Falha ao atualizar o acesso.'},{status:500});
 }else{
   const {data:created,error:e}=await admin.auth.admin.createUser({phone:authPhone,password,phone_confirm:true,user_metadata:{name:client.name}});
   if(e||!created.user)return NextResponse.json({error:'Falha ao criar o acesso.'},{status:500});
   uid=created.user.id;
 }
 const {error:pe}=await admin.from('profiles').upsert({id:uid,name:client.name,phone,role:'CLIENTE',active:true},{onConflict:'id'});
 if(pe)return NextResponse.json({error:'Falha ao vincular o perfil.'},{status:500});
 const {error:ce}=await admin.from('clients').update({profile_id:uid}).eq('id',client.id);
 if(ce)return NextResponse.json({error:'Falha ao vincular o cliente.'},{status:500});
 return NextResponse.json({ok:true,login:phone,password,name:client.name,phone});
}