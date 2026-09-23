-- Homologação de liberação 2026-09-23
-- Snapshot das correções aplicadas no projeto Supabase vqunstjzfrembtyoadqj.
-- Mantido no repositório para rastreabilidade; as migrations já foram aplicadas no banco.

-- 1) release_order_purchase_reservations:
-- corrigido lock inválido FOR UPDATE sobre o lado anulável de LEFT JOIN.
-- O lote agora é bloqueado separadamente antes da liberação da reserva.

-- 2) pagamentos de parcelas de consórcio em dinheiro:
alter table public.payments
  add column if not exists cash_session_id uuid
  references public.cash_sessions(id) on delete set null;

create index if not exists idx_payments_cash_session_id
  on public.payments(cash_session_id)
  where cash_session_id is not null;

-- confirm_installment_payment foi atualizada no banco para:
-- - exigir caixa aberto quando method = DINHEIRO;
-- - gravar cash_session_id no pagamento confirmado.
-- close_cash_session foi atualizada para incluir esses recebimentos no expected_cash.

-- 3) voucher usado no PDV:
-- finalize_order_voucher(uuid) + trigger de customer_orders finalizam reserved_balance
-- quando a venda muda para ENTREGUE. Cancelamento antes da entrega e devolução
-- depois da entrega preservam/restauram corretamente o crédito.

-- 4) hardening:
revoke execute on function public.finalize_order_voucher(uuid) from public, anon;
grant execute on function public.finalize_order_voucher(uuid) to authenticated;
revoke execute on function public.trg_finalize_voucher_on_delivered()
  from public, anon, authenticated;

-- Testes transacionais com ROLLBACK executados:
-- PDV PIX/FIFO/entrega/devolução; misto/parcelado/cancelamento;
-- voucher parcial/múltiplas compras/restauração;
-- encomenda->compra->recebimento->entrega;
-- baixa de parcela de consórcio;
-- parcela em DINHEIRO integrada ao caixa;
-- caixa com suprimento/sangria/despesa;
-- bloqueio de cliente em RPCs administrativas;
-- estoque insuficiente e divergências de composição/parcelamento.
