"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { teamSchema } from "@/lib/validations/team";

type Employee = {
  id: string;
  fullName: string;
  role: string;
};

type TeamFormProps = {
  initialData?: {
    id: string;
    name: string;
    sector?: string | null;
    employees: Employee[];
  };
};

export default function TeamForm({ initialData }: TeamFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof teamSchema>>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: initialData?.name || "",
      sector: initialData?.sector || "",
      employeeIds: initialData?.employees.map((e) => e.id) || [],
    },
  });

  const selectedEmployeeIds = watch("employeeIds") || [];

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/employees");
        if (response.ok) {
          const data = await response.json();
          // Filter out inactive if needed, but for now just show all or active
          setEmployees(data);
        }
      } catch (err) {
        console.error("Erro ao carregar funcionários", err);
      }
    };
    fetchEmployees();
  }, []);

  const onSubmit = async (data: z.infer<typeof teamSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = initialData ? `/api/teams/${initialData.id}` : "/api/teams";
      const method = initialData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.error || "Ocorreu um erro ao salvar a equipe.");
      }

      router.push("/dashboard/teams");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEmployee = (id: string) => {
    const current = selectedEmployeeIds;
    if (current.includes(id)) {
      setValue(
        "employeeIds",
        current.filter((empId) => empId !== id),
        { shouldDirty: true }
      );
    } else {
      setValue("employeeIds", [...current, id], { shouldDirty: true });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-4xl">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome da Equipe *
        </label>
        <input
          {...register("name")}
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
          placeholder="Ex: Equipe Obra Alpha"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Obra / Setor de atuação
        </label>
        <input
          {...register("sector")}
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
          placeholder="Ex: Obra Residencial Parque - Setor Sul"
        />
        {errors.sector && (
          <p className="mt-1 text-sm text-red-600">{errors.sector.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Integrantes da Equipe
        </label>
        <p className="text-xs text-gray-500 mb-4">
          Selecione os funcionários que farão parte desta equipe. Eles terão suas notas compostas na média da equipe.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
          {employees.map((employee) => {
            const isSelected = selectedEmployeeIds.includes(employee.id);
            return (
              <div
                key={employee.id}
                onClick={() => toggleEmployee(employee.id)}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                  isSelected
                    ? "border-[var(--color-primary)] bg-red-50/50"
                    : "border-gray-200 hover:border-[var(--color-primary)]/50 hover:bg-gray-50"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {employee.fullName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {employee.role}
                  </p>
                </div>
                <div className="ml-3 flex-shrink-0">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? "bg-[var(--color-primary)] border-[var(--color-primary)]"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 text-sm font-medium text-white bg-[var(--color-primary)] border border-transparent rounded-md hover:bg-[var(--color-primary)]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:opacity-50"
        >
          {isLoading ? "Salvando..." : "Salvar Equipe"}
        </button>
      </div>
    </form>
  );
}
