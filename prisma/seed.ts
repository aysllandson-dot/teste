import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@vianamoura.com.br' },
    update: {},
    create: {
      email: 'admin@vianamoura.com.br',
      name: 'Supervisor Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })
  
  console.log('Seeded User:', user.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
