'use server';
import { revalidatePath } from 'next/cache';
import { requireStaff,requireAdminManager } from '@/modules/auth/session';

const n=(v:FormDataEntryValue|null)=>Number(String(v??'').replace(',','.'))||0;

export async function salvarProdutoAction(formData:FormData){
 const{supabase}=await requireAdminManager(); const id=String(formData.get('id')??'').trim();
 const sku=String(formData.get('sku')??'').replace(/\\D/g,''),name=String(formData.get('name')??'').trim(),brand=String(formData.get('brand')??'').trim();
 if(!sku||!name||!brand)throw new Error('Código numérico, produto e marca são obrigatórios.');
 const payload={sku,source_code:String(formData.get('source_code')??sku).trim()||sku,name,brand,category:String(formData.get('category')??'').trim()||null,description:String(formData.get('description')??'').trim()||null,image_url:String(formData.get('image_url')??'').trim()||null,image_status:String(formData.get('image_url')??'').trim()?'VERIFIED':'PENDING',image_checked_at:String(formData.get('image_url')??'').trim()?new Date().toISOString():null,active:true,updated_at:new Date().toISOString()};
 const q=id?supabase.from('products').update(payload).eq('id',id):supabase.from('products').insert({...payload,price:0,sale_price:null,cost_price:null});
 const{error}=await q;if(error)throw new Error(error.message);revalidatePath('/compras');
}
export async function alternarProdutoAction(formData:FormData){const{supabase}=await requireAdminManager();const id=String(formData.get('id')),active=String(formData.get('active'))==='true';const{error}=await supabase.from('products').update({active:!active,updated_at:new Date().toISOString()}).eq('id',id);if(error)throw new Error(error.message);revalidatePath('/compras');}

export async function criarPedidoCompraAction(formData:FormData){
 const{supabase,profile}=await requireAdminManager();
 const supplierName=String(formData.get('supplier_name')??'').trim(), orderNumber=String(formData.get('order_number')??'').trim();
 const orderedAt=String(formData.get('ordered_at')??''), items=JSON.parse(String(formData.get('items_json')??'[]')), installments=JSON.parse(String(formData.get('installments_json')??'[]'));
 if(!supplierName||!orderedAt||!Array.isArray(items)||!items.length)throw new Error('Fornecedor, data e ao menos um produto são obrigatórios.');if(items.some((i:any)=>!i.product_id||Number(i.quantity)<=0||Number(i.unit_cost)<0))throw new Error('Revise produto, quantidade e custo dos itens.');if(!Array.isArray(installments)||!installments.length)throw new Error('Informe ao menos um vencimento da compra.');const purchaseTotal=items.reduce((s:number,i:any)=>s+Number(i.quantity)*Number(i.unit_cost),0),payableTotal=installments.reduce((s:number,i:any)=>s+Number(i.amount||0),0);if(Math.abs(purchaseTotal-payableTotal)>0.02)throw new Error('O total das parcelas deve corresponder ao total da compra.');
 const{error}=await supabase.rpc('create_purchase_order_v2',{p_supplier_name:supplierName,p_order_number:orderNumber||null,p_ordered_at:orderedAt,p_payment_method:String(formData.get('payment_method')??'BOLETO'),p_notes:String(formData.get('notes')??'').trim()||null,p_items:items,p_installments:installments});if(error)throw new Error(error.message);
 revalidatePath('/compras');revalidatePath('/financeiro');revalidatePath('/estoque');revalidatePath('/pedidos/historico');
}
export async function receberPedidoCompraAction(formData:FormData){const{supabase}=await requireAdminManager();const id=String(formData.get('id'));const{error}=await supabase.rpc('receive_purchase_order',{p_order:id});if(error)throw new Error(error.message);revalidatePath('/compras');revalidatePath('/estoque');revalidatePath('/pedidos');revalidatePath('/pedidos/historico');revalidatePath('/portal/meus-pedidos');revalidatePath('/financeiro');}

export async function pagarContaFornecedorAction(formData:FormData){const{supabase}=await requireAdminManager();const id=String(formData.get('id')??''),method=String(formData.get('method')??'PIX');if(!id)throw new Error('Conta inválida.');const{error}=await supabase.rpc('pay_account_payable',{p_payable:id,p_method:method,p_amount:null});if(error)throw new Error(error.message);revalidatePath('/compras');revalidatePath('/financeiro');}
