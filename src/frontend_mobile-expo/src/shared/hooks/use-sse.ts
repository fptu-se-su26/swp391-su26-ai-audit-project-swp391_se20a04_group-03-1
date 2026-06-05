import { useEffect, useRef } from "react";
import EventSource, { EventSourceEvent } from "react-native-sse";

type MessageHandler = (data: any) => void;

/**
 * React Native-compatible SSE hook powered by `react-native-sse`.
 *
 * Drop-in replacement for the browser-based version:
 *  - Same signature: `useSSE(url, onMessage, options?)`
 *  - Reconnects automatically on error with the given `reconnectInterval`
 *    (default 3 000 ms).
 *  - Cleans up the EventSource on unmount or when `url` changes.
 */
export function useSSE(
  url: string | null,
  onMessage: MessageHandler,
  options?: { reconnectInterval?: number },
) {
  // Keep a ref so callers can inspect / close the source imperatively if needed.
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!url) return;

    let mounted = true;

    const connect = () => {
      try {
        const es = new EventSource(url);
        esRef.current = es;

        // react-native-sse emits typed events; 'message' is the default event.
        es.addEventListener("message", (event: EventSourceEvent<"message">) => {
          if (!mounted) return;
          try {
            const parsed = JSON.parse(event.data ?? "");
            onMessage(parsed);
          } catch {
            onMessage(event.data);
          }
        });

        es.addEventListener("error", (_event: EventSourceEvent<"error">) => {
          es.close();
          esRef.current = null;
          if (!mounted) return;
          setTimeout(connect, options?.reconnectInterval ?? 3000);
        });
      } catch (err) {
        console.error("[useSSE] connection failed:", err);
        if (!mounted) return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return esRef;
}
