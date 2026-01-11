import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Starting seed...")

  // Clear existing data
  await prisma.participant.deleteMany()
  await prisma.event.deleteMany()

  // Insert Events
  const events = [
    {
      id: "65ac2f32-279f-4491-b6ba-f0d445185503",
      name: "chumz valentines",
      description: "15",
      code: "XHAR60",
      budget: 0.0,
      createdAt: new Date("2026-01-07T18:43:40.195990Z"),
      updatedAt: new Date("2026-01-07T18:43:40.195990Z"),
    },
    {
      id: "b00b2904-e4a4-40f0-a8ca-421e752df3a7",
      name: "chumz valentines",
      description: "15",
      code: "FZ0TNX",
      budget: 0.0,
      createdAt: new Date("2026-01-07T18:44:56.725708Z"),
      updatedAt: new Date("2026-01-07T18:44:56.725708Z"),
    },
    {
      id: "57b7e98b-8ca2-4cee-8e93-6153d92f595f",
      name: "chumz valentines",
      description: "15",
      code: "7NF3N9",
      budget: 0.0,
      createdAt: new Date("2026-01-07T18:46:07.518626Z"),
      updatedAt: new Date("2026-01-07T18:46:07.518626Z"),
    },
  ]

  for (const event of events) {
    await prisma.event.create({ data: event })
    console.log(`Created event: ${event.name} (${event.code})`)
  }

  // Insert Participants with plain text PINs
  const participants = [
    {
      id: "3d0b66fb-5688-45f3-87c4-819a6fe32fbf",
      eventId: "57b7e98b-8ca2-4cee-8e93-6153d92f595f",
      name: "Adolph ",
      pin: "147293",
      assignedTo: "738d296b-eb28-4647-8ad3-c5f4f3430f12",
      createdAt: new Date("2026-01-07T18:46:34.433647Z"),
      updatedAt: new Date("2026-01-07T18:46:34.433647Z"),
    },
    {
      id: "738d296b-eb28-4647-8ad3-c5f4f3430f12",
      eventId: "57b7e98b-8ca2-4cee-8e93-6153d92f595f",
      name: "Anet",
      pin: "582641",
      assignedTo: "58f2bba4-599b-4fab-a3b9-b56db7d0e70a",
      createdAt: new Date("2026-01-08T05:34:47.471416Z"),
      updatedAt: new Date("2026-01-08T05:34:47.471416Z"),
    },
    {
      id: "2f4bb9bf-113b-4e8f-9171-3310cab7d364",
      eventId: "57b7e98b-8ca2-4cee-8e93-6153d92f595f",
      name: "Dave",
      pin: "641952",
      assignedTo: null,
      createdAt: new Date("2026-01-11T07:50:53.843974Z"),
      updatedAt: new Date("2026-01-11T07:50:53.843974Z"),
    },
    {
      id: "aa59924e-d2c8-43ea-8382-00885cbc58b2",
      eventId: "57b7e98b-8ca2-4cee-8e93-6153d92f595f",
      name: "Felly",
      pin: "936274",
      assignedTo: "56e8ad5a-8045-4962-ba96-fcb7bc05194c",
      createdAt: new Date("2026-01-07T18:48:41.714443Z"),
      updatedAt: new Date("2026-01-07T18:48:41.714443Z"),
    },
    {
      id: "56e8ad5a-8045-4962-ba96-fcb7bc05194c",
      eventId: "57b7e98b-8ca2-4cee-8e93-6153d92f595f",
      name: "Frank",
      pin: "451829",
      assignedTo: "d6267c3a-dcea-4b0d-9660-18b8d39efa20",
      createdAt: new Date("2026-01-08T06:18:17.917872Z"),
      updatedAt: new Date("2026-01-08T06:18:17.917872Z"),
    },
    {
      id: "d6267c3a-dcea-4b0d-9660-18b8d39efa20",
      eventId: "57b7e98b-8ca2-4cee-8e93-6153d92f595f",
      name: "GEORGE",
      pin: "769345",
      assignedTo: "3d0b66fb-5688-45f3-87c4-819a6fe32fbf",
      createdAt: new Date("2026-01-08T09:05:09.498758Z"),
      updatedAt: new Date("2026-01-08T09:05:09.498758Z"),
    },
    {
      id: "58f2bba4-599b-4fab-a3b9-b56db7d0e70a",
      eventId: "57b7e98b-8ca2-4cee-8e93-6153d92f595f",
      name: "mark",
      pin: "312857",
      assignedTo: "aa59924e-d2c8-43ea-8382-00885cbc58b2",
      createdAt: new Date("2026-01-07T18:46:35.287901Z"),
      updatedAt: new Date("2026-01-07T18:46:35.287901Z"),
    },
  ]

  for (const participant of participants) {
    await prisma.participant.create({ data: participant })
    console.log(`Created participant: ${participant.name} (PIN: ${participant.pin})`)
  }

  console.log("Seed completed successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
