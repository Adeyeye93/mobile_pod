import { useEffect, useRef, useState } from "react";
import { encode, decode } from "@/libs/websoket";
import { getAuth } from "@/storage/authStorage";

export interface ListeningPartyState {
  listenerCount: number;
  connected: boolean;
}

export function useListeningParty(
  trackId: string | undefined,
  playing: boolean,
): ListeningPartyState {
  const [listenerCount, setListenerCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const msgCounter = useRef(0);
  const makeRef = () => String(++msgCounter.current);

  // Load auth token once
  useEffect(() => {
    getAuth().then((d) => setToken(d?.accessToken ?? null));
  }, []);

  useEffect(() => {
    if (!trackId || !token || !playing) {
      cleanup();
      return;
    }

    const wsBase =
      process.env.EXPO_PUBLIC_WS_URL ?? "ws://10.0.2.2:4000/socket/websocket";

    const topic = `listening:${trackId}`;
    const ws = new WebSocket(`${wsBase}?token=${token}&vsn=2.0.0`);
    wsRef.current = ws;

    ws.onopen = () => {
      const jRef = makeRef();
      ws.send(encode(jRef, jRef, topic, "phx_join", {}));

      heartbeatRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(encode(null, makeRef(), "phoenix", "heartbeat", {}));
        }
      }, 30_000);
    };

    ws.onmessage = (e) => {
      const msg = decode(e.data);
      if (!msg) return;

      switch (msg.event) {
        case "phx_reply":
          if (msg.payload?.status === "ok") setConnected(true);
          break;

        // Primary source — backend sends this on join + every presence change
        case "listener_count":
          setListenerCount(msg.payload?.count ?? 0);
          break;

        // Fallback: full presence snapshot on join
        // Shape: { user_id: { metas: [{ user_id, joined_at }] } }
        case "presence_state":
          setListenerCount(Object.keys(msg.payload ?? {}).length);
          break;

        // Fallback: incremental diff after join
        // Shape: { joins: { ... }, leaves: { ... } }
        case "presence_diff": {
          const joins = Object.keys(msg.payload?.joins ?? {}).length;
          const leaves = Object.keys(msg.payload?.leaves ?? {}).length;
          setListenerCount((prev) => Math.max(0, prev + joins - leaves));
          break;
        }
      }
    };

    ws.onerror = () => setConnected(false);
    ws.onclose = () => {
      setConnected(false);
      setListenerCount(0);
    };

    return cleanup;
  }, [trackId, token, playing]);

  function cleanup() {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
    setListenerCount(0);
  }

  return { listenerCount, connected };
}
