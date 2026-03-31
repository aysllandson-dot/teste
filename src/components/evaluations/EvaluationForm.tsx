"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { evaluationSchema, EvaluationFormValues } from "@/lib/validations/evaluation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Star } from "lucide-react";

export default function EvaluationForm({ 
  employees, 
  defaultEmployeeId,
  evaluationId,
  initialData
}: { 
  employees: { id: string, fullName: string, role: string }[],
  defaultEmployeeId?: string,
  evaluationId?: string,
  initialData?: Partial<EvaluationFormValues>
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      employeeId: initialData?.employeeId || defaultEmployeeId || "",
      punctuality: initialData?.punctuality || 3,
      organization: initialData?.organization || 3,
      knowledge: initialData?.knowledge || 3,
      proactivity: initialData?.proactivity || 3,
      commitment: initialData?.commitment || 3,
    },
  });

  const onSubmit = async (data: EvaluationFormValues) => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const url = evaluationId ? `/api/evaluations/${evaluationId}` : "/api/evaluations";
      const method = evaluationId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(evaluationId ? "Erro ao atualizar avaliação" : "Erro ao registrar avaliação");
      }

      router.push("/dashboard/evaluations");
      router.refresh();
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ name, label, description }: { name: keyof Omit<EvaluationFormValues, 'employeeId'>, label: string, description: string }) => {
    const value = watch(name);
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-800">
        <div className="mb-3 sm:mb-0">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{label}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setValue(name, star, { shouldValidate: true })}
              className={`p-1 transition-colors ${
                star <= value 
                  ? "text-[var(--color-secondary)]" 
                  : "text-gray-300 dark:text-slate-600 hover:text-yellow-400"
              }`}
            >
              <Star className="w-8 h-8 font-bold" fill={star <= value ? "currentColor" : "none"} strokeWidth={1.5} />
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-gray-200 dark:border-slate-800 p-6 md:p-8 max-w-4xl mx-auto">
      {errorMsg && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Selecionar Funcionário
          </label>
          <select 
            {...register("employeeId")} 
            className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
          >
            <option value="">Selecione um funcionário...</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.fullName} - {emp.role}
              </option>
            ))}
          </select>
          {errors.employeeId && <span className="text-red-500 text-xs mt-1 block">{errors.employeeId.message}</span>}
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-[var(--color-primary)] dark:text-blue-400 mb-2">Competências</h3>
          
          <StarRating 
            name="punctuality" 
            label="Pontualidade" 
            description="Chega no horário, cumpre prazos e cronogramas." 
          />
          <StarRating 
            name="organization" 
            label="Organização" 
            description="Mantém o local de trabalho limpo e ferramentas organizadas." 
          />
          <StarRating 
            name="knowledge" 
            label="Conhecimento" 
            description="Domínio técnico e qualidade na execução da função." 
          />
          <StarRating 
            name="proactivity" 
            label="Proatividade" 
            description="Iniciativa para resolver problemas e antecipar soluções." 
          />
          <StarRating 
            name="commitment" 
            label="Comprometimento" 
            description="Dedicação, responsabilidade com a segurança e com a equipe." 
          />
        </div>

        <div className="flex justify-end pt-6 mt-4 border-t border-gray-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 font-medium transition-colors mr-3 text-gray-700 dark:text-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[var(--color-primary)] hover:opacity-90 text-white px-8 py-2 rounded-lg font-medium transition-opacity flex items-center justify-center"
          >
            {isSubmitting ? (evaluationId ? "Atualizando..." : "Registrando...") : (evaluationId ? "Salvar Alterações" : "Registrar Avaliação")}
          </button>
        </div>
      </form>
    </div>
  );
}
