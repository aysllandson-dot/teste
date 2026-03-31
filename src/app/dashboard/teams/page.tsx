import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, UsersRound, Trash2, Edit } from "lucide-react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getTeams() {
  const teams = await prisma.team.findMany({
    include: {
      employees: {
        include: { evaluations: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return teams.map((team) => {
    let teamTotalAverage = 0;
    let evaluatedEmployeesCount = 0;

    team.employees.forEach((emp) => {
      if (emp.evaluations.length > 0) {
        const empAvg =
          emp.evaluations.reduce((acc, curr) => acc + curr.average, 0) /
          emp.evaluations.length;
        teamTotalAverage += empAvg;
        evaluatedEmployeesCount++;
      }
    });

    return {
      ...team,
      averageScore: evaluatedEmployeesCount > 0 ? teamTotalAverage / evaluatedEmployeesCount : 0,
    };
  });
}

export default async function TeamsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const teams = await getTeams();
  const isAdmin = (session.user as any).role === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UsersRound className="w-6 h-6 text-[var(--color-primary)]" />
            Equipes
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gerencie as equipes de trabalho e visualize o desempenho coletivo.
          </p>
        </div>

        {isAdmin && (
          <Link
            href="/dashboard/teams/new"
            className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-primary)]/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Equipe</span>
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Nome da Equipe</th>
                <th className="px-6 py-4 font-medium">Setor / Obra</th>
                <th className="px-6 py-4 font-medium">Integrantes</th>
                <th className="px-6 py-4 font-medium">Pontuação (Média)</th>
                {isAdmin && <th className="px-6 py-4 font-medium text-right">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teams.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-6 py-8 text-center text-gray-500">
                    Nenhuma equipe cadastrada ainda.
                  </td>
                </tr>
              ) : (
                teams.map((team: any) => (
                  <tr key={team.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {team.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {team.sector || <span className="text-gray-400 text-xs italic">Não definido</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <UsersRound className="w-4 h-4 text-gray-400" />
                        {team.employees.length} funcionário(s)
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {team.employees.length === 0 ? (
                        <span className="text-gray-400 text-xs italic">Sem histórico</span>
                      ) : team.averageScore > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[100px]">
                            <div 
                              className="bg-[var(--color-secondary)] h-2.5 rounded-full" 
                              style={{ width: `${(team.averageScore / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className="font-semibold text-gray-700">{team.averageScore.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Sem avaliações</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right space-x-3">
                        <Link
                          href={`/dashboard/teams/${team.id}/edit`}
                          className="text-blue-600 hover:text-blue-900 font-medium inline-flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" /> Editar
                        </Link>
                        {/* Pode-se adicionar DeleteTeamButton depois */}
                      </td>
                    )}
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
