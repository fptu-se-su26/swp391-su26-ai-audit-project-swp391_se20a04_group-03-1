// Mock response generator for AI Assistant demo

interface ResponsePool {
  keywords: string[];
  responses: string[];
}

const RESPONSE_POOLS: ResponsePool[] = [
  {
    keywords: ["appointment", "schedule", "booking", "meeting", "reserve"],
    responses: [
      "I found 15 appointments scheduled for today. 8 are confirmed, 4 are pending approval, and 3 have been completed.",
      "Here's the appointment summary: You have a busy day with 12 arrivals and 8 departures scheduled.",
      "Current appointments: Gate 1 has 3 check-ins and 2 check-outs. Gate 2 has 5 check-ins pending.",
      "I can help you manage appointments. Would you like me to show you pending requests or create a new appointment?",
    ],
  },
  {
    keywords: ["container", "box", "container number", "mscu", "msku", "cma"],
    responses: [
      "Container MSCU1234567 is currently located at Yard A, Slot 12. Status: Unloading in progress.",
      "Let me check container status. MSCU7654321 is at Yard B, Slot 8. ETA to gate: 15 minutes.",
      "I found 3 containers matching your query. All are in Yard A with no pending issues.",
      "Container tracking: 45 containers in yard, 12 en route, 8 completed today.",
    ],
  },
  {
    keywords: ["gate", "entry", "exit", "check-in", "check-out", "in", "out"],
    responses: [
      "Gate status update: Gate 1 is Active (processing), Gate 2 is Busy (5 trucks waiting), Gate 3 is Standby.",
      "Current gate activity: 8 trucks checked in, 5 checked out in the last hour.",
      "Gate 1 average processing time: 3 minutes. Gate 2: 4 minutes due to high traffic.",
      "All gates are operational. No alerts or issues reported.",
    ],
  },
  {
    keywords: ["yard", "parking", "slot", "spot", "available", "capacity"],
    responses: [
      "Yard capacity: 68% occupied. 128 of 190 slots available. Section A is filling up (85%), Section B is 60%.",
      "Available spots: 15 in Section A, 25 in Section B, 8 near Gate 1 for quick turnaround.",
      "Current yard status: Empty spots available in rows 5-12. Container stacking: max 3 tiers.",
      "Yard summary: 62 containers stored, 8 pending pickup, 5 pending delivery.",
    ],
  },
  {
    keywords: ["driver", "truck", "vehicle", "license plate", "plate"],
    responses: [
      "Active drivers today: 25 registered, 18 currently on-site. Average wait time: 8 minutes.",
      "Driver John Smith (License: ABC-1234) checked in at Gate 1. Container: MSCU1234567.",
      "I found 3 drivers with pending documentation. Would you like me to show details?",
      "Truck statistics: 45 total entries, 38 exits today. Peak hours: 9 AM - 11 AM.",
    ],
  },
  {
    keywords: ["report", "statistics", "stats", "summary", "analytics"],
    responses: [
      "Today's summary: 45 trucks processed, 38 containers moved, 12 appointments completed. Efficiency: 94%.",
      "Weekly report: 312 trucks served, 285 containers handled. Average gate time: 3.5 minutes.",
      "Operations summary: Revenue up 12% this month. Average daily throughput: 52 trucks.",
      "I can generate detailed reports. Would you prefer daily, weekly, or monthly statistics?",
    ],
  },
  {
    keywords: ["help", "command", "what can you do", "how"],
    responses: [
      "I can help you with:\n• Appointments - view, create, manage\n• Containers - track and locate\n• Gates - monitor status and traffic\n• Yard - check capacity and spots\n• Drivers - view active drivers\n• Reports - generate statistics\n\nJust ask me naturally or use voice!",
      "I'm your AI assistant for LogiPort operations. Try asking:\n\"Show appointments\"\n\"Gate status\"\n\"Container MSCU1234567\"\n\"Yard capacity\"",
    ],
  },
  {
    keywords: ["hello", "hi", "hey", "good morning", "good afternoon"],
    responses: [
      "Hello! I'm your LogiPort AI assistant. How can I help you today?",
      "Hi there! I can help you manage appointments, track containers, monitor gates, and more. What would you like to know?",
      "Welcome to LogiPort! I'm here to assist with your port operations. Just ask me anything!",
    ],
  },
  {
    keywords: ["thank", "thanks", "appreciate"],
    responses: [
      "You're welcome! Is there anything else I can help you with?",
      "Happy to help! Feel free to ask if you need anything else.",
      "My pleasure! Let me know if you have more questions.",
    ],
  },
];

const DEFAULT_RESPONSES = [
  "I'm still learning and improving. For now, I can best help with appointments, containers, gates, yard status, and driver information. Try asking about those topics!",
  "I didn't quite catch that. I can help you with operations like viewing appointments, checking container status, monitoring gates, or checking yard capacity.",
  "I'm here to assist with LogiPort operations. Could you rephrase your question? I work best with queries about appointments, containers, gates, yard, and drivers.",
];

export function getMockResponse(userInput: string): string {
  const normalizedInput = userInput.toLowerCase().trim();

  // Find matching pool
  for (const pool of RESPONSE_POOLS) {
    const matches = pool.keywords.some((keyword) =>
      normalizedInput.includes(keyword)
    );
    if (matches) {
      // Return random response from pool
      const randomIndex = Math.floor(Math.random() * pool.responses.length);
      return pool.responses[randomIndex];
    }
  }

  // Return default response
  const defaultIndex = Math.floor(Math.random() * DEFAULT_RESPONSES.length);
  return DEFAULT_RESPONSES[defaultIndex];
}

export function simulateTypingEffect(
  text: string,
  onChar: (char: string) => void,
  onComplete: () => void,
  speed: number = 20
): () => void {
  let index = 0;
  let timeoutId: NodeJS.Timeout;

  const type = () => {
    if (index < text.length) {
      onChar(text[index]);
      index++;
      timeoutId = setTimeout(type, speed + Math.random() * 20);
    } else {
      onComplete();
    }
  };

  timeoutId = setTimeout(type, 300); // Initial delay before typing starts

  // Return cleanup function
  return () => {
    clearTimeout(timeoutId);
  };
}
