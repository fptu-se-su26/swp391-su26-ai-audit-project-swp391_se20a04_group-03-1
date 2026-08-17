"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, X, Send, Mic, MicOff, Loader2, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "@/lib/hooks/use-speech-recognition";
import { getMockResponse, simulateTypingEffect } from "@/lib/ai-assistant/mock-responses";
import {
  ChatMessage,
  WELCOME_MESSAGE,
  generateId,
} from "@/lib/ai-assistant/types";
import { AudioWaves } from "./ai-assistant-waves";

// Dialog styling following project patterns
const dialogContentStyles = `
  fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] sm:max-w-lg
  -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl
  bg-[#ffffff] dark:bg-[#181818]
  border border-[#e5e5e5] dark:border-[#272727]
  p-0 shadow-2xl
  animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-300
`;

const scrollAreaStyles = `
  flex-1 overflow-y-auto px-4 py-2 max-h-[400px] min-h-[300px]
`;

interface AIAssistantChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

export function AIAssistantChat({
  open,
  onOpenChange,
  className,
}: AIAssistantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [displayedResponse, setDisplayedResponse] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Initialize with welcome message when dialog opens
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([WELCOME_MESSAGE]);
    }
  }, [open, messages.length]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, displayedResponse]);

  // Speech recognition hook
  const {
    interimTranscript,
    isListening,
    isSupported,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    lang: "en-US",
    continuous: false,
    interimResults: true,
    onResult: (transcript, isFinal) => {
      if (isFinal) {
        setInputValue((prev) => prev + transcript);
        resetTranscript();
      }
    },
  });

  // Stop cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  // Handle voice toggle
  const handleVoiceToggle = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Handle send message
  const handleSendMessage = useCallback(
    (text?: string) => {
      const messageText = text || inputValue.trim();
      if (!messageText) return;

      // Add user message
      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        content: messageText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsProcessing(true);
      setDisplayedResponse("");

      // Simulate AI response with typing effect
      const response = getMockResponse(messageText);

      cleanupRef.current = simulateTypingEffect(
        response,
        (char) => {
          setDisplayedResponse((prev) => prev + char);
        },
        () => {
          const aiMessage: ChatMessage = {
            id: generateId(),
            role: "assistant",
            content: response,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, aiMessage]);
          setIsProcessing(false);
          setDisplayedResponse("");
        }
      );
    },
    [inputValue]
  );

  // Handle keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Don't render if closed
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 animate-in fade-in-0"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className={cn(dialogContentStyles, className)}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#e5e5e5] dark:border-[#272727]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1ed760] flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-[#121212] dark:text-white">
                AI Assistant
              </h2>
              <p className="text-xs text-[#666666] dark:text-[#b3b3b3]">
                {isListening ? "Listening..." : "Ready to help"}
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-full hover:bg-[#f5f5f5] dark:hover:bg-[#272727] flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-[#666666]" />
          </button>
        </div>

        {/* Messages */}
        <div className={scrollAreaStyles}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2 mb-4",
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center",
                  message.role === "user"
                    ? "bg-[#1ed760]"
                    : "bg-[#f5f5f5] dark:bg-[#272727]"
                )}
              >
                {message.role === "user" ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-[#666666]" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={cn(
                  "max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed",
                  message.role === "user"
                    ? "bg-[#1ed760] text-white rounded-tr-md"
                    : "bg-[#f5f5f5] dark:bg-[#272727] text-[#121212] dark:text-white rounded-tl-md",
                  "whitespace-pre-wrap"
                )}
              >
                {message.content}
              </div>
            </div>
          ))}

          {/* Typing indicator / Processing response */}
          {isProcessing && (
            <div className="flex gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#f5f5f5] dark:bg-[#272727] flex items-center justify-center">
                <Bot className="w-4 h-4 text-[#666666]" />
              </div>
              <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tl-md bg-[#f5f5f5] dark:bg-[#272727]">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#1ed760]" />
                  <span className="text-sm text-[#666666]">
                    {displayedResponse || "Thinking..."}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Interim transcript display */}
          {interimTranscript && (
            <div className="flex gap-2 mb-4 flex-row-reverse">
              <div className="max-w-[80%] px-4 py-2 rounded-2xl rounded-tr-md bg-[#1ed760]/80 text-white text-sm italic">
                {interimTranscript}
              </div>
            </div>
          )}

          {/* Error message */}
          {speechError && (
            <div className="mb-4 p-3 rounded-xl bg-[#f3727f]/10 border border-[#f3727f]/30 text-sm text-[#f3727f]">
              {speechError}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[#e5e5e5] dark:border-[#272727]">
          <div className="flex items-center gap-2">
            {/* Text Input */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={isProcessing}
                className={cn(
                  "w-full h-12 px-4 pr-12 rounded-[500px]",
                  "bg-[#f5f5f5] dark:bg-[#272727]",
                  "border border-transparent focus:border-[#1ed760] focus:outline-none",
                  "text-[#121212] dark:text-white placeholder:text-[#888888]",
                  "transition-colors duration-200",
                  "disabled:opacity-50"
                )}
              />
            </div>

            {/* Voice Button */}
            {!isSupported ? (
              <button
                disabled
                className="w-12 h-12 rounded-full bg-[#888888] flex items-center justify-center"
                title="Speech not supported in this browser"
              >
                <MicOff className="w-5 h-5 text-white" />
              </button>
            ) : (
              <button
                onClick={handleVoiceToggle}
                disabled={isProcessing}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200",
                  isListening
                    ? "bg-[#f3727f] animate-pulse"
                    : "bg-[#1ed760] hover:bg-[#1db954]",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                aria-label={isListening ? "Stop listening" : "Start listening"}
              >
                {isListening ? (
                  <AudioWaves size="sm" />
                ) : (
                  <Mic className="w-5 h-5 text-white" />
                )}
              </button>
            )}

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isProcessing}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200",
                inputValue.trim() && !isProcessing
                  ? "bg-[#1ed760] hover:bg-[#1db954]"
                  : "bg-[#888888] cursor-not-allowed"
              )}
              aria-label="Send message"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Hint text */}
          <p className="mt-2 text-xs text-center text-[#888888]">
            Press Enter to send or click the microphone to speak
          </p>
        </div>
      </div>
    </>
  );
}
