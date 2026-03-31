import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import EvaluationActions from "@/components/evaluations/EvaluationActions";
import EmployeeAvatar from "@/components/employees/EmployeeAvatar";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

export default async function EvaluationsListPage() {
  const session = await getServerSession(authOptions);
  const currentUser = session?.user as any;

  const evaluations = await prisma.evaluation.findMany({
    include: {
      employee: { select: { fullName: true, role: true, sector: true, photoUrl: true } },
      supervisor: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Histórico de Avaliações</h1>
        <Link
          href="/dashboard/evaluations/new"
          className="bg-[var(--color-secondary)] hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova Avaliação
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-gray-300 font-semibold uppercase tracking-wide">
                <th className="p-4 text-[13px]">Data</th>
                <th className="p-4 text-[13px]">Funcionário</th>
                <th className="p-4 text-[13px]">Cargo</th>
                <th className="p-4 text-[13px]">Avaliador</th>
                <th className="p-4 text-[13px] text-center">Média</th>
                <th className="p-4 text-[13px] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm">
              {evaluations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    Nenhuma avaliação registrada ainda.
                  </td>
                </tr>
              ) : (
                evaluations.map((ev: any) => {
                  const canEdit = currentUser?.role === "ADMIN" || currentUser?.id === ev.supervisor.id;
                  
                  return (
                    <tr key={ev.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-medium text-gray-900 dark:text-gray-100 italic">
                        {format(new Date(ev.createdAt), "dd MMM yyyy", { locale: ptBR })}
                      </td>
                      <td className="p-4 text-gray-800 dark:text-gray-200 font-medium">
                        {ev.employee.fullName}
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">
                        {ev.employee.role}
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">
                        {ev.supervisor.name || ev.supervisor.email}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className={`font-black text-lg ${ev.average >= 4 ? 'text-green-600' : ev.average >= 3 ? 'text-yellow-600' : 'text-red-500'}`}>
                            {ev.average.toFixed(1)}
                          </span>
                          <span className="text-yellow-400 text-lg">★</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end">
                          <EvaluationActions evaluationId={ev.id} canEdit={canEdit} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
