import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { teamSchema } from "@/lib/validations/team";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const team = await prisma.team.findUnique({
      where: { id: resolvedParams.id },
      include: {
        employees: true,
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Equipe não encontrada" }, { status: 404 });
    }

    return NextResponse.json(team);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = teamSchema.parse(body);

    const team = await prisma.team.update({
      where: { id: resolvedParams.id },
      data: {
        name: validatedData.name,
        sector: validatedData.sector || null,
        employees: {
          set: validatedData.employeeIds?.map((id) => ({ id })) || [],
        },
      },
    });

    return NextResponse.json(team);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Erro interno no servidor ao atualizar equipe" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    await prisma.team.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({ message: "Equipe removida com sucesso" });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno no servidor ao deletar equipe" },
      { status: 500 }
    );
  }
}
