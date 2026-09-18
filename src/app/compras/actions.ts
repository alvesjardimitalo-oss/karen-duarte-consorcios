'use server';
import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/modules/auth/session';

const n=(v:FormDataEntryValue|null)=>Number(String(v??'').replace(',','.'))||0;

export async function salvarProdutoAction(formData:FormData){
 const{supabase}=await requireStaff(); const id=String(formData.get('id')??'').trim();
 const sku=String(formData.get('sku')??'').replace(/\\D/g,''),name=String(formData.get('name')??'').trim(),brand=String(formData.get('brand')??'').trim();
 if(!sku||!name||!brand)throw new Error('Código numérico, produto e marca são obrigatórios.');
 const payload={sku,source_code:String(formData.get('source_code')??sku).trim()||sku,name,brand,category:String(formData.get('category')??'').trim()||null,description:String(formData.get('description')??'').trim()||null,image_url:String(formData.get('image_url')??'').trim()||null,active:true,updated_at:new Date().toISOString()};
 const q=id?supabase.from('products').update(payload).eq('id',id):supabase.from('products').insert({...payload,price:0,sale_price:null,cost_price:null});
 const{error}=await q;if(error)throw new Error(error.message);revalidatePath('/compras');
}
export async function alternarProdutoAction(formData:FormData){const{supabase}=await requireStaff();const id=String(formData.get('id')),active=String(formData.get('active'))==='true';const{error}=await supabase.from('products').update({active:!active,updated_at:new Date().toISOString()}).eq('id',id);if(error)throw new Error(error.message);revalidatePath('/compras');}

export async function criarPedidoCompraAction(formData:FormData){
 const{supabase,profile}=await requireStaff();
 const supplierName=String(formData.get('supplier_name')??'').trim(), orderNumber=String(formData.get('order_number')??'').trim();
 const orderedAt=String(formData.get('ordered_at')??''), items=JSON.parse(String(formData.get('items_json')??'[]')), installments=JSON.parse(String(formData.get('installments_json')??'[]'));
 if(!supplierName||!orderedAt||!Array.isArray(items)||!items.length)throw new Error('Fornecedor, data e ao menos um produto são obrigatórios.');
 const{data:order,error}=await supabase.from('purchase_orders').insert({supplier_name:supplierName,order_number:orderNumber||null,ordered_at:orderedAt,status:'PEDIDO',payment_method:String(formData.get('payment_method')??'BOLETO'),notes:String(formData.get('notes')??'').trim()||null,created_by:profile.id}).select('id').single();
 if(error)throw new Error(error.message);
 const payload=items.map((i:any)=>({purchase_order_id:order.id,product_id:i.product_id,quantity:Number(i.quantity),unit_cost:Number(i.unit_cost),destination_type:i.destination_type||'ESTOQUE',voucher_id:i.voucher_id||null,client_id:i.client_id||null}));
 const{error:ie}=await supabase.from('purchase_order_items').insert(payload);if(ie)throw new Error(ie.message);const{error:ae}=await supabase.rpc('allocate_purchase_order_demands',{p_order:order.id});if(ae)throw new Error(ae.message);
 await supabase.rpc('recalculate_purchase_order_total',{p_order:order.id});
 if(Array.isArray(installments)&&installments.length){const{error:pe}=await supabase.from('accounts_payable').insert(installments.map((p:any,idx:number)=>({purchase_order_id:order.id,supplier_name:supplierName,description:`Pedido ${orderNumber||order.id.slice(0,8)} · parcela ${idx+1}`,installment_number:idx+1,due_date:p.due_date,amount:Number(p.amount)})));if(pe)throw new Error(pe.message);}
 revalidatePath('/compras');revalidatePath('/financeiro');revalidatePath('/estoque');revalidatePath('/pedidos/historico');
}
export async function receberPedidoCompraAction(formData:FormData){const{supabase}=await requireStaff();const id=String(formData.get('id'));const{error}=await supabase.rpc('receive_purchase_order',{p_order:id});if(error)throw new Error(error.message);revalidatePath('/compras');revalidatePath('/estoque');revalidatePath('/pedidos');revalidatePath('/pedidos/historico');revalidatePath('/portal/meus-pedidos');revalidatePath('/financeiro');}
