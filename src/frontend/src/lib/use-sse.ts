"use client";

import { useEffect, useRef } from "react";

type MessageHandler = (data: any) => void;

export function useSSE(
  url: string | null,
  onMessage: MessageHandler,
  options?: { reconnectInterval?: number },
) {
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!url) return;
    let mounted = true;
    const connect = () => {
      try {
        const es = new EventSource(url as string);
        esRef.current = es;
        es.onmessage = (e) => {
          try {
            const parsed = JSON.parse(e.data);
            onMessage(parsed);
          } catch (err) {
            onMessage(e.data);
          }
        };
        es.onerror = () => {
          // try reconnect
          es.close();
          if (!mounted) return;
          setTimeout(connect, options?.reconnectInterval ?? 3000);
        };
      } catch (err) {
        console.error("SSE connection failed", err);
        setTimeout(connect, options?.reconnectInterval ?? 3000);
      }
    };

    connect();

    return () => {
      mounted = false;
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, [url]);

  return esRef;
}
