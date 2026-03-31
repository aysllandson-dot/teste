import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import { Plus, Search, Filter } from "lucide-react";
import { format } from "date-fns";

import EmployeeAvatar from "@/components/employees/EmployeeAvatar";

const prisma = new PrismaClient();

// Next.js 15: searchParams is considered async if accessed dynamically a lot, but for simple use cases this signature works.
export const dynamic = "force-dynamic";

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const statusFilter = typeof params.status === "string" ? params.status : "";

  const employees = await prisma.employee.findMany({
    where: {
      fullName: { contains: query },
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    select: {
      id: true,
      fullName: true,
      role: true,
      sector: true,
      obra: true,
      team: {
        select: { name: true, sector: true }
      },
      admissionDate: true,
      status: true,
      photoUrl: true,
    },
    orderBy: { fullName: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Funcionários</h1>
        <Link
          href="/dashboard/employees/new"
          className="bg-[var(--color-primary)] hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Funcionário
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 shadow-sm">
        <form className="relative flex-1" action="/dashboard/employees" method="GET">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            name="q"
            defaultValue={query}
            placeholder="Buscar por nome..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-gray-300 font-semibold uppercase tracking-wide">
                <th className="p-4">Nome</th>
                <th className="p-4">Função</th>
                <th className="p-4">Setor</th>
                <th className="p-4">Obra</th>
                <th className="p-4">Equipe</th>
                <th className="p-4 hidden sm:table-cell">Admissão</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    Nenhum funcionário encontrado.
                  </td>
                </tr>
              ) : (
                employees.map((emp: any) => (
                  <tr key={emp.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <EmployeeAvatar photoUrl={emp.photoUrl} fullName={emp.fullName} size="sm" />
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{emp.fullName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">{emp.role}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400 font-medium">
                      {emp.sector}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-400 font-medium">
                      {emp.team?.sector || emp.obra || "-"}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">
                      {emp.team ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-medium text-xs border border-blue-100">
                          {emp.team.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Sem equipe</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-400 hidden sm:table-cell">
                      {format(new Date(emp.admissionDate), "dd/MM/yyyy")}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 text-xs rounded-full font-medium ${
                        emp.status === "Ativo" 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : emp.status === "Inativo"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-[var(--color-secondary)] text-white opacity-90"
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-3">
                      <Link href={`/dashboard/employees/${emp.id}`} className="text-[var(--color-primary)] dark:text-blue-400 hover:underline font-medium">Ver</Link>
                      <Link href={`/dashboard/evaluations/new?employeeId=${emp.id}`} className="text-[var(--color-secondary)] hover:text-yellow-600 font-medium transition-colors">Avaliar</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
