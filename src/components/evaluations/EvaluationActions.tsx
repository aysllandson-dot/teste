"use client";

import { useState } from "react";
import { Edit2, Trash2, X, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface EvaluationActionsProps {
  evaluationId: string;
  canEdit: boolean;
}

export default function EvaluationActions({ evaluationId, canEdit }: EvaluationActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!canEdit) return null;

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/evaluations/${evaluationId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setIsDeleting(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isDeleting) {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-red-600">
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Confirmar Exclusão
        </button>
        <button
          onClick={() => setIsDeleting(false)}
          disabled={isLoading}
          className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 invisible group-hover:visible transition-all">
      <Link
        href={`/dashboard/evaluations/${evaluationId}/edit`}
        className="p-1.5 text-gray-400 hover:text-[var(--color-primary)] hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors"
        title="Editar"
      >
        <Edit2 className="w-4 h-4" />
      </Link>
      <button
        onClick={() => setIsDeleting(true)}
        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
        title="Excluir"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
