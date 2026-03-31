import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { Users, Star, MessageSquare } from "lucide-react";
import EvaluationRadarChart from "@/components/evaluations/EvaluationRadarChart";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import EmployeeAvatar from "@/components/employees/EmployeeAvatar";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const [totalEmployees, totalEvaluations, recentComments] = await Promise.all([
    prisma.employee.count({ where: { status: "Ativo" } }),
    prisma.evaluation.count(),
    prisma.comment.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      include: { employee: { select: { fullName: true, photoUrl: true } } }
    })
  ]);

  const avgData = await prisma.evaluation.aggregate({
    _avg: {
      average: true,
      punctuality: true,
      organization: true,
      knowledge: true,
      proactivity: true,
      commitment: true,
    }
  });

  const dashboardRadarData = [
    {
      punctuality: avgData._avg.punctuality || 0,
      organization: avgData._avg.organization || 0,
      knowledge: avgData._avg.knowledge || 0,
      proactivity: avgData._avg.proactivity || 0,
      commitment: avgData._avg.commitment || 0,
      createdAt: new Date(),
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Central</h1>
        <div className="text-sm text-gray-500 hidden sm:block">
          Bem-vindo, <span className="font-semibold text-gray-900 dark:text-gray-100">{session?.user?.name || session?.user?.email}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total de Funcionários Ativos</span>
            <span className="text-3xl font-bold text-[var(--color-primary)] dark:text-blue-400">{totalEmployees}</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[var(--color-primary)] dark:text-blue-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Média Geral de Avaliações</span>
            <span className="text-3xl font-bold text-[var(--color-secondary)]">{(avgData._avg.average || 0).toFixed(1)} <span className="text-xl">★</span></span>
          </div>
          <div className="w-12 h-12 rounded-full bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center text-[var(--color-secondary)]">
            <Star className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total de Avaliações Feitas</span>
            <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">{totalEvaluations}</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold">Média das Competências (Todos)</h2>
          {totalEvaluations > 0 ? (
            <EvaluationRadarChart evaluations={dashboardRadarData} />
          ) : (
             <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
                Ainda não há dados suficientes.
             </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Últimas Observações</h2>
            <Link href="/dashboard/comments" className="text-sm text-[var(--color-primary)] dark:text-blue-400 font-medium hover:underline transition-all">Ver todas</Link>
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex-1">
            {recentComments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Nenhum comentário recente.</div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-slate-800">
                {recentComments.map((comment: any) => (
                  <li key={comment.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <EmployeeAvatar photoUrl={comment.employee.photoUrl} fullName={comment.employee.fullName} size="sm" />
                        <span className="font-semibold text-gray-900 dark:text-white">{comment.employee.fullName}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                         {format(new Date(comment.createdAt), "dd MMM, HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 px-1">"{comment.text}"</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
