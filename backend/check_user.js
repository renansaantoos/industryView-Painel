const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const user = await p.user.findUnique({
    where: { email: 'renan.santos@doublex.com.br' },
    select: { email: true, first_login: true }
  });
  console.log(JSON.stringify(user, null, 2));
  await p.$disconnect();
}
main();
