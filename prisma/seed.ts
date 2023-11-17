import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await hash("Password123.,", 8);

  const user1 = await prisma.user.upsert({
    where: { email: "user1@email.com" },
    update: {
      email: "user1@email.com",
      name: "User1",
      password,
    },
    create: {
      email: "user1@email.com",
      name: "User1",
      password,
    },
  });

  console.log({ user1 });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });