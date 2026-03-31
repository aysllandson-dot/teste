import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import DeleteEmployeeButton from "@/components/employees/DeleteEmployeeButton";
import EvaluationRadarChart from "@/components/evaluations/EvaluationRadarChart";

const prisma = new PrismaClient();

export default async function EmployeeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      team: { 
        select: { name: true, sector: true } 
      },
      evaluations: {
        orderBy: { createdAt: "desc" },
        include: { supervisor: { select: { name: true } } }
      }
    }
  });

  if (!employee) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/employees" className="p-2 border border-gray-200 dark:border-slate-700 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Detalhes do Funcionário</h1>
        </div>
        <div className="flex gap-3">
          <DeleteEmployeeButton id={employee.id} />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-gray-200 dark:border-slate-800 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
        {/* Foto do Funcionário na lateral */}
        <div className="flex-shrink-0">
          <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 flex items-center justify-center">
            {employee.photoUrl ? (
              <img src={employee.photoUrl} alt={employee.fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-gray-300 dark:text-slate-700">
                <Plus className="w-8 h-8 opacity-20" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Sem Foto</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Nome Completo</h3>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{employee.fullName}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</h3>
            <span className={`inline-flex px-3 py-1 text-sm rounded-full font-medium ${
                        employee.status === "Ativo" 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : employee.status === "Inativo"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-[var(--color-secondary)]/20 text-[var(--color-secondary)] dark:text-yellow-500"
                      }`}>
                 {employee.status}
            </span>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Função/Cargo</h3>
            <p className="text-md text-gray-800 dark:text-gray-200">{employee.role}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Setor</h3>
            <p className="text-md text-gray-800 dark:text-gray-200">
              {employee.sector}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Obra</h3>
            <p className="text-md text-gray-800 dark:text-gray-200">
              {employee.team?.sector || employee.obra || "Não informado"}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Equipe de Trabalho</h3>
            {employee.team ? (
              <p className="text-md text-[var(--color-primary)] font-semibold">
                {employee.team.name}
              </p>
            ) : (
              <p className="text-md text-gray-400 italic">Sem equipe</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Data de Admissão</h3>
            <p className="text-md text-gray-800 dark:text-gray-200">
              {employee.admissionDate ? format(new Date(employee.admissionDate), "dd/MM/yyyy") : "Não informada"}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">CPF</h3>
            <p className="text-md text-gray-800 dark:text-gray-200">{employee.cpf || "Não informado"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <EvaluationRadarChart evaluations={employee.evaluations} />
        </div>
        
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Histórico de Avaliações</h2>
            <Link 
              href={`/dashboard/evaluations/new?employeeId=${employee.id}`}
              className="text-sm bg-blue-50 text-[var(--color-primary)] hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Nova Avaliação
            </Link>
          </div>
          
          <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400">
                  <th className="p-3 font-medium">Data</th>
                  <th className="p-3 font-medium">Avaliador</th>
                  <th className="p-3 font-medium text-center">Média</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {employee.evaluations.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-gray-500">
                      Nenhuma avaliação registrada
                    </td>
                  </tr>
                ) : (
                  employee.evaluations.map((ev: any) => (
                    <tr key={ev.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 text-gray-700 dark:text-gray-300">
                        {format(new Date(ev.createdAt), "dd MMM yyyy", { locale: ptBR })}
                      </td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">
                        {ev.supervisor.name || "Supervisor"}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`font-bold ${ev.average >= 4 ? 'text-green-600' : ev.average >= 3 ? 'text-yellow-600' : 'text-red-500'}`}>
                          {ev.average.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
