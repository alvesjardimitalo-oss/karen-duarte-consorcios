'use server';
import{revalidatePath}from'next/cache';
import{requireStaff}from'@/modules/auth/session';
export async function salvarProntaEntregaAction(formData:FormData){
 const{supabase}=await requireStaff();
 const product_id=String(formData.get('product_id')??''),raw=String(formData.get('sale_price')??'').replace(',','.'),sale_price=raw===''?null:Number(raw),visible=formData.get('visible')==='on';
 if(!product_id)throw new Error('Produto inválido.');
 if(sale_price!==null&&(!Number.isFinite(sale_price)||sale_price<0))throw new Error('Preço de venda inválido.');
 const{error}=await supabase.from('ready_stock').upsert({product_id,sale_price,visible,updated_at:new Date().toISOString()},{onConflict:'product_id'});
 if(error)throw new Error(error.message);
 revalidatePath('/estoque');revalidatePath('/financeiro');
}