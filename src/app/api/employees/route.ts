import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { employeeSchema } from "@/lib/validations/employee";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = employeeSchema.parse(body);

    const employee = await prisma.employee.create({
      data: {
        fullName: validatedData.fullName,
        gender: validatedData.gender,
        role: validatedData.role,
        sector: validatedData.sector,
        obra: (validatedData.obra || null) as any,
        status: validatedData.status,
        // Opcionais
        birthDate: (validatedData.birthDate ? new Date(validatedData.birthDate) : null) as any,
        cpf: (validatedData.cpf ? validatedData.cpf.replace(/\D/g, "") : null) as any,
        phone: (validatedData.phone || null) as any,
        email: (validatedData.email || null) as any,
        street: (validatedData.street || null) as any,
        number: (validatedData.number || null) as any,
        neighborhood: (validatedData.neighborhood || null) as any,
        city: (validatedData.city || null) as any,
        state: (validatedData.state || null) as any,
        zipCode: (validatedData.zipCode || null) as any,
        admissionDate: (validatedData.admissionDate ? new Date(validatedData.admissionDate) : null) as any,
        photoUrl: (validatedData.photoUrl || null) as any,
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Erro interno no servidor ao cadastrar funcionário" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { fullName: "asc" },
    });
    return NextResponse.json(employees);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar funcionários" },
      { status: 500 }
    );
  }
}
