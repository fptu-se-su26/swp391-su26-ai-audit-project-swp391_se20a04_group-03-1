// Types for AI Assistant

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

export interface AIAssistantState {
  isOpen: boolean;
  messages: ChatMessage[];
  isProcessing: boolean;
  isListening: boolean;
  selectedLanguage: "en-US" | "vi-VN";
}

export type AIAssistantAction =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "TOGGLE" }
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "SET_PROCESSING"; payload: boolean }
  | { type: "SET_LISTENING"; payload: boolean }
  | { type: "SET_LANGUAGE"; payload: "en-US" | "vi-VN" }
  | { type: "CLEAR_MESSAGES" };

export const initialState: AIAssistantState = {
  isOpen: false,
  messages: [],
  isProcessing: false,
  isListening: false,
  selectedLanguage: "en-US",
};

export function aiAssistantReducer(
  state: AIAssistantState,
  action: AIAssistantAction
): AIAssistantState {
  switch (action.type) {
    case "OPEN":
      return { ...state, isOpen: true };
    case "CLOSE":
      return { ...state, isOpen: false };
    case "TOGGLE":
      return { ...state, isOpen: !state.isOpen };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };
    case "SET_PROCESSING":
      return { ...state, isProcessing: action.payload };
    case "SET_LISTENING":
      return { ...state, isListening: action.payload };
    case "SET_LANGUAGE":
      return { ...state, selectedLanguage: action.payload };
    case "CLEAR_MESSAGES":
      return { ...state, messages: [] };
    default:
      return state;
  }
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Welcome message
export const WELCOME_MESSAGE: ChatMessage = {
  id: generateId(),
  role: "assistant",
  content:
    "Hello! I'm your LogiPort AI Assistant. I can help you with:\n\n• **Appointments** - View and manage schedules\n• **Containers** - Track and locate containers\n• **Gates** - Monitor status and traffic\n• **Yard** - Check capacity and spots\n• **Drivers** - View active drivers\n\nType your question or use the microphone to speak. How can I help you today?",
  timestamp: new Date(),
};
