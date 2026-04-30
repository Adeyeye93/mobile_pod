import { useCallback, useEffect, useRef, useState } from "react";

let msgRef = 0;
const makeRef = () => String(++msgRef);

function encode(
  joinRef: string | null,
  ref: string | null,
  topic: string,
  event: string,
  payload: object,
) {
  return JSON.stringify([joinRef, ref, topic, event, payload]);
}

function decode(raw: string) {
  try {
    const [join_ref, ref, topic, event, payload] = JSON.parse(raw);
    return { join_ref, ref, topic, event, payload };
  } catch {
    return null;
  }
}

type EventHandler = (payload: any) => void;

interface UsePhoenixChannelProps {
  url: string;
  topic: string;
  token: string;
  onMessage?: (event: string, payload: any) => void;
  autoConnect?: boolean;
}

interface UsePhoenixChannelReturn {
  isConnected: boolean;
  isJoined: boolean;
  connect: () => void;
  disconnect: () => void;
  push: (event: string, payload?: object) => void;
  on: (event: string, handler: EventHandler) => () => void;
}

export function usePhoenixChannel({
  url,
  topic,
  token,
  onMessage,
  autoConnect = false,
}: UsePhoenixChannelProps): UsePhoenixChannelReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const joinRefRef = useRef<string | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const handlersRef = useRef<Map<string, Set<EventHandler>>>(new Map());

  // ✅ Keep token in a ref so connect() always reads the latest value
  // without needing to be re-memoized every time token changes
  const tokenRef = useRef(token);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const dispatch = useCallback((event: string, payload: any) => {
    console.log(
      `[PhoenixChannel] dispatching event="${event}" payload=`,
      payload,
    );
    const handlers = handlersRef.current.get(event);
    console.log(
      `[PhoenixChannel] handlers registered for "${event}":`,
      handlers?.size ?? 0,
    );
    handlers?.forEach((h) => h(payload));
    onMessageRef.current?.(event, payload);
  }, []);

  const startHeartbeat = useCallback((ws: WebSocket) => {
    heartbeatRef.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        console.log("[PhoenixChannel] sending heartbeat");
        ws.send(encode(null, makeRef(), "phoenix", "heartbeat", {}));
      }
    }, 30_000);
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current) {
      console.warn("[PhoenixChannel] Already connected — skipping");
      return;
    }

    // ✅ Read token from ref, not closure — always fresh
    const currentToken = tokenRef.current;
    if (!currentToken) {
      console.warn("[PhoenixChannel] No token yet — aborting connect");
      return;
    }

    const socketUrl = `${url}?token=${currentToken}&vsn=2.0.0`;
    console.log("[PhoenixChannel] Connecting to:", socketUrl);
    console.log("[PhoenixChannel] Topic:", topic);

    const ws = new WebSocket(socketUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(
        "[PhoenixChannel] ✅ Socket open — sending phx_join for",
        topic,
      );
      setIsConnected(true);

      const jRef = makeRef();
      joinRefRef.current = jRef;
      const joinMsg = encode(jRef, jRef, topic, "phx_join", {});
      console.log("[PhoenixChannel] phx_join frame:", joinMsg);
      ws.send(joinMsg);

      startHeartbeat(ws);
    };

    ws.onmessage = (e) => {
      console.log("[PhoenixChannel] ⬇ raw message:", e.data);
      const msg = decode(e.data);
      if (!msg) {
        console.warn("[PhoenixChannel] Failed to decode message:", e.data);
        return;
      }

      console.log("[PhoenixChannel] decoded:", msg);

      switch (msg.event) {
        case "phx_reply": {
          const isOurJoin =
            msg.join_ref === joinRefRef.current && msg.payload?.status === "ok";
          console.log(
            `[PhoenixChannel] phx_reply — join_ref match=${msg.join_ref === joinRefRef.current} status=${msg.payload?.status}`,
          );
          if (isOurJoin) {
            console.log("[PhoenixChannel] ✅ Channel joined:", topic);
            setIsJoined(true);
            dispatch("phx_join", msg.payload.response);
          } else if (msg.payload?.status === "error") {
            console.error(
              "[PhoenixChannel] ❌ Join rejected:",
              msg.payload.response,
            );
          }
          break;
        }

        case "phx_error":
          console.error("[PhoenixChannel] ❌ Channel error:", msg.payload);
          setIsJoined(false);
          break;

        case "phx_close":
          console.log("[PhoenixChannel] Channel closed by server");
          setIsJoined(false);
          break;

        default:
          console.log(
            `[PhoenixChannel] App event: "${msg.event}"`,
            msg.payload,
          );
          dispatch(msg.event, msg.payload);
          break;
      }
    };

    ws.onerror = (e) => {
      console.error("[PhoenixChannel] ❌ WebSocket error:", e);
      setIsConnected(false);
      setIsJoined(false);
    };

    ws.onclose = (e) => {
      console.log(
        `[PhoenixChannel] Closed — code=${e.code} reason="${e.reason}" wasClean=${e.wasClean}`,
      );
      setIsConnected(false);
      setIsJoined(false);
      wsRef.current = null;
      joinRefRef.current = null;
      stopHeartbeat();
    };
    // ✅ No token in deps — read from ref inside instead
  }, [url, topic, startHeartbeat, stopHeartbeat, dispatch]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN && joinRefRef.current) {
        console.log("[PhoenixChannel] Sending phx_leave before disconnect");
        wsRef.current.send(
          encode(joinRefRef.current, makeRef(), topic, "phx_leave", {}),
        );
      }
      wsRef.current.close();
      wsRef.current = null;
    }
    stopHeartbeat();
    setIsConnected(false);
    setIsJoined(false);
  }, [topic, stopHeartbeat]);

  const push = useCallback(
    (event: string, payload: object = {}) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.warn("[PhoenixChannel] Not connected — cannot push:", event);
        return;
      }
      if (!isJoined) {
        console.warn("[PhoenixChannel] Not joined — cannot push:", event);
        return;
      }
      console.log(`[PhoenixChannel] pushing event="${event}"`, payload);
      wsRef.current.send(
        encode(joinRefRef.current, makeRef(), topic, event, payload),
      );
    },
    [topic, isJoined],
  );

  const on = useCallback(
    (event: string, handler: EventHandler): (() => void) => {
      console.log(`[PhoenixChannel] registering handler for "${event}"`);
      if (!handlersRef.current.has(event)) {
        handlersRef.current.set(event, new Set());
      }
      handlersRef.current.get(event)!.add(handler);

      return () => {
        console.log(`[PhoenixChannel] removing handler for "${event}"`);
        handlersRef.current.get(event)?.delete(handler);
      };
    },
    [],
  );

  useEffect(() => {
    if (autoConnect) connect();
    return () => disconnect();
  }, []);

  return { isConnected, isJoined, connect, disconnect, push, on };
}
