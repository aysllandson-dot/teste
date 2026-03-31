import { PrismaClient } from "@prisma/client";
import EvaluationForm from "@/components/evaluations/EvaluationForm";

const prisma = new PrismaClient();

// Next.js 15
export const dynamic = "force-dynamic";

export default async function NewEvaluationPage({
  searchParams,
}: {
  searchParams: { employeeId?: string };
}) {
  const defaultEmployeeId = searchParams.employeeId || "";
  
  const employees = await prisma.employee.findMany({
    where: { status: "Ativo" },
    select: { id: true, fullName: true, role: true },
    orderBy: { fullName: "asc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nova Avaliação de Desempenho</h1>
        <p className="text-[var(--color-text-muted)] mt-1">
          Avalie as 5 competências principais do funcionário.
        </p>
      </div>
      
      <EvaluationForm employees={employees} defaultEmployeeId={defaultEmployeeId} />
    </div>
  );
}
