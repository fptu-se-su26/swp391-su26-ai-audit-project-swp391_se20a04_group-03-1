/**
 * useSSE — Server-Sent Events Hook
 *
 * React Native-compatible SSE hook powered by `react-native-sse`.
 * Auto-reconnects on error with configurable interval.
 *
 * @example
 * ```ts
 * const esRef = useSSE('http://api.example.com/events', (data) => {
 *   console.log('Received:', data);
 * });
 * ```
 */
import { useEffect, useRef } from 'react';
import EventSource, { type EventSourceEvent } from 'react-native-sse';

type MessageHandler = (data: unknown) => void;

interface UseSSEOptions {
  /** Milliseconds before reconnecting after an error. Default: 3000 */
  reconnectInterval?: number;
}

/**
 * Subscribe to a Server-Sent Events endpoint.
 *
 * @param url    - SSE endpoint URL, or `null` to skip connection.
 * @param onMessage - Callback invoked for each message event.
 * @param options - Configuration options.
 * @returns A ref to the underlying EventSource (for imperative close).
 */
export function useSSE(
  url: string | null,
  onMessage: MessageHandler,
  options?: UseSSEOptions,
) {
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!url) return;

    let mounted = true;

    const connect = () => {
      try {
        const es = new EventSource(url);
        esRef.current = es;

        es.addEventListener('message', (event: EventSourceEvent<'message'>) => {
          if (!mounted) return;
          try {
            const parsed = JSON.parse(event.data ?? '');
            onMessage(parsed);
          } catch {
            onMessage(event.data);
          }
        });

        es.addEventListener('error', (_event: EventSourceEvent<'error'>) => {
          es.close();
          esRef.current = null;
          if (!mounted) return;
          setTimeout(connect, options?.reconnectInterval ?? 3000);
        });
      } catch (err) {
        console.error('[useSSE] connection failed:', err);
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
