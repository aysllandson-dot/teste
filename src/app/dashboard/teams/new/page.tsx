import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import TeamForm from "@/components/teams/TeamForm";

export default async function NewTeamPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard/teams");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nova Equipe</h1>
        <p className="text-gray-500 mt-1">
          Crie uma nova equipe e aloque os funcionários. O desempenho será calculado com base nos membros.
        </p>
      </div>

      <TeamForm />
    </div>
  );
}
