const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@vianamoura.com.br' },
    update: {},
    create: {
      email: 'admin@vianamoura.com.br',
      name: 'Supervisor Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('Usuário criado:', user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
