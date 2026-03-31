"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteEmployeeButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm("Tem certeza que deseja excluir permanentemente este funcionário?")) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir");
      
      router.push("/dashboard/employees");
      router.refresh();
    } catch (error) {
      alert("Falha ao excluir o funcionário. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
    >
      <Trash2 className="w-4 h-4" />
      {loading ? "Excluindo..." : "Excluir"}
    </button>
  );
}
