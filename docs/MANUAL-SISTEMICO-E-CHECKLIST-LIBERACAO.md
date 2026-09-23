# Manual sistêmico e checklist de liberação

Atualizado em 23/09/2026. Documento de operação, diagnóstico e limpeza antes da liberação.

## 1. Fluxo oficial do sistema

### Administração
1. Login da equipe.
2. Dashboard: turmas, clientes, parcelas, caixa, contas, pedidos e estoque.
3. Clientes: cadastrar/editar cliente e criar acesso ao portal.
4. Consórcios: manter grupos, participantes, parcelas, agenda e contemplações.
5. Sorteios: usar agenda oficial; meses já definidos não devem ser sorteados novamente.
6. Vouchers: crédito de contemplação é separado de receita. Pode ser consumido em uma ou várias compras.
7. Revistas: admin publica links oficiais; cliente visualiza no portal.
8. Pedidos do app: cliente envia itens; admin confere/orça; pagamento e entrega seguem o fluxo de venda.
9. PDV: venda direta, voucher, pagamento, parcelamento, estoque/encomenda e comprovante.
10. Histórico: venda concluída fica consultável e reimprimível.
11. Compras/estoque/financeiro: compras de fornecedor alimentam estoque e contas a pagar; venda alimenta recebimentos/parcelas.
12. Caixa: abrir antes da operação em dinheiro, registrar movimentos e fechar com conferência.

### Cliente
1. Login por telefone/senha.
2. Início: resumo de consórcios, parcelas, créditos e compras.
3. Parcelas: consultar vencimentos e situação.
4. Créditos: consultar vouchers e saldo.
5. Compras: histórico compacto, filtros e comprovantes.
6. Revistas: abrir revista publicada e montar pedido.
7. Notificações: ativação opcional no navegador.

## 2. Regras que são fonte de verdade

- Consórcio e venda de produto são domínios separados.
- Parcela do consórcio não é pagamento de compra.
- Voucher é crédito, não receita.
- Voucher pode ser usado parcialmente e em múltiplas compras.
- Diferença acima do voucher é cobrança separada.
- Histórico Revendi não pode inventar custo, lucro, preço unitário ou resgate.
- Candidato histórico PROVAVEL não conta como compra confirmada.
- Somente CONFIRMADO entra como resgate confirmado no portal.
- Estoque só aumenta quando existe composição/recebimento de compra confiável.
- Venda por encomenda não cria estoque fictício.
- Custos ausentes devem permanecer “não informados”, nunca zero fictício.
- Meses históricos/predeterminados de contemplação não devem ser randomizados.

## 3. Diagnóstico do banco em 23/09/2026

- 48 clientes ativos.
- 3 consórcios ativos; 50 vínculos de participantes.
- 500 parcelas; nenhum vínculo órfão encontrado.
- 15 sorteios e 15 contemplações.
- 267 produtos ativos.
- 2 vouchers atuais.
- 1 pedido/venda atual.
- 3 resgates históricos confirmados e 12 ainda em conferência.
- 3 revistas oficiais ativas.
- 0 compras de fornecedor, 0 lotes de estoque e 0 contas a pagar.
- 0 assinaturas push.
- A baixa de parcelas do consórcio foi homologada; pagamentos em DINHEIRO agora ficam vinculados ao caixa aberto.
- Não foram encontrados pedidos sem cliente, participantes órfãos ou parcelas órfãs.

## 4. Checklist funcional

Legenda: OK = código e estrutura presentes / ATENÇÃO = existe, mas precisa teste operacional com dados / BLOQUEADOR = corrigir antes da liberação / LEGADO = candidato a remoção após confirmar ausência de uso.

| Área | Estado | Diagnóstico |
|---|---|---|
| Autenticação staff | OK | Proteção por requireStaff/requireAdminManager presente. |
| Login cliente | OK | Portal vincula usuário ao cadastro de cliente. |
| Clientes | OK | Cadastro/edição e vínculo de acesso implementados. |
| Consórcios | OK | Estrutura ativa e participantes carregados. |
| Parcelas de consórcio | OK | Baixa homologada; pagamento confirmado e integração com caixa em DINHEIRO testados com rollback. |
| Agenda/sorteios | ATENÇÃO | 15 sorteios/contemplações; validar que agenda predeterminada nunca randomiza mês bloqueado. |
| Vouchers | OK | Uso parcial, múltiplas compras, cancelamento, entrega e devolução homologados com rollback. |
| Histórico Revendi | ATENÇÃO | 3 confirmados e 12 pendentes; manter separado do financeiro oficial até conferência. |
| Catálogo de produtos | OK | 267 produtos ativos. |
| Revistas | ATENÇÃO | 3 revistas oficiais ativas e sincronização automatizada; falta validação visual/runtime final no portal. |
| Pedido pelo portal | ATENÇÃO | Fluxo existe; testar pedido → orçamento → pagamento → entrega. |
| PDV | OK | PIX, FIFO, misto, parcelado, cancelamento, entrega e devolução homologados em cenários transacionais. |
| Venda parcelada | ATENÇÃO | Parcelas e comprovante implementados; testar pagamento parcial, vencimento e quitação. |
| Pagamento misto | OK | Composição de pagamentos e divergências de total testadas; valores inconsistentes são bloqueados. |
| Cancelamento/estorno | OK | Reversão financeira, liberação de reserva e idempotência verificadas. |
| Devolução | OK | Retorno ao estoque, estorno e restauração do voucher homologados. |
| Comprovante cliente | OK | Tela, impressão/PDF e PNG implementados. |
| Comprovante admin | ATENÇÃO | Reimpressão existente; validar visual e conteúdo contra comprovante cliente. |
| Compras fornecedor | ATENÇÃO | Estrutura/RPC existe, mas banco atual não tem compra real. |
| Estoque/lotes | OK | FIFO, reserva, consumo, estoque insuficiente e devolução homologados com dados sintéticos/rollback. |
| Contas a pagar | ATENÇÃO | Estrutura existe, sem registros reais para validar. |
| Caixa | OK | Abertura, suprimento, sangria, despesa, venda/parcela em dinheiro e fechamento homologados. |
| Push | ATENÇÃO | UI existe, porém 0 assinaturas no banco. |
| Auditoria | ATENÇÃO | Tabela existe com poucos registros; verificar cobertura das operações críticas. |
| PWA/mobile | ATENÇÃO | Manifest/registro presentes; testar instalação e navegação em aparelho real. |
| Build | OK | Vercel reportou build/deploy de produção com sucesso no commit verificado; nova checagem será feita após consolidação final. |
| Segurança RPC | OK | RPCs críticas revisadas; anon removido das rotinas administrativas testadas e cliente foi bloqueado em PDV/estoque administrativo. |

## 5. Lógicas legadas / duplicadas para inventário e limpeza

Não apagar diretamente em produção. Primeiro localizar chamadas no código e dependências no banco.

### Alta prioridade
- create_customer_order versus create_customer_order_v2: consolidar no v2 se a versão antiga não tiver chamadas.
- confirm_customer_order_payment versus confirm_customer_order_payment_v2: consolidar no v2 após localizar consumidores.
- create_pos_sale versus create_pos_sale_v2: consolidar no v2 após teste de PDV.
- Campos antigos pix_received/pix_amount convivendo com customer_order_payments/payment_breakdown: definir ledger oficial e manter campos antigos somente como compatibilidade durante migração.
- Fluxo histórico Revendi não deve alimentar automaticamente estoque/lucro/financeiro oficial.
- Push sem assinaturas: manter somente se será usado na liberação; caso contrário esconder UI até ativação real.

### Revisar antes de remover
- redemptions/redemption_items estão vazias enquanto o histórico usa historical_voucher_*.
- consortium_suppliers está vazia.
- ready_stock está vazia e inventory_lots é o modelo operacional de estoque; confirmar se ready_stock ainda é necessária.
- product_sync_runs está vazia e product_sync_queue possui fila; confirmar estratégia definitiva de sincronização.
- consortium_schedule_history está vazia; manter apenas se auditoria de trocas de mês for realmente utilizada.
- payments (consórcio) está vazia; NÃO remover até confirmar como a baixa de parcelas de consórcio será registrada.

## 6. Segurança antes da liberação

A revisão de liberação confirmou RLS habilitado nas tabelas operacionais e checagens internas de staff/admin nas RPCs críticas examinadas. Execução anon foi removida das rotinas administrativas revisadas. Os fluxos públicos de solicitação de acesso e recuperação de senha permanecem públicos intencionalmente por ocorrerem antes do login.

Também há:
- auth_rate_limits com RLS e sem policy — pode ser intencional se acesso for somente por função/service role.
- client_notification_events com RLS e sem policy — revisar se o portal precisa ler esses eventos.
- pg_net instalado no schema public — revisar conforme recomendação do Advisor.

## 7. Matriz mínima de testes de liberação

1. Admin: login/logout e bloqueio de rota sem sessão.
2. Cliente: login correto, senha errada, cadastro não vinculado.
3. Cliente: criar/editar e validar duplicidade de telefone.
4. Consórcio: participante, 10 parcelas, datas e regra especial de vencimento.
5. Parcela: pagar, impedir pagamento duplicado, vencida, reagendamento permitido.
6. Sorteio: agenda predeterminada, contemplação, emissão de voucher e impedir dupla contemplação.
7. Voucher: uso total, parcial, múltiplas compras, saldo insuficiente e cancelamento.
8. Pedido portal: enviar → orçamento → aprovação/pagamento → entrega → histórico.
9. PDV: PIX, dinheiro, cartão, parcelado e misto.
10. PDV + voucher: abaixo do saldo, igual ao saldo e acima do saldo.
11. Estoque: pronta entrega, reserva, FIFO, venda, cancelamento e devolução.
12. Encomenda: venda sem estoque → compra fornecedor → recebimento → separação → entrega.
13. Financeiro: contas a pagar, contas a receber, pagamento parcial e quitação.
14. Caixa: abrir, movimentar, vender em dinheiro, sangria e fechar.
15. Comprovante: cliente/admin, impressão 80mm, PDF e PNG.
16. Histórico: filtros, paginação e busca.
17. Revistas: publicar, ocultar, ordenar, abrir no portal.
18. Push: permissão aceita/negada e registro da assinatura.
19. Mobile: login, menu, PDV/portal e comprovantes.
20. Segurança: cliente não acessa outro cliente; cliente não executa RPC administrativa; staff sem privilégio não executa ação de admin.

## 8. Critério para soltar

Não liberar como “pronto” enquanto houver BLOQUEADOR. Para a primeira versão de produção, o mínimo é:
- build limpo;
- autenticação e autorização verificadas;
- RPCs administrativas protegidas;
- PDV/voucher/parcelamento testados;
- cancelamento/estorno consistente;
- estoque testado se for usado no lançamento;
- backup e plano de rollback;
- nenhum histórico PROVAVEL contabilizado como confirmado.

Depois disso, módulos sem dados reais (compras fornecedor, estoque, push, revistas) podem ser liberados somente após pelo menos um cenário controlado de homologação.


## 9. Homologação técnica de 23/09/2026

Foram executados cenários transacionais com ROLLBACK, sem persistir vendas, vouchers, estoque ou pagamentos de teste. Três falhas reais foram encontradas e corrigidas: liberação de reservas de compra no cancelamento, parcelas de consórcio em dinheiro fora do fechamento do caixa e voucher do PDV permanecendo reservado após a entrega.

Também foram verificados: cliente autenticado bloqueado em RPC administrativa, integridade sem órfãos, voucher parcial/múltiplas compras, estoque FIFO, encomenda até entrega, cancelamento/devolução, composição de pagamento, fechamento de caixa e RLS/SECURITY DEFINER. O snapshot das correções do banco está em `supabase/snapshots/2026-09-23-release-homologation.sql`.

Pendências finais antes de declarar a versão totalmente liberada: validação visual/runtime de login/portal/recibos/revistas/mobile, push em navegador real e nova confirmação do deploy após os commits de consolidação.
