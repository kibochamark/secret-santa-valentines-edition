"use server"

import prisma from "@/lib/prisma"

export async function createEvent(name: string, description: string | null, code: string) {
  try {
    const event = await prisma.event.create({
      data: {
        name,
        description,
        code,
      },
    })
    return { data: event, error: null }
  } catch (error) {
    console.error("[createEvent] Error:", error)
    return { data: null, error: error instanceof Error ? error.message : "Failed to create event" }
  }
}

export async function getEventByCode(code: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { code: code.toUpperCase() },
      select: { id: true },
    })

    if (!event) {
      return { data: null, error: "Event code not found" }
    }

    return { data: event, error: null }
  } catch (error) {
    console.error("[getEventByCode] Error:", error)
    return { data: null, error: error instanceof Error ? error.message : "Failed to find event" }
  }
}

export async function getEventById(eventId: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return { data: null, error: "Event not found" }
    }

    // Convert Decimal to number for budget
    return {
      data: {
        ...event,
        budget: event.budget ? Number(event.budget) : null,
      },
      error: null,
    }
  } catch (error) {
    console.error("[getEventById] Error:", error)
    return { data: null, error: error instanceof Error ? error.message : "Failed to load event" }
  }
}
