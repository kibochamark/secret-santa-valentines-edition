"use server"

import prisma from "@/lib/prisma"
import { createEvent, getEventByCode } from "./event-actions"
import { createParticipant, getParticipantsByEventId, getParticipantById } from "./participant-actions"

// Re-export the actions needed by the page
export { createEvent, getEventByCode, createParticipant, getParticipantsByEventId, getParticipantById }
