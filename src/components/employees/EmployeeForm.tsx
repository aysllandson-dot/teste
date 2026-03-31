"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema, EmployeeFormValues } from "@/lib/validations/employee";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Camera, User } from "lucide-react";
import Image from "next/image";

export default function EmployeeForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [availableObras, setAvailableObras] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchObras() {
      try {
        const res = await fetch("/api/teams");
        if (res.ok) {
          const teams = await res.json();
          // Extract unique valid sectors from teams
          const obrasSet = new Set<string>();
          teams.forEach((t: any) => {
            if (t.sector) obrasSet.add(t.sector);
          });
          setAvailableObras(Array.from(obrasSet));
        }
      } catch (err) {
        console.error("Erro ao carregar obras", err);
      }
    }
    fetchObras();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      gender: "Masculino",
      status: "Ativo",
    },
  });

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview imediato
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setPhotoUrl(data.url);
    } catch {
      console.error("Erro no upload da foto");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const onSubmit = async (data: EmployeeFormValues) => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, photoUrl }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar funcionário");
      }

      router.push("/dashboard/employees");
      router.refresh();
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-gray-200 dark:border-slate-800 p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100 border-b pb-4">
        Cadastrar Novo Funcionário
      </h2>

      {errorMsg && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Foto do Funcionário */}
        <div className="flex flex-col items-center gap-3 pb-6 border-b border-gray-100 dark:border-slate-800">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative w-32 h-32 rounded-full border-4 border-dashed border-gray-300 dark:border-slate-600 overflow-hidden cursor-pointer hover:border-[var(--color-primary)] group flex items-center justify-center transition-all bg-gray-50 dark:bg-slate-800"
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-gray-400 dark:text-slate-500">
                <User className="w-10 h-10" />
                <span className="text-xs">Foto</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            {uploadingPhoto && (
              <div className="absolute inset-0 bg-white/70 dark:bg-black/50 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Clique para adicionar uma foto
          </p>
        </div>

        {/* Dados Pessoais */}
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-primary)] dark:text-blue-400 mb-4">Dados Pessoais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome Completo <span className="text-red-500">*</span></label>
              <input {...register("fullName")} className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-[var(--color-primary)] outline-none" />
              {errors.fullName && <span className="text-red-500 text-xs">{errors.fullName.message}</span>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Data de Nascimento</label>
              <input type="date" {...register("birthDate")} className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-[var(--color-primary)] outline-none" />
              {errors.birthDate && <span className="text-red-500 text-xs">{errors.birthDate.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sexo <span className="text-red-500">*</span></label>
              <select {...register("gender")} className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-[var(--color-primary)] outline-none">
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">CPF</label>
              <input {...register("cpf")} placeholder="000.000.000-00" className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-[var(--color-primary)] outline-none" />
              {errors.cpf && <span className="text-red-500 text-xs">{errors.cpf.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input {...register("phone")} placeholder="(00) 00000-0000" className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-[var(--color-primary)] outline-none" />
              {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">E-mail (Opcional)</label>
              <input type="email" {...register("email")} className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-[var(--color-primary)] outline-none" />
              {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-primary)] dark:text-blue-400 mb-4 border-t border-gray-100 dark:border-slate-800 pt-4">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Rua</label>
              <input {...register("street")} className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-[var(--color-primary)] outline-none" />
              {errors.street && <span className="text-red-500 text-xs">{errors.street.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Número</label>
              <input {...register("number")} className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-[var(--color-primary)] outline-none" />
              {errors.number && <span className="text-red-500 text-xs">{errors.number.message}</span>}
            </div>
            <div>
               <label className="block text-sm font-medium mb-1">Bairro</label>
               <input {...register("neighborhood")} className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-[var(--color-primary)] outline-none" />
               {errors.neighborhood && <span className="text-red-500 text-xs">{errors.neighborhood.message}</span>}
            </div>
            <div className="col-span-2">
               <label className="block text-sm font-medium mb-1">Cidade</label>
               <input {...register("city")} className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-[var(--color-primary)] outline-none" />
               {errors.city && <span className="text-red-500 text-xs">{errors.city.message}</span>}
            </div>
            <div>
               <label className="block text-sm font-medium mb-1">Estado (UF)</label>
               <input {...register("state")} maxLength={2} className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-[var(--color-primary)] outline-none" />
               {errors.state && <span className="text-red-500 text-xs">{errors.state.message}</span>}
            </div>
            <div className="md:col-span-2">
               <label className="block text-sm font-medium mb-1">CEP</label>
               <input {...register("zipCode")} placeholder="00000-000" className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-[var(--color-primary)] outline-none" />
               {errors.zipCode && <span className="text-red-500 text-xs">{errors.zipCode.message}</span>}
            </div>
          </div>
        </div>

        {/* Dados Profissionais */}
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-primary)] dark:text-blue-400 mb-4 border-t border-gray-100 dark:border-slate-800 pt-4">Dados Profissionais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-medium mb-1">Função/Cargo <span className="text-red-500">*</span></label>
               <select {...register("role")} className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-[var(--color-primary)] outline-none">
                 <option value="">Selecione...</option>
                 <option value="Servente">Servente</option>
                 <option value="Polivalente">Polivalente</option>
                 <option value="Operador">Operador</option>
                 <option value="Operador Lider">Operador Líder</option>
                 <option value="Supervisor">Supervisor</option>
               </select>
               {errors.role && <span className="text-red-500 text-xs">{errors.role.message}</span>}
            </div>
            <div>
               <label className="block text-sm font-medium mb-1">Setor <span className="text-red-500">*</span></label>
               <select {...register("sector")} className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-[var(--color-primary)] outline-none">
                 <option value="">Selecione...</option>
                 <option value="Produção">Produção</option>
                 <option value="Infra">Infra</option>
                 <option value="UDE">UDE</option>
                 <option value="Suprimentos">Suprimentos</option>
               </select>
               {errors.sector && <span className="text-red-500 text-xs">{errors.sector.message}</span>}
            </div>
            <div>
               <label className="block text-sm font-medium mb-1">Obra (Opcional)</label>
               <select {...register("obra")} className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-[var(--color-primary)] outline-none">
                 <option value="">Nenhuma / Não aplicável</option>
                 {availableObras.map((obra) => (
                   <option key={obra} value={obra}>{obra}</option>
                 ))}
               </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data de Admissão</label>
              <input type="date" {...register("admissionDate")} className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-[var(--color-primary)] outline-none" />
              {errors.admissionDate && <span className="text-red-500 text-xs">{errors.admissionDate.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status <span className="text-red-500">*</span></label>
              <select {...register("status")} className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-[var(--color-primary)] outline-none">
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Afastado">Afastado</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 mr-4 border border-gray-300 dark:border-slate-700 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[var(--color-primary)] hover:opacity-90 text-white px-8 py-2 rounded-md font-medium transition-opacity"
          >
            {isSubmitting ? "Salvando..." : "Salvar Funcionário"}
          </button>
        </div>
      </form>
    </div>
  );
}
