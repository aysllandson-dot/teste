import { PrismaClient } from "@prisma/client";
import { Download, FileText, Printer } from "lucide-react";
import PrintExportButtons from "@/components/reports/PrintExportButtons";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const employees = await prisma.employee.findMany({
    where: { status: "Ativo" },
    include: {
      evaluations: { select: { average: true } }
    }
  });

  const employeeRankings = employees.map((emp: any) => {
    const totalEvals = emp.evaluations.length;
    const avg = totalEvals > 0 
      ? emp.evaluations.reduce((sum: number, e: any) => sum + e.average, 0) / totalEvals 
      : 0;
    return { ...emp, generalAverage: avg, totalEvals };
  }).filter((e: any) => e.totalEvals > 0).sort((a: any, b: any) => b.generalAverage - a.generalAverage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-gray-500 text-sm mt-1">Ranking de desempenho e relatórios de avaliação.</p>
        </div>
        <PrintExportButtons data={employeeRankings} />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm print-section">
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50 rounded-t-xl">
          <h2 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <span className="text-yellow-500 text-xl">★</span> Ranking de Funcionários
          </h2>
          <span className="text-sm font-medium text-gray-500">Média Geral</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700 text-sm text-gray-500 bg-white dark:bg-slate-900">
                <th className="p-4 font-semibold w-16 text-center">Pos</th>
                <th className="p-4 font-semibold">Nome</th>
                <th className="p-4 font-semibold">Cargo</th>
                <th className="p-4 font-semibold text-center w-32">Avaliações</th>
                <th className="p-4 font-semibold text-center w-32">Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {employeeRankings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Não há dados suficientes para gerar o ranking.
                  </td>
                </tr>
              ) : (
                employeeRankings.map((emp: any, index: any) => (
                  <tr key={emp.id} className={index < 3 ? "bg-yellow-50/30 dark:bg-yellow-900/10" : ""}>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold
                        ${index === 0 ? 'bg-yellow-400 text-white' : 
                          index === 1 ? 'bg-gray-300 text-white' : 
                          index === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400'}`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-gray-900 dark:text-white">{emp.fullName}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400 text-sm">{emp.role}</td>
                    <td className="p-4 text-center text-gray-600 dark:text-gray-400">{emp.totalEvals}</td>
                    <td className="p-4 text-center">
                      <span className={`font-bold text-lg ${
                        emp.generalAverage >= 4.0 ? 'text-green-600 dark:text-green-500' : 
                        emp.generalAverage >= 3.0 ? 'text-yellow-600 dark:text-yellow-500' : 'text-red-600 dark:text-red-500'
                      }`}>
                        {emp.generalAverage.toFixed(2)}
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
  );
}
