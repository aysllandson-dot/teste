import { PrismaClient } from "@prisma/client";
import CommentForm from "@/components/comments/CommentForm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { MessageSquare } from "lucide-react";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CommentActions from "@/components/comments/CommentActions";
import EmployeeAvatar from "@/components/employees/EmployeeAvatar";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

export default async function CommentsPage() {
  const session = await getServerSession(authOptions);
  const currentUser = session?.user as any;

  const employees = await prisma.employee.findMany({
    where: { status: "Ativo" },
    select: { id: true, fullName: true },
    orderBy: { fullName: "asc" }
  });

  const comments = await prisma.comment.findMany({
    include: {
      employee: { select: { fullName: true, photoUrl: true } },
      supervisor: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case "Elogio": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
      case "Advertência": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      case "Sugestão": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Comentários e Observações</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <CommentForm employees={employees} />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[var(--color-secondary)]" />
            Histórico Recente
          </h2>
          
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-gray-200 dark:border-slate-800 text-center text-gray-500">
                Ainda não há observações registradas.
              </div>
            ) : (
              comments.map((comment: any) => {
                const canEdit = currentUser?.role === "ADMIN" || currentUser?.id === comment.supervisor.id;
                
                return (
                  <div key={comment.id} className="group bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col gap-3 transition-all hover:border-[var(--color-primary)]/30">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <EmployeeAvatar photoUrl={comment.employee.photoUrl} fullName={comment.employee.fullName} />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight">{comment.employee.fullName}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Por {comment.supervisor.name || comment.supervisor.email} em {format(new Date(comment.createdAt), "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <CommentActions 
                          commentId={comment.id} 
                          initialText={comment.text} 
                          canEdit={canEdit} 
                        />
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(comment.category)}`}>
                          {comment.category}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-lg border border-gray-100 dark:border-slate-800">
                      "{comment.text}"
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
