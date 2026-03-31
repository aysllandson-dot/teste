import EmployeeForm from "@/components/employees/EmployeeForm";

export default function NewEmployeePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Novo Funcionário</h1>
      </div>
      <EmployeeForm />
    </div>
  );
}
