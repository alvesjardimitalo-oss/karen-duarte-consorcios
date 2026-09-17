import { z } from 'zod';

export const clienteSchema = z.object({
  nome: z.string().trim().min(3, 'Informe o nome completo'),
  telefone: z.string().trim().min(10, 'Informe um telefone válido'),
  cpf: z.string().trim().min(11, 'Informe um CPF válido'),
  endereco: z.string().trim().min(5, 'Informe o endereço'),
  tags: z.array(z.string().trim().min(1)).default([]),
});

export type ClienteInput = z.infer<typeof clienteSchema>;
