import { useRef, useState, useCallback } from "react";

interface UseWebSocketProps {
  url: string;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  serverMessage: string;
  openWebSocket: () => void;
  closeWebSocket: () => void;
  sendMessage: (message: string) => void;
  setIsConnected: (connected: boolean) => void;
}

export function useWebSocket({ url }: UseWebSocketProps): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const wsRef = useRef<WebSocket | null>(null);

  const openWebSocket = useCallback(() => {
    if (wsRef.current) {
      console.warn("WebSocket is already open");
      return;
    }

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connection opened");
      setIsConnected(true);
    };

    ws.onmessage = (e) => {
      console.log("Message from server:", e.data);
      console.log("Server Message Updated:", e.data);
      setServerMessage(e.data);
    };

    ws.onerror = (e) => {
      console.error("WebSocket error:", e);
      setIsConnected(false);
    };

    ws.onclose = (e) => {
      console.log("WebSocket connection closed:", e.code, e.reason);
      setIsConnected(false);
      wsRef.current = null;
    };
  }, [url]);

  const closeWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const sendMessage = useCallback((message: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    } else {
      console.warn("WebSocket is not open. Cannot send message.");
    }
  }, []);

  return {
    isConnected,
    serverMessage,
    openWebSocket,
    closeWebSocket,
    sendMessage,
    setIsConnected,
  };
}
