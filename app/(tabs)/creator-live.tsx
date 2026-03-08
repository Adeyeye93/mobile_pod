// src/screens/NativeBroadcaster.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Button,
  Text,
  StyleSheet,
  ScrollView,
  NativeModules,
  NativeEventEmitter,
  PermissionsAndroid,
} from "react-native";
import { api } from "@/libs/api";
const { AudioCapture } = NativeModules;
const audioEventEmitter = new NativeEventEmitter(AudioCapture);

const RTMP_HOST = process.env.EXPO_PUBLIC_RTMP_HOST || "10.0.2.2";
const RTMP_PORT = 1935;

export default function NativeBroadcaster() {
  const [status, setStatus] = useState("Ready");
  const [logs, setLogs] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamId, setStreamId] = useState<string | null>(null);

  useEffect(() => {
    const statusSub = audioEventEmitter.addListener(
      "onStatus",
      (message: string) => {
        addLog(`✓ ${message}`);
        setStatus(message);
      },
    );

    const errorSub = audioEventEmitter.addListener(
      "onError",
      (error: string) => {
        addLog(`✗ ${error}`);
        setStatus(`Error: ${error}`);
        setIsStreaming(false);
      },
    );

    const framesSub = audioEventEmitter.addListener(
      "onFramesSent",
      (count: string) => addLog(`Frames sent: ${count}`),
    );

    return () => {
      statusSub.remove();
      errorSub.remove();
      framesSub.remove();
    };
  }, []);

  const addLog = (message: string) => {
    console.log(message);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] ${message}`,
      ...prev,
    ]);
  };

  // ---------------------------------------------------------------------------
  // API calls — token attached automatically by your axios interceptor
  // ---------------------------------------------------------------------------

  const scheduleAndFetchStreamKey = async (): Promise<string> => {
    addLog("Scheduling stream...");

    const scheduleRes = await api.post("/streams", {
      title: "Test Broadcast",
      category: "music",
      scheduled_start_time: new Date().toISOString(),
    });

    const newStreamId = scheduleRes.data.stream.id;
    setStreamId(newStreamId);
    addLog(`Stream scheduled — id: ${newStreamId}`);

    addLog("Fetching stream key...");
    const keyRes = await api.get(`/streams/${newStreamId}/stream_key`);

    addLog("Stream key received");
    return keyRes.data.stream_key;
  };

  // ---------------------------------------------------------------------------
  // Start
  // ---------------------------------------------------------------------------

  const startStreaming = async () => {
    try {
      setIsStreaming(true);
      addLog("Requesting microphone permission...");

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: "Microphone Permission",
          message: "We need access to your microphone to broadcast",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        },
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        addLog("✗ Microphone permission denied");
        setIsStreaming(false);
        return;
      }

      addLog("✓ Permission granted");

      const streamKey = await scheduleAndFetchStreamKey();

      addLog(`Connecting to ${RTMP_HOST}:${RTMP_PORT}...`);

      const result = await AudioCapture.startCapture(
        48000,
        1,
        192000,
        RTMP_HOST,
        RTMP_PORT,
        streamKey,
      );

      addLog(result);
    } catch (err: any) {
      const message = err?.message ?? err?.errors ?? "Unknown error";
      addLog(`✗ ${message}`);
      setStatus(`Error: ${message}`);
      setIsStreaming(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Stop
  // ---------------------------------------------------------------------------

  const stopStreaming = async () => {
    try {
      addLog("Stopping broadcast...");
      const result = await AudioCapture.stopCapture();
      addLog(result);
      setIsStreaming(false);
      setStreamId(null);
    } catch (err: any) {
      addLog(`✗ ${err.message}`);
    }
  };

  // ---------------------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------------------

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Native Audio Broadcaster</Text>
      <Text style={styles.statusText}>{status}</Text>

      {streamId && <Text style={styles.streamIdText}>Stream: {streamId}</Text>}

      <View style={styles.buttonContainer}>
        <Button
          title={isStreaming ? "Stop Streaming" : "Start Streaming"}
          onPress={isStreaming ? stopStreaming : startStreaming}
          color={isStreaming ? "#ff6b6b" : "#51cf66"}
        />
      </View>

      <ScrollView style={styles.logsContainer}>
        <Text style={styles.logsTitle}>Logs:</Text>
        {logs.map((log, idx) => (
          <Text key={idx} style={styles.logText}>
            {log}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 20 },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  statusText: {
    color: "#51cf66",
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "bold",
  },
  streamIdText: {
    color: "#888",
    fontSize: 11,
    textAlign: "center",
    marginBottom: 16,
    fontFamily: "monospace",
  },
  buttonContainer: { marginBottom: 20 },
  logsContainer: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 10,
  },
  logsTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
  },
  logText: {
    color: "#aaa",
    fontSize: 11,
    fontFamily: "monospace",
    marginBottom: 4,
  },
});
