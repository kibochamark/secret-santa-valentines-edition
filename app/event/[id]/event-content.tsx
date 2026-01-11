"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { verifyParticipantPin } from "@/app/actions/verify-pin"
import { getEventById } from "@/app/actions/event-actions"
import { getParticipantsByEventId, assignParticipants } from "@/app/actions/participant-actions"
import { Heart, Gift, Users, KeyRound } from "lucide-react"

interface Participant {
  id: string
  name: string
  assignedTo: string | null
  pin: string
}

interface Event {
  id: string
  name: string
  description: string | null
  code: string
  budget?: number | string | null
}

export default function EventContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const eventId = params.id as string
  const participantId = searchParams.get("participant")

  const [event, setEvent] = useState<Event | null>(null)
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [assignedTo, setAssignedTo] = useState<Participant | null>(null)
  const [allParticipants, setAllParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [showAssignmentButton, setShowAssignmentButton] = useState(false)
  const [selectedParticipantForEvent, setSelectedParticipantForEvent] = useState<string | null>(participantId || null)
  const [isCreator, setIsCreator] = useState(false)
  const [pinVerificationMode, setPinVerificationMode] = useState(false)
  const [pinInput, setPinInput] = useState("")
  const [pendingParticipantId, setPendingParticipantId] = useState<string | null>(null)

  useEffect(() => {
    const savedParticipantId = localStorage.getItem(`event-${eventId}-participant`)
    if (savedParticipantId && !participantId) {
      setSelectedParticipantForEvent(savedParticipantId)
    }
  }, [eventId, participantId])

  useEffect(() => {
    loadEventData()
  }, [eventId, selectedParticipantForEvent])

  const loadEventData = async () => {
    setLoading(true)
    try {
      const { data: eventData, error: eventError } = await getEventById(eventId)
      if (eventError) throw new Error(eventError)
      setEvent(eventData)

      const { data: participantsData, error: participantsError } = await getParticipantsByEventId(eventId)
      if (participantsError) throw new Error(participantsError)
      setAllParticipants(participantsData || [])

      if (selectedParticipantForEvent) {
        const currentParticipant = participantsData?.find((p) => p.id === selectedParticipantForEvent)
        if (currentParticipant) {
          setParticipant(currentParticipant)
          if (currentParticipant.assignedTo) {
            const assignedPerson = participantsData?.find((p) => p.id === currentParticipant.assignedTo)
            if (assignedPerson) setAssignedTo(assignedPerson)
          }
        }
      } else {
        setParticipant(null)
        setAssignedTo(null)
      }

      const firstParticipant = participantsData && participantsData.length > 0 ? participantsData[0] : null
      setIsCreator(selectedParticipantForEvent === firstParticipant?.id)

      const allAssigned = participantsData?.every((p) => p.assignedTo !== null) ?? false
      setShowAssignmentButton(
        selectedParticipantForEvent === firstParticipant?.id &&
          participantsData &&
          participantsData.length > 1 &&
          !allAssigned,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load event")
    } finally {
      setLoading(false)
    }
  }

  const handleParticipantSelect = (participantId: string) => {
    setPendingParticipantId(participantId)
    setPinVerificationMode(true)
    setPinInput("")
  }

  const handlePinVerification = async () => {
    if (!pendingParticipantId || !pinInput.trim()) {
      setError("Please enter your PIN")
      return
    }
    const isValid = await verifyParticipantPin(pendingParticipantId, pinInput)
    if (!isValid) {
      setError("Invalid PIN. Please try again.")
      setPinInput("")
      return
    }
    localStorage.setItem(`event-${eventId}-participant`, pendingParticipantId)
    setSelectedParticipantForEvent(pendingParticipantId)
    setPinVerificationMode(false)
    setPinInput("")
    setError(null)
  }

  const handleAssignments = async () => {
    try {
      const unassignedParticipants = [...allParticipants].sort(() => Math.random() - 0.5)
      const assignments: Array<{ id: string; assignedTo: string }> = []
      for (let i = 0; i < unassignedParticipants.length; i++) {
        const nextIndex = (i + 1) % unassignedParticipants.length
        assignments.push({
          id: unassignedParticipants[i].id,
          assignedTo: unassignedParticipants[nextIndex].id,
        })
      }
      const { error: assignError } = await assignParticipants(assignments)
      if (assignError) throw new Error(assignError)
      await loadEventData()
      setShowAssignmentButton(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign gifts")
    }
  }

  const formatToKES = (amountUSD: number | null | undefined) => {
    if (!amountUSD) return null
    const amountKES = amountUSD * 129
    return `KES ${amountKES.toLocaleString("en-KE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`
  }

  if (loading) {
    return (
      <div className="min-h-screen valentine flex items-center justify-center p-4">
        <Heart className="w-12 h-12 text-primary animate-ping" />
      </div>
    )
  }

  if (pinVerificationMode) {
    return (
      <div className="min-h-screen valentine flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary">
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
          <Card className="backdrop-blur-sm bg-card/80 shadow-2xl shadow-primary/10">
            <CardHeader className="items-center text-center">
              <KeyRound className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Verify Your Identity</CardTitle>
              <CardDescription>
                Enter your PIN for {allParticipants.find((p) => p.id === pendingParticipantId)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="password"
                placeholder="Enter your PIN"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePinVerification()}
                className="text-center text-lg tracking-widest"
              />
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              <div className="flex gap-2">
                <Button onClick={handlePinVerification} className="flex-1" disabled={!pinInput.trim()}>
                  <Heart className="w-4 h-4 mr-2" /> Verify
                </Button>
                <Button
                  onClick={() => {
                    setPinVerificationMode(false)
                    setPinInput("")
                    setError(null)
                    setPendingParticipantId(null)
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen valentine p-4 py-12 sm:p-8 bg-gradient-to-br from-background to-secondary/50">
      <div className="max-w-2xl mx-auto animate-in fade-in-5 duration-500">
        {event && (
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold text-primary mb-2 tracking-tight">{event.name}</h1>
            {event.description && <p className="text-muted-foreground mb-4 max-w-prose mx-auto">{event.description}</p>}
            {event.budget && (
              <div className="inline-block bg-primary/10 px-6 py-3 rounded-xl mb-4 animate-in fade-in-5 slide-in-from-bottom-5 duration-500">
                <p className="text-sm text-muted-foreground mb-1">Budget</p>
                <p className="text-2xl font-semibold text-primary">{formatToKES(Number(event.budget))}</p>
              </div>
            )}
            <div className="inline-block bg-card/80 border border-border px-4 py-2 rounded-lg ml-4">
              <p className="text-sm text-muted-foreground">Event Code</p>
              <p className="text-lg font-mono font-bold text-foreground">{event.code}</p>
            </div>
          </div>
        )}

        {error && (
          <Card className="mb-6 bg-destructive/10 border-destructive animate-in fade-in-5">
            <CardContent className="pt-6">
              <p className="text-destructive text-center font-medium">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-8">
          {!selectedParticipantForEvent && (
            <Card className="backdrop-blur-sm bg-card/80 shadow-2xl shadow-primary/10 animate-in fade-in-5 slide-in-from-bottom-5 duration-500">
              <CardHeader className="items-center text-center">
                <Users className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Who are you?</CardTitle>
                <CardDescription>Select your name to reveal your Secret Santa!</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {allParticipants.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleParticipantSelect(p.id)}
                      className="p-4 text-center rounded-lg border-2 border-secondary bg-secondary hover:border-primary hover:bg-primary/10 transition-all duration-300 transform hover:scale-105"
                    >
                      <span className="font-medium text-lg text-foreground">{p.name}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {participant && (
            <Card className="backdrop-blur-sm bg-card/80 shadow-2xl shadow-primary/10 animate-in fade-in-5 slide-in-from-bottom-5 duration-500">
              <CardHeader className="items-center text-center">
                <Gift className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Your Secret Assignment</CardTitle>
                <CardDescription>You are the Secret Santa for...</CardDescription>
              </CardHeader>
              <CardContent>
                {assignedTo ? (
                  <div className="text-center space-y-6">
                    {!revealed ? (
                      <>
                        <p className="text-muted-foreground mb-4">Click the heart to reveal who you're gifting to!</p>
                        <Button
                          size="lg"
                          className="mx-auto rounded-full w-24 h-24 animate-pulse"
                          onClick={() => setRevealed(true)}
                        >
                          <Heart className="w-12 h-12" />
                        </Button>
                      </>
                    ) : (
                      <div className="bg-primary/10 border-2 border-dashed border-primary rounded-2xl p-8 animate-in fade-in zoom-in-95 duration-500">
                        <p className="text-sm text-muted-foreground mb-2">You are gifting to:</p>
                        <p className="text-5xl font-bold text-primary tracking-tight">{assignedTo.name}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">Waiting for assignments... The excitement is building!</p>
                )}
              </CardContent>
            </Card>
          )}

          {showAssignmentButton && participant && (
            <Card className="border-primary bg-primary/10 animate-in fade-in-5 slide-in-from-bottom-5 duration-500">
              <CardHeader className="items-center text-center">
                <CardTitle className="text-primary">Ready to Spread the Love?</CardTitle>
                <CardDescription>Click below to randomly assign gifting buddies to everyone.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleAssignments} className="w-full" size="lg">
                  <Heart className="w-4 h-4 mr-2" /> Start Secret Santa
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="backdrop-blur-sm bg-card/80 shadow-lg shadow-primary/5 animate-in fade-in-5 slide-in-from-bottom-5 duration-500">
            <CardHeader>
              <CardTitle>Participants ({allParticipants.length})</CardTitle>
              <CardDescription>Everyone in this Valentine's event.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {allParticipants.map((p) => (
                  <div
                    key={p.id}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      p.id === selectedParticipantForEvent
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-secondary"
                    }`}
                  >
                    <span className={`font-medium ${p.id === selectedParticipantForEvent ? "font-bold" : ""}`}>
                      {p.name}
                      {p.id === selectedParticipantForEvent && " (You)"}
                    </span>
                    <div className="flex gap-2 items-center">
                      {p.assignedTo && <Heart className="w-4 h-4 text-primary/50" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}