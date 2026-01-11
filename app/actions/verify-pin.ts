"use server"

import prisma from "@/lib/prisma"

export async function verifyParticipantPin(participantId: string, pin: string): Promise<boolean> {
  // CRITICAL: These logs MUST appear in terminal
  console.log("=".repeat(80))
  console.log("[SERVER ACTION] verifyParticipantPin CALLED")
  console.log("[SERVER ACTION] Participant ID:", participantId)
  console.log("[SERVER ACTION] PIN:", pin)
  console.log("=".repeat(80))

  try {
    // Query using Prisma
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      select: { pin: true },
    })

    console.log("[SERVER ACTION] Participant found:", !!participant)

    if (!participant) {
      console.log("[SERVER ACTION] No participant found")
      return false
    }

    // Compare the PINs
    const isValid = participant.pin === pin
    console.log("[SERVER ACTION] Stored PIN:", participant.pin)
    console.log("[SERVER ACTION] Input PIN:", pin)
    console.log("[SERVER ACTION] Match result:", isValid)
    console.log("=".repeat(80))

    return isValid
  } catch (err) {
    console.error("[SERVER ACTION] Exception:", err)
    console.log("=".repeat(80))
    return false
  }
}
