require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

async function main() {
  console.log("Seeding database...");

  // Seed admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", password_hash: adminPassword },
  });
  console.log("Admin seeded: username=admin, password=admin123");

  // Seed house types
  const types = ["Bedsitter", "1 Bedroom", "2 Bedroom", "3 Bedroom"];
  for (const name of types) {
    await prisma.houseType.upsert({
      where: { house_type_name: name },
      update: {},
      create: { house_type_name: name },
    });
  }
  console.log("House types seeded:", types.join(", "));

  // Seed employer - Kenya Prisons Service
  await prisma.employer.upsert({
    where: { employer_id: "KPS-001" },
    update: {},
    create: {
      employer_id: "KPS-001",
      employer_name: "Kenya Prisons Service",
      authorized: true,
    },
  });
  console.log("Employer seeded: Kenya Prisons Service (authorized)");

  // Seed sample housing units
  const houseTypes = await prisma.houseType.findMany();
  const houseTypeMap = {};
  houseTypes.forEach((ht) => {
    houseTypeMap[ht.house_type_name] = ht.id;
  });

  const sampleHousing = [
    {
      county: "Nairobi",
      town_location: "Langata",
      block_name: "Block A",
      floor_number: 1,
      house_type_id: houseTypeMap["Bedsitter"],
      monthly_rent: 5000,
      payment_duration_months: 12,
    },
    {
      county: "Nairobi",
      town_location: "Langata",
      block_name: "Block A",
      floor_number: 1,
      house_type_id: houseTypeMap["1 Bedroom"],
      monthly_rent: 8000,
      payment_duration_months: 12,
    },
    {
      county: "Nairobi",
      town_location: "Langata",
      block_name: "Block A",
      floor_number: 2,
      house_type_id: houseTypeMap["2 Bedroom"],
      monthly_rent: 12000,
      payment_duration_months: 12,
    },
    {
      county: "Nairobi",
      town_location: "Langata",
      block_name: "Block B",
      floor_number: 1,
      house_type_id: houseTypeMap["3 Bedroom"],
      monthly_rent: 15000,
      payment_duration_months: 12,
    },
    {
      county: "Nairobi",
      town_location: "Industrial Area",
      block_name: "Block C",
      floor_number: 1,
      house_type_id: houseTypeMap["1 Bedroom"],
      monthly_rent: 7000,
      payment_duration_months: 12,
    },
    {
      county: "Nairobi",
      town_location: "Industrial Area",
      block_name: "Block C",
      floor_number: 2,
      house_type_id: houseTypeMap["2 Bedroom"],
      monthly_rent: 10000,
      payment_duration_months: 12,
    },
  ];

  for (const house of sampleHousing) {
    await prisma.housing.create({ data: house });
  }
  console.log(`${sampleHousing.length} sample housing units seeded`);

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
