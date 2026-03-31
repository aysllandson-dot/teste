"use client";

import { Download, Printer } from "lucide-react";

export default function PrintExportButtons({ data }: { data: any[] }) {
  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    // Generate CSV
    const headers = ["Ranking", "Nome", "Cargo", "Setor", "Total de Avaliacoes", "Media Geral"];
    const rows = data.map((emp, idx) => [
      idx + 1,
      `"${emp.fullName}"`,
      `"${emp.role}"`,
      `"${emp.sector}"`,
      emp.totalEvals,
      emp.generalAverage.toFixed(2)
    ]);
    
    // @ts-ignore
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "vianamoura_ranking_rh.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex gap-2">
      <button 
        onClick={handlePrint}
        className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors shadow-sm"
      >
        <Printer className="w-4 h-4" />
        <span>Imprimir PDF</span>
      </button>
      <button 
        onClick={handleExportCSV}
        className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-blue-900 flex items-center gap-2 transition-colors shadow-sm"
      >
        <Download className="w-4 h-4" />
        <span>Exportar CSV</span>
      </button>

      {/* Global CSS injected just for printing the section properly. In a real app this would be in globals.css */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}} />
    </div>
  );
}
