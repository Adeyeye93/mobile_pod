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
} from "react-native";

const { AudioCapture } = NativeModules;
const audioEventEmitter = new NativeEventEmitter(AudioCapture);

export default function NativeBroadcaster() {
  const [status, setStatus] = useState("Ready");
  const [logs, setLogs] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    const statusSubscription = audioEventEmitter.addListener(
      "onStatus",
      (message: string) => {
        addLog(`✓ ${message}`);
        setStatus(message);
      },
    );

    const errorSubscription = audioEventEmitter.addListener(
      "onError",
      (error: string) => {
        addLog(`✗ Error: ${error}`);
        setStatus(`Error: ${error}`);
      },
    );

    const framesSubscription = audioEventEmitter.addListener(
      "onFramesSent",
      (count: string) => {
        addLog(`Frames sent: ${count}`);
      },
    );

    return () => {
      statusSubscription.remove();
      errorSubscription.remove();
      framesSubscription.remove();
    };
  }, []);

  const addLog = (message: string) => {
    console.log(message);
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);
  };

  const startStreaming = async () => {
    try {
      addLog("Starting native audio capture...");
      setIsStreaming(true);

      const result = await AudioCapture.startCapture(
        48000, // sample rate
        1, // channels (mono)
        192000, // bitrate (192kbps)
        "10.0.2.2", // server (Android emulator localhost)
        1935, // RTMP port
      );

      addLog(result);
    } catch (error: any) {
      addLog(`Error: ${error.message}`);
      setIsStreaming(false);
    }
  };

  const stopStreaming = async () => {
    try {
      addLog("Stopping audio capture...");
      const result = await AudioCapture.stopCapture();
      addLog(result);
      setIsStreaming(false);
    } catch (error: any) {
      addLog(`Error: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Native Audio Broadcaster</Text>
      <Text style={styles.statusText}>{status}</Text>

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
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
  },
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
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  buttonContainer: {
    marginBottom: 20,
  },
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
