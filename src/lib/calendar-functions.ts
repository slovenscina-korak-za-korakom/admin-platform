import {AvailableSlotData, SessionData, StudentInfo} from "@/components/calendar/types";
import {getSessionColor} from "@/lib/session-colors";

export const getEvents = (data: SessionData[], availableSlots: AvailableSlotData[], studentsInfoOrFlag?: Record<string, StudentInfo | null> | boolean, addEventRoute=false) => {
  const studentsInfo = typeof studentsInfoOrFlag === "boolean" ? undefined : studentsInfoOrFlag;
  const resolvedAddEventRoute = typeof studentsInfoOrFlag === "boolean" ? studentsInfoOrFlag : addEventRoute;

  const sessionTypeLabel: Record<string, string> = {
    individual: "Individual",
    group: "Group",
    test: "Test",
  };

  const bookedEvents = data.map((session) => {
    const studentInfo = studentsInfo ? (session.studentId
      ? studentsInfo[session.studentId] : null) : undefined;

    const studentName = studentInfo?.name || "Unknown";
    const color = getSessionColor(session.sessionType);
    const title = resolvedAddEventRoute
      ? (sessionTypeLabel[session.sessionType] ?? session.sessionType)
      : `${studentName} - ${session.sessionType}`;

    return {
      id: session.id.toString(),
      title,
      start: session.startTime,
      end: new Date(
        new Date(session.startTime).getTime() + session.duration * 60000
      ),
      ...(resolvedAddEventRoute && { backgroundColor: color, borderColor: color, textColor: "#ffffff" }),
      extendedProps: {
        status: session.status,
        studentInfo: studentInfo,
        studentId: session.studentId,
        tutorId: session.tutorId,
        location: session.location,
        sessionType: session.sessionType,
        duration: session.duration,
        invitationId: session.invitationId,
        videoCallUrl: session.videoCallUrl,
        isAvailable: false,
      },
    };
  });
  // only grab booked keys instead of all events
  const bookedKeys = new Set(
    data.filter((s) => s.status === "booked").map((s) => `${new Date(s.startTime).getTime()}-${s.sessionType}-${s.duration}`)
  );

  const filteredAvailableSlots = availableSlots.filter((slot) => {
    if (!slot.startTime) return false;
    const key = `${new Date(slot.startTime).getTime()}-${slot.sessionType}-${slot.duration}`;
    return !bookedKeys.has(key);
  });

  const availableEvents = filteredAvailableSlots.map((slot) => {
    const color = getSessionColor(slot.sessionType);
    const title =
      slot.sessionType === "group"
        ? "Group"
        : slot.sessionType === "test"
          ? "Test"
          : "Individual";
    return {
      id: `available-${slot.id}`,
      title,
      start: slot.startTime,
      end: new Date(new Date(slot.startTime).getTime() + slot.duration * 60000),
      backgroundColor: "transparent",
      borderColor: color,
      textColor: color,
      extendedProps: {
        location: slot.location,
        sessionType: slot.sessionType,
        duration: slot.duration,
        videoCallUrl: slot.videoCallUrl,
        isAvailable: true,
        color,
      },
    };
  });

  return [...bookedEvents, ...availableEvents];
}
