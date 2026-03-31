import * as z from "zod";

export const employeeSchema = z.object({
  // Obrigatórios
  fullName: z.string().min(3, "Nome completo é obrigatório"),
  gender: z.enum(["Masculino", "Feminino", "Outro"], {
    message: "Selecione o sexo",
  }),
  role: z.string().min(1, "Função é obrigatória"),
  sector: z.string().min(1, "Setor é obrigatório"),
  status: z.enum(["Ativo", "Inativo", "Afastado"], {
    message: "Selecione o status",
  }),

  // Opcionais
  obra: z.string().optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  cpf: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  street: z.string().optional().or(z.literal("")),
  number: z.string().optional().or(z.literal("")),
  neighborhood: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  zipCode: z.string().optional().or(z.literal("")),
  admissionDate: z.string().optional().or(z.literal("")),
  photoUrl: z.string().optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
