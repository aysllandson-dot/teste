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
        <div className="glass-card hover-lift p-6 flex items-center justify-between group">
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Funcionários Ativos</span>
            <span className="text-4xl font-black text-[var(--color-primary)] dark:text-red-400 drop-shadow-sm">{totalEmployees}</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-[var(--color-primary)] dark:text-red-400 transition-transform duration-500 group-hover:rotate-12">
            <Users className="w-7 h-7" />
          </div>
        </div>

        <div className="glass-card hover-lift p-6 flex items-center justify-between group">
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Média das Avaliações</span>
            <span className="text-4xl font-black text-[var(--color-secondary)] drop-shadow-sm">
              {(avgData._avg.average || 0).toFixed(1)} <span className="text-2xl">★</span>
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-[var(--color-secondary)] transition-transform duration-500 group-hover:rotate-12">
            <Star className="w-7 h-7" />
          </div>
        </div>

        <div className="glass-card hover-lift p-6 flex items-center justify-between group">
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Total de Registros</span>
            <span className="text-4xl font-black text-slate-800 dark:text-slate-100 drop-shadow-sm">{totalEvaluations}</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-transform duration-500 group-hover:rotate-12">
            <MessageSquare className="w-7 h-7" />
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
