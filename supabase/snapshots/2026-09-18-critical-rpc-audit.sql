-- AUDIT SNAPSHOT — critical RPC security contract
-- Reference only. Generate the real baseline with: supabase db pull
-- Project: vqunstjzfrembtyoadqj
-- Audited: 2026-09-18

-- Expected privileged RPC exposure after audit:
-- * anon: no EXECUTE on SECURITY DEFINER RPCs
-- * authenticated: only user/staff-facing RPCs
-- * internal helpers: no authenticated EXECUTE unless explicitly required

-- Critical business rules verified in the remote database:
-- complete_draw(uuid,uuid): ADMIN/SUPER_ADMIN only; active consortium/member; voucher; finalization.
-- swap_consortium_schedule(uuid,uuid): ADMIN/SUPER_ADMIN only; same group; locked schedule; draw synchronization; audit.
-- create_new_group_from_finished_consortium(...): ADMIN/SUPER_ADMIN only; source FINALIZADO; validated schedule and reused clients.
-- create_customer_order(uuid,uuid,jsonb): active client; owner-or-staff; 1..50 items; required fields; quantity 1..100.
-- pay_customer_order_installment(uuid,text): staff only; row lock; open cash required for cash; ledger + audit.
-- return_delivered_pos_sale(uuid,text): staff only; inventory trace; payment/voucher reversal; cancels PENDENTE and VENCIDA debt.
-- reverse_pos_payments(uuid): internal helper; direct authenticated EXECUTE revoked.
-- open_cash_session/add_cash_movement/close_cash_session: staff-only cash controls.

-- Before treating this repository as reproducible, pull the complete remote schema into supabase/migrations and verify db reset locally.
