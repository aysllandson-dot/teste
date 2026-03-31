import * as z from "zod";

export const evaluationSchema = z.object({
  employeeId: z.string().min(1, "Funcionário é obrigatório"),
  punctuality: z.number().min(1).max(5),
  organization: z.number().min(1).max(5),
  knowledge: z.number().min(1).max(5),
  proactivity: z.number().min(1).max(5),
  commitment: z.number().min(1).max(5),
});

export type EvaluationFormValues = z.infer<typeof evaluationSchema>;
