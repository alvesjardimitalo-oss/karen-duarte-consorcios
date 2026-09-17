# Arquitetura

## Princípio

Cada domínio deve concentrar suas próprias regras. Alterações de voucher não devem exigir edição do módulo de parcelas; mudanças visuais não devem alterar regras financeiras.

## Módulos

- `auth`: login por telefone, sessão, redefinição de senha.
- `usuarios`: ADMIN, RECEBEDOR/VENDEDOR e CLIENTE.
- `clientes`: perfil, CPF, telefone, endereço, tags e histórico.
- `consorcios`: turmas, limite de participantes, valor da parcela, duração e status.
- `participantes`: vínculo cliente/turma.
- `parcelas`: cronograma e situação mensal.
- `pagamentos`: recebimentos das parcelas e estornos.
- `sorteios`: calendário e contemplada de cada ciclo.
- `contemplacoes`: geração do direito de crédito sem quitar parcelas futuras.
- `fornecedores`: empresas e catálogos aceitos.
- `produtos`: catálogo e preços correntes.
- `vouchers`: carteira de crédito da contemplação.
- `resgates`: produtos efetivamente escolhidos, com fotografia histórica de preço.
- `pix`: diferença de compras que excedem o saldo do voucher.
- `auditoria`: trilha imutável das ações relevantes.

## Regras financeiras essenciais

1. Contemplação não quita parcelas futuras.
2. Crédito do voucher pode ser consumido em várias retiradas.
3. Compra pode exceder o saldo; a diferença gera PIX complementar.
4. PIX complementar nunca é contabilizado como parcela do consórcio.
5. Quando houver complemento pendente, o crédito usado no pedido fica reservado até confirmação ou cancelamento.
6. Pagamentos e resgates não são apagados silenciosamente; correções geram estorno/ajuste auditável.
7. Preço do item no resgate é preservado historicamente mesmo que o catálogo mude.

## Segurança

Autorização deve ser aplicada no servidor e no banco. A interface não é uma barreira de segurança. Dados pessoais e financeiros devem respeitar o menor privilégio, políticas por usuário, trilha de auditoria e segredos fora do repositório.
