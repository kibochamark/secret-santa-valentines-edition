"use server"

import prisma from "@/lib/prisma"

export async function getParticipantsByEventId(eventId: string) {
  try {
    const participants = await prisma.participant.findMany({
      where: { eventId },
      orderBy: { createdAt: "asc" },
    })

    return { data: participants, error: null }
  } catch (error) {
    console.error("[getParticipantsByEventId] Error:", error)
    return { data: null, error: error instanceof Error ? error.message : "Failed to load participants" }
  }
}

export async function createParticipant(eventId: string, name: string, pin: string) {
  try {
    const participant = await prisma.participant.create({
      data: {
        eventId,
        name,
        pin,
      },
    })

    return { data: participant, error: null }
  } catch (error) {
    console.error("[createParticipant] Error:", error)

    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes("unique")) {
      return { data: null, error: "This name already exists in the event. Please choose another name." }
    }

    return { data: null, error: error instanceof Error ? error.message : "Failed to create participant" }
  }
}

export async function getParticipantById(participantId: string) {
  try {
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      select: {
        id: true,
        name: true,
        pin: true,
      },
    })

    if (!participant) {
      return { data: null, error: "Participant not found" }
    }

    return { data: participant, error: null }
  } catch (error) {
    console.error("[getParticipantById] Error:", error)
    return { data: null, error: error instanceof Error ? error.message : "Failed to load participant" }
  }
}

export async function assignParticipants(assignments: Array<{ id: string; assignedTo: string }>) {
  try {
    // Update all participants with assignments in a transaction
    await prisma.$transaction(
      assignments.map((assignment) =>
        prisma.participant.update({
          where: { id: assignment.id },
          data: { assignedTo: assignment.assignedTo },
        })
      )
    )

    return { error: null }
  } catch (error) {
    console.error("[assignParticipants] Error:", error)
    return { error: error instanceof Error ? error.message : "Failed to assign participants" }
  }
}
