import { prisma } from "./prisma";

export async function seedUsers() {
  await prisma.user.upsert({
    where: {
      email: "alice@example.com",
    },
    update: {
      id: "user-1",
    },
    create: {
      id: "user-1",
      name: "Alice Johnson",
      email: "alice@example.com",
    },
  });

  await prisma.user.upsert({
    where: {
      email: "bob@example.com",
    },
    update: {
      id: "user-2",
    },
    create: {
      id: "user-2",
      name: "Bob Smith",
      email: "bob@example.com",
    },
  });

  await prisma.user.upsert({
    where: {
      email: "charlie@example.com",
    },
    update: {
      id: "user-3",
    },
    create: {
      id: "user-3",
      name: "Charlie Brown",
      email: "charlie@example.com",
    },
  });

  console.log("Demo users seeded");
}
