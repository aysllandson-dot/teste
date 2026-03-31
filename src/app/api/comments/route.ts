import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
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
    const { employeeId, text, category } = body;

    if (!employeeId || !text) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        employeeId,
        supervisorId: (session.user as any).id,
        text,
        category: category || "Observação",
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro interno no servidor ao registrar comentário" },
      { status: 500 }
    );
  }
}
