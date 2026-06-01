const { PrismaClient } = require("@prisma/client") as { PrismaClient: new () => any };

const prisma = new PrismaClient();

async function main() {
  await Promise.all([
    prisma.role.upsert({ where: { name: "USER" }, update: {}, create: { name: "USER", description: "Default user" } }),
    prisma.role.upsert({ where: { name: "MODERATOR" }, update: {}, create: { name: "MODERATOR", description: "Can moderate restaurants, posts and comments" } }),
    prisma.role.upsert({ where: { name: "ADMIN" }, update: {}, create: { name: "ADMIN", description: "Administrator" } })
  ]);

  await Promise.all([
    prisma.category.upsert({ where: { slug: "street-food" }, update: {}, create: { name: "Street Food", slug: "street-food" } }),
    prisma.category.upsert({ where: { slug: "fine-dining" }, update: {}, create: { name: "Fine Dining", slug: "fine-dining" } }),
    prisma.category.upsert({ where: { slug: "healthy-eat" }, update: {}, create: { name: "Healthy Eat", slug: "healthy-eat" } }),
    prisma.category.upsert({ where: { slug: "cafe" }, update: {}, create: { name: "Cafe", slug: "cafe" } })
  ]);

  console.log("Seed completed: roles and categories are ready.");
}

main().finally(async () => prisma.$disconnect());
