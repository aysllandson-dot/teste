import { PrismaClient } from "@prisma/client";
import EvaluationForm from "@/components/evaluations/EvaluationForm";
import { notFound } from "next/navigation";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

export default async function EditEvaluationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
  });

  if (!evaluation) {
    notFound();
  }

  const employees = await prisma.employee.findMany({
    where: { status: "Ativo" },
    select: { id: true, fullName: true, role: true },
    orderBy: { fullName: "asc" }
  });

  const initialData = {
    employeeId: evaluation.employeeId,
    punctuality: evaluation.punctuality,
    organization: evaluation.organization,
    knowledge: evaluation.knowledge,
    proactivity: evaluation.proactivity,
    commitment: evaluation.commitment,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Editar Avaliação de Desempenho</h1>
        <p className="text-[var(--color-text-muted)] mt-1">
          Atualize as notas de competência do funcionário.
        </p>
      </div>
      
      <EvaluationForm 
        employees={employees} 
        evaluationId={evaluation.id}
        initialData={initialData}
      />
    </div>
  );
}
