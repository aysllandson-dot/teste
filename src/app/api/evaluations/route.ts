import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { evaluationSchema } from "@/lib/validations/evaluation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = evaluationSchema.parse(body);

    const average = (
      validatedData.punctuality +
      validatedData.organization +
      validatedData.knowledge +
      validatedData.proactivity +
      validatedData.commitment
    ) / 5;

    const evaluation = await prisma.evaluation.create({
      data: {
        employeeId: validatedData.employeeId,
        supervisorId: (session.user as any).id,
        punctuality: validatedData.punctuality,
        organization: validatedData.organization,
        knowledge: validatedData.knowledge,
        proactivity: validatedData.proactivity,
        commitment: validatedData.commitment,
        average,
      },
    });

    return NextResponse.json(evaluation, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Erro interno no servidor ao registrar avaliação" },
      { status: 500 }
    );
  }
}
