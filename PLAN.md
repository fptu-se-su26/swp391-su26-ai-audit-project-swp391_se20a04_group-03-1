# Plan: AI Assistant - Speech-to-Text Demo (Phase 1)

## Context

Triển khai tính năng AI Assistant cho hệ thống LogiPort với demo Speech-to-Text (STT) đầu tiên. Mục tiêu: tạo nền tảng cho chatbot hỗ trợ người dùng quản lý cảng với khả năng nhận diện giọng nói, xử lí hoàn toàn trên browser.

## Yêu cầu

- STT chạy trên browser (không backend)
- Hỗ trợ tiếng Anh (mở rộng tiếng Việt sau)
- Tích hợp vào Next.js frontend (admin dashboard)
- Demo: hiển thị text từ giọng nói + mock response

## Files to Create

### 1. Custom Hook - STT Engine
**File:** `src/frontend/src/lib/hooks/use-speech-recognition.ts`

- Wrap Web Speech API (`SpeechRecognition`/`webkitSpeechRecognition`)
- Support: `en-US`, expand `vi-VN` sau
- Options: `continuous`, `interimResults`
- Return: `transcript`, `isListening`, `isSupported`, `error`, `startListening()`, `stopListening()`
- Error handling: `no-speech`, `audio-capture`, browser unsupported

### 2. AI Assistant Components
**Location:** `src/frontend/src/components/ai-assistant/`

| File | Purpose |
|------|---------|
| `ai-assistant-button.tsx` | Floating button (FAB) bottom-right, màu `#1ed760` |
| `ai-assistant-chat.tsx` | Dialog chính với message list + input |
| `ai-assistant-waves.tsx` | Audio waveform animation khi recording |
| `index.ts` | Barrel export |

### 3. Mock Response System
**File:** `src/frontend/src/lib/ai-assistant/mock-responses.ts`

- Keyword matching cho port operations
- Keywords: appointment, container, gate, yard, driver
- Random responses từ predefined pools
- Simulated typing delay

### 4. Types & Constants
**File:** `src/frontend/src/lib/ai-assistant/types.ts`

```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
```

## Files to Modify

### 1. Admin Layout Integration
**File:** `src/frontend/src/components/layout/admin-layout.tsx`

- Import `AIAssistantButton`
- Add vào layout (after Footer)

```tsx
// Near end of component
<AIAssistantButton />
```

### 2. Optional: AI Assistant Provider
**File:** `src/frontend/src/components/layout/admin-layout.tsx` (or new context)

State management đơn giản:
- `isOpen` - dialog open state
- `messages` - chat history

## Implementation Steps

### Step 1: Hook
```typescript
// src/frontend/src/lib/hooks/use-speech-recognition.ts
// - Check window.SpeechRecognition || window.webkitSpeechRecognition
// - Return isSupported: boolean
// - startListening() / stopListening()
// - onResult callback for real-time transcription
```

### Step 2: Components
```tsx
// ai-assistant-button.tsx
// - Fixed position: bottom-6 right-6
// - CVA variants: idle (green), recording (red pulse)
// - MessageSquare icon với pulse animation

// ai-assistant-waves.tsx
// - 5 animated bars
// - CSS keyframes for height animation

// ai-assistant-chat.tsx
// - Radix Dialog
// - ScrollArea for messages
// - Input với voice button integration
```

### Step 3: Mock Responses
```typescript
// Mock response mapping
const RESPONSES = {
  appointment: "I found 15 appointments today. 8 confirmed, 4 pending.",
  container: "Container MSCU1234567: Currently at Yard A, Spot 12.",
  gate: "Gate 1: Active. Gate 2: Busy. Gate 3: Standby.",
  default: "I'm still learning. I can help with appointments, gates, containers, and yard status."
};
```

### Step 4: Integration
- Add button to admin-layout
- Wire up speech hook
- Connect mock response system

## Styling Conventions

Follow existing patterns:
- Colors: Primary `#1ed760`, Destructive `#f3727f`
- Border radius: `rounded-[500px]` for buttons, `rounded-[16px]` for cards
- Typography: `font-bold`, uppercase tracking
- Dark mode support

## Verification

1. **Build test:** `cd src/frontend && npm run build`
2. **Manual test:**
   - Login admin dashboard
   - Click floating green button
   - Dialog opens
   - Click microphone, speak English
   - Text appears in input
   - Send, see mock response
3. **Browser test:** Chrome (full support), Edge (full), Safari (webkit prefix)

## Estimated Files

| Type | Count |
|------|-------|
| New files | 6 |
| Modified files | 1 |
