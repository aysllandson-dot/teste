"use client";

import { useState } from "react";
import { Edit2, Trash2, X, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface CommentActionsProps {
  commentId: string;
  initialText: string;
  canEdit: boolean;
}

export default function CommentActions({ commentId, initialText, canEdit }: CommentActionsProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialText);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!canEdit) return null;

  const handleUpdate = async () => {
    if (!text.trim() || text === initialText) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        setIsEditing(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Erro ao atualizar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
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

  if (isEditing) {
    return (
      <div className="mt-2 w-full">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-[var(--color-primary)] outline-none text-sm"
          rows={3}
        />
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={() => {
              setIsEditing(false);
              setText(initialText);
            }}
            disabled={isLoading}
            className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
            title="Cancelar"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={handleUpdate}
            disabled={isLoading}
            className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
            title="Salvar"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (isDeleting) {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-red-600 mt-2">
        <span>Excluir permanentemente?</span>
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="px-2 py-0.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Sim
        </button>
        <button
          onClick={() => setIsDeleting(false)}
          disabled={isLoading}
          className="px-2 py-0.5 bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-gray-200 rounded hover:bg-gray-300 transition-colors"
        >
          Não
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 invisible group-hover:visible transition-all">
      <button
        onClick={() => setIsEditing(true)}
        className="p-1 text-gray-400 hover:text-[var(--color-primary)] hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors"
        title="Editar"
      >
        <Edit2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => setIsDeleting(true)}
        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
        title="Excluir"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
