import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { punctuality, organization, knowledge, proactivity, commitment } = body;

    // Check ownership or admin
    const existingEvaluation = await prisma.evaluation.findUnique({
      where: { id },
    });

    if (!existingEvaluation) {
      return NextResponse.json({ error: "Avaliação não encontrada" }, { status: 404 });
    }

    const isAdmin = (session.user as any).role === "ADMIN";
    const isOwner = existingEvaluation.supervisorId === (session.user as any).id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Sem permissão para editar" }, { status: 403 });
    }

    const average = (punctuality + organization + knowledge + proactivity + commitment) / 5;

    const updatedEvaluation = await prisma.evaluation.update({
      where: { id },
      data: {
        punctuality,
        organization,
        knowledge,
        proactivity,
        commitment,
        average,
      },
    });

    return NextResponse.json(updatedEvaluation);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao atualizar avaliação" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Check ownership or admin
    const existingEvaluation = await prisma.evaluation.findUnique({
      where: { id },
    });

    if (!existingEvaluation) {
      return NextResponse.json({ error: "Avaliação não encontrada" }, { status: 404 });
    }

    const isAdmin = (session.user as any).role === "ADMIN";
    const isOwner = existingEvaluation.supervisorId === (session.user as any).id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Sem permissão para excluir" }, { status: 403 });
    }

    await prisma.evaluation.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Avaliação excluída com sucesso" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao excluir avaliação" },
      { status: 500 }
    );
  }
}
