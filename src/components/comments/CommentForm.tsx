"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Employee {
  id: string;
  fullName: string;
}

export default function CommentForm({ employees }: { employees: Employee[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [text, setText] = useState("");
  const [category, setCategory] = useState("Observação");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !text) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, text, category }),
      });

      if (!res.ok) throw new Error("Erro ao salvar");
      
      setText("");
      router.refresh(); // recarrega a página para mostrar novo comentário
    } catch (error) {
      alert("Falha ao registrar comentário.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Adicionar Nova Observação</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Funcionário *</label>
            <select
              required
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full p-2.5 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
            >
              <option value="">Selecione...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.fullName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
            >
              <option value="Observação">Observação</option>
              <option value="Elogio">Elogio</option>
              <option value="Sugestão">Sugestão</option>
              <option value="Advertência">Advertência</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Comentário *</label>
          <textarea
            required
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 focus:ring-2 focus:ring-[var(--color-primary)] outline-none resize-y"
            placeholder="Digite os detalhes da observação..."
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !employeeId || !text}
            className="bg-[var(--color-primary)] hover:opacity-90 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-opacity"
          >
            {isSubmitting ? "Registrando..." : "Registrar"}
          </button>
        </div>
      </form>
    </div>
  );
}
