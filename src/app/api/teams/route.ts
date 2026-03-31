import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { teamSchema } from "@/lib/validations/team";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const teams = await prisma.team.findMany({
      include: {
        employees: {
          include: {
            evaluations: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calcula a média visual da nota da equipe no retorno
    const teamsWithAverages = teams.map((team) => {
      let teamTotalAverage = 0;
      let evaluatedEmployeesCount = 0;

      team.employees.forEach((emp) => {
        if (emp.evaluations.length > 0) {
          // Extrai a média de avaliações desse funcionário
          const empAvg =
            emp.evaluations.reduce((acc, curr) => acc + curr.average, 0) /
            emp.evaluations.length;
          
          teamTotalAverage += empAvg;
          evaluatedEmployeesCount++;
        }
      });

      const finalTeamAverage =
        evaluatedEmployeesCount > 0
          ? teamTotalAverage / evaluatedEmployeesCount
          : 0;

      return {
        ...team,
        averageScore: Number(finalTeamAverage.toFixed(1)),
      };
    });

    return NextResponse.json(teamsWithAverages);
  } catch (error) {
    console.error("Erro ao buscar equipes:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = teamSchema.parse(body);

    const team = await prisma.team.create({
      data: {
        name: validatedData.name,
        sector: validatedData.sector || null,
        employees: {
          connect: validatedData.employeeIds?.map((id) => ({ id })) || [],
        },
      },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Erro ao criar equipe:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao criar equipe" },
      { status: 500 }
    );
  }
}
