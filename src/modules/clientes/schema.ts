import { z } from 'zod';

const opcional = z.string().trim().optional().default('');

export const clienteSchema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome do cliente'),
  telefone: z.string().trim().min(10, 'Informe um telefone válido'),
  cpf: opcional,
  endereco: opcional,
  tags: z.array(z.string().trim().min(1)).default([]),
  avatarUrl: z.string().trim().optional().default(''),
});

export type ClienteInput = z.infer<typeof clienteSchema>;
