# Supabase database workflow

Este projeto já possui um banco remoto em produção. A baseline deve ser gerada pelo Supabase CLI a partir do banco remoto; não deve ser escrita manualmente.

## Primeira baseline

1. Execute `supabase init` na raiz do projeto.
2. Execute `supabase login`.
3. Vincule o projeto: `supabase link --project-ref vqunstjzfrembtyoadqj`.
4. Execute `supabase db pull` e revise o SQL gerado em `supabase/migrations/` antes do commit.
5. Valide com `supabase start` e `supabase db reset`.
6. Confira `supabase migration list --local`.

Não faça dump de dados reais de clientes para `seed.sql`. Seeds devem conter somente dados fictícios de desenvolvimento.

## Mudanças futuras

Faça alterações de banco de forma controlada, rode os advisors de segurança, gere/atualize migrations pelo CLI e valide um `db reset` local antes de enviar ao repositório.

## snapshots/

Os arquivos em `supabase/snapshots/` são referências auditáveis de objetos críticos observados no banco remoto durante a auditoria. Eles NÃO substituem a baseline produzida por `supabase db pull` e não devem ser aplicados como migration isoladamente sem revisar dependências de schema.
