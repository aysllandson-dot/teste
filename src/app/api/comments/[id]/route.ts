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
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: "Texto é obrigatório" }, { status: 400 });
    }

    // Check ownership or admin
    const existingComment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!existingComment) {
      return NextResponse.json({ error: "Comentário não encontrado" }, { status: 404 });
    }

    const isAdmin = (session.user as any).role === "ADMIN";
    const isOwner = existingComment.supervisorId === (session.user as any).id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Sem permissão para editar" }, { status: 403 });
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { text },
    });

    return NextResponse.json(updatedComment);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao atualizar comentário" },
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
    const existingComment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!existingComment) {
      return NextResponse.json({ error: "Comentário não encontrado" }, { status: 404 });
    }

    const isAdmin = (session.user as any).role === "ADMIN";
    const isOwner = existingComment.supervisorId === (session.user as any).id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Sem permissão para excluir" }, { status: 403 });
    }

    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Comentário excluído com sucesso" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao excluir comentário" },
      { status: 500 }
    );
  }
}
