import * as z from "zod";

export const teamSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres" }),
  sector: z.string().optional(),
  employeeIds: z.array(z.string()).optional(),
});
