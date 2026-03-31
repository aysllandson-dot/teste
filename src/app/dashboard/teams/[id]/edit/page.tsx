import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import TeamForm from "@/components/teams/TeamForm";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function EditTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard/teams");
  }

  const team = await prisma.team.findUnique({
    where: { id: resolvedParams.id },
    include: {
      employees: {
        select: { id: true, fullName: true, role: true }
      }
    }
  });

  if (!team) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar Equipe</h1>
        <p className="text-gray-500 mt-1">
          Atualize as informações da equipe ou modifique os integrantes alocados.
        </p>
      </div>

      <TeamForm initialData={team} />
    </div>
  );
}
