// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Button,
//   Text,
//   StyleSheet,
//   ScrollView,
//   NativeModules,
//   NativeEventEmitter,
//   PermissionsAndroid,
// } from "react-native";
// import { api } from "@/libs/api";
// const { AudioCapture } = NativeModules;
// const audioEventEmitter = new NativeEventEmitter(AudioCapture);

// const RTMP_HOST = process.env.EXPO_PUBLIC_RTMP_HOST;
// const RTMP_PORT = 1935;

// export default function NativeBroadcaster() {
//   const [status, setStatus] = useState("Ready");
//   const [logs, setLogs] = useState<string[]>([]);
//   const [isStreaming, setIsStreaming] = useState(false);
//   const [streamId, setStreamId] = useState<string | null>(null);

//   useEffect(() => {
//     const statusSub = audioEventEmitter.addListener(
//       "onStatus",
//       (message: string) => {
//         addLog(`✓ ${message}`);
//         setStatus(message);
//       },
//     );

//     const errorSub = audioEventEmitter.addListener(
//       "onError",
//       (error: string) => {
//         addLog(`✗ ${error}`);
//         setStatus(`Error: ${error}`);
//         setIsStreaming(false);
//       },
//     );

//     const framesSub = audioEventEmitter.addListener(
//       "onFramesSent",
//       (count: string) => addLog(`Frames sent: ${count}`),
//     );

//     return () => {
//       statusSub.remove();
//       errorSub.remove();
//       framesSub.remove();
//     };
//   }, []);

//   const addLog = (message: string) => {
//     console.log(message);
//     setLogs((prev) => [
//       `[${new Date().toLocaleTimeString()}] ${message}`,
//       ...prev,
//     ]);
//   };

//   // ---------------------------------------------------------------------------
//   // API calls — token attached automatically by your axios interceptor
//   // ---------------------------------------------------------------------------

//   const scheduleAndFetchStreamKey = async (): Promise<string> => {
//     addLog("Scheduling stream...");

//     const scheduleRes = await api.post("/streams", {
//       title: "Test Broadcast",
//       category: "music",
//       scheduled_start_time: new Date().toISOString(),
//     });

//     const newStreamId = scheduleRes.data.stream.id;
//     setStreamId(newStreamId);
//     addLog(`Stream scheduled — id: ${newStreamId}`);

//     addLog("Fetching stream key...");
//     const keyRes = await api.get(`/streams/${newStreamId}/stream_key`);

//     addLog("Stream key received");
//     return keyRes.data.stream_key;
//   };

//   // ---------------------------------------------------------------------------
//   // Start
//   // ---------------------------------------------------------------------------

//   const startStreaming = async () => {
//     try {
//       setIsStreaming(true);
//       addLog("Requesting microphone permission...");

//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//         {
//           title: "Microphone Permission",
//           message: "We need access to your microphone to broadcast",
//           buttonNeutral: "Ask Me Later",
//           buttonNegative: "Cancel",
//           buttonPositive: "OK",
//         },
//       );

//       if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
//         addLog("✗ Microphone permission denied");
//         setIsStreaming(false);
//         return;
//       }

//       addLog("✓ Permission granted");

//       const streamKey = await scheduleAndFetchStreamKey();

//       addLog(`Connecting to ${RTMP_HOST}:${RTMP_PORT}...`);

//       const result = await AudioCapture.startCapture(
//         48000,
//         1,
//         192000,
//         RTMP_HOST,
//         RTMP_PORT,
//         streamKey,
//       );

//       addLog(result);
//     } catch (err: any) {
//       const message = err?.message ?? err?.errors ?? "Unknown error";
//       addLog(`✗ ${message}`);
//       setStatus(`Error: ${message}`);
//       setIsStreaming(false);
//     }
//   };

//   // ---------------------------------------------------------------------------
//   // Stop
//   // ---------------------------------------------------------------------------

//   const stopStreaming = async () => {
//     try {
//       addLog("Stopping broadcast...");
//       const result = await AudioCapture.stopCapture();
//       addLog(result);
//       setIsStreaming(false);
//       setStreamId(null);
//     } catch (err: any) {
//       addLog(`✗ ${err.message}`);
//     }
//   };

//   // ---------------------------------------------------------------------------
//   // UI
//   // ---------------------------------------------------------------------------

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Native Audio Broadcaster</Text>
//       <Text style={styles.statusText}>{status}</Text>

//       {streamId && <Text style={styles.streamIdText}>Stream: {streamId}</Text>}

//       <View style={styles.buttonContainer}>
//         <Button
//           title={isStreaming ? "Stop Streaming" : "Start Streaming"}
//           onPress={isStreaming ? stopStreaming : startStreaming}
//           color={isStreaming ? "#ff6b6b" : "#51cf66"}
//         />
//       </View>

//       <ScrollView style={styles.logsContainer}>
//         <Text style={styles.logsTitle}>Logs:</Text>
//         {logs.map((log, idx) => (
//           <Text key={idx} style={styles.logText}>
//             {log}
//           </Text>
//         ))}
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#000", padding: 20 },
//   title: {
//     color: "#fff",
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   statusText: {
//     color: "#51cf66",
//     fontSize: 16,
//     marginBottom: 8,
//     textAlign: "center",
//     fontWeight: "bold",
//   },
//   streamIdText: {
//     color: "#888",
//     fontSize: 11,
//     textAlign: "center",
//     marginBottom: 16,
//     fontFamily: "monospace",
//   },
//   buttonContainer: { marginBottom: 20 },
//   logsContainer: {
//     flex: 1,
//     backgroundColor: "#1a1a1a",
//     borderRadius: 8,
//     padding: 10,
//   },
//   logsTitle: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   logText: {
//     color: "#aaa",
//     fontSize: 11,
//     fontFamily: "monospace",
//     marginBottom: 4,
//   },
// });

import PageHead from "@/components/PageHead";
import Preloader from "@/components/screen/preloader";
import { StreamCard, StreamParticipants } from "@/components/StreamCard";
import { icons } from "@/constants/icons";
import { illus } from "@/constants/illustration";
import { useLivePrivacySheet } from "@/context/CreateSheetContext";
import { useStream } from "@/context/stream/StreamSetUp";
import { api } from "@/libs/api";
import { getAuth } from "@/storage/authStorage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

interface StreamDataType {
  streams: { id: string; [key: string]: any }[];
}

// ─── One hook manages all stream participant channels ─────────────────────────
function useStreamParticipants(
  streamIds: string[],
  token: string | null,
): Record<string, StreamParticipants> {
  const [map, setMap] = useState<Record<string, StreamParticipants>>({});

  // Keep all WebSocket connections in a ref — keyed by stream id
  const socketsRef = useRef<Map<string, WebSocket>>(new Map());
  const handlersRef = useRef<Map<string, () => void>>(new Map());

  useEffect(() => {
    if (!token || streamIds.length === 0) return;

    let msgRef = 0;
    const makeRef = () => String(++msgRef);

    const encode = (
      joinRef: string | null,
      ref: string | null,
      topic: string,
      event: string,
      payload: object,
    ) => JSON.stringify([joinRef, ref, topic, event, payload]);

    const decode = (raw: string) => {
      try {
        const [join_ref, ref, topic, event, payload] = JSON.parse(raw);
        return { join_ref, ref, topic, event, payload };
      } catch {
        return null;
      }
    };

    // Open one WebSocket per stream id
    streamIds.forEach((streamId) => {
      // Skip if already connected for this id
      if (socketsRef.current.has(streamId)) return;

      const topic = `scheduled_stream:${streamId}`;
      const url = `ws://10.0.2.2:4000/socket/websocket?token=${token}&vsn=2.0.0`;
      const ws = new WebSocket(url);
      let joinRef: string | null = null;

      ws.onopen = () => {
        console.log(`[participants] socket open for ${streamId}`);
        const jRef = makeRef();
        joinRef = jRef;
        ws.send(encode(jRef, jRef, topic, "phx_join", {}));
      };

      ws.onmessage = (e) => {
        const msg = decode(e.data);
        if (!msg) return;

        if (msg.event === "phx_reply") {
          if (msg.join_ref === joinRef && msg.payload?.status === "ok") {
            console.log(`[participants] joined ${topic}`);
          } else if (msg.payload?.status === "error") {
            console.error(
              `[participants] join rejected for ${topic}:`,
              msg.payload.response,
            );
          }
          return;
        }

        if (msg.event === "participants_updated") {
          console.log(`[participants] updated for ${streamId}:`, msg.payload);
          setMap((prev) => ({ ...prev, [streamId]: msg.payload }));
        }
      };

      ws.onerror = (e) => {
        console.error(`[participants] error for ${streamId}:`, e);
      };

      ws.onclose = (e) => {
        console.log(`[participants] closed for ${streamId} — code=${e.code}`);
        socketsRef.current.delete(streamId);
      };

      socketsRef.current.set(streamId, ws);
    });

    // Cleanup function — close all sockets opened in this effect
    return () => {
      socketsRef.current.forEach((ws, id) => {
        console.log(`[participants] closing socket for ${id}`);
        ws.close();
      });
      socketsRef.current?.clear();
    };
  }, [token, streamIds.join(",")]);

  return map;
}
// ─── Screen ───────────────────────────────────────────────────────────────────
const CreatorLive = () => {
  const { ref: sheetRef } = useLivePrivacySheet();
  const { title, description } = useStream();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [streamData, setStreamData] = useState<StreamDataType | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load token once at screen level
  useEffect(() => {
    getAuth()
      .then((data) => setToken(data?.accessToken ?? null))
      .catch(() => setToken(null));
  }, []);

  const streamIds = streamData?.streams?.map((s) => s.id) ?? [];

  // All participant channels managed here — one WebSocket per stream topic
  const participantsMap = useStreamParticipants(streamIds, token);

  const handleAction = () => {
    if (title === "" && description === "") {
      sheetRef.current?.expand();
    } else {
      router.push("/creator/Schedule");
    }
  };

  useEffect(() => {
    setIsLoading(true);
    api
      .get("/streams/my")
      .then((response) => {
        if (response.data) setStreamData(response.data);
      })
      .catch((error) => console.error("Error loading data:", error))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Preloader />;

  if (
    !streamData ||
    streamData?.streams.length === 0 ||
    streamData?.streams.every((stream) => stream.status === "ended")
  ) {
    return (
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ alignItems: "center", minHeight: 100 }}
        className="flex-1 bg-CreatorBG relative"
      >
        <View className="absolute top-0 left-0 inset-0 flex-col items-center justify-between h-screen w-screen">
          <LinearGradient
            colors={[
              "rgba(255,255,255,0.3)",
              "rgba(255,255,255,0.1)",
              "rgba(26,26,46,1)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            className="h-3/5 w-screen"
          />
        </View>
        <View className="flex-1 w-full h-[90vh] flex-col items-center justify-start pt-16">
          <View className="w-full h-[54vh] flex flex-row items-center justify-center">
            <Image source={illus.globe} className="w-full h-full" />
          </View>
          <View className="w-full h-[30vh] flex-col items-center justify-between p-2 pt-12">
            <View className="w-full flex-col items-center justify-center gap-2">
              <Text className="text-textPrimary font-MonBold text-3xl">
                Ready to go live?
              </Text>
              <Text className="text-textSecondary font-MonRegular text-center">
                Stream your audio/voice live or schedule your next podcast
              </Text>
            </View>
            <Pressable
              onPress={handleAction}
              className="bg-primary w-full h-14 flex items-center justify-center rounded-2xl"
            >
              <Text className="text-textPrimary font-MonBold text-lg">
                Start
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View className="flex-1 bg-CreatorBG">
      <PageHead
        title="My Streams"
        has_profile={true}
        customIcons={[
          { icon: icons.plus, onPress: handleAction, testID: "share-btn" },
        ]}
      />
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      >
        {streamData?.streams
          ?.filter((stream) => stream.status !== "ended")
          .map((stream) => (
            <StreamCard
              key={stream.id}
              stream={stream}
              participants={participantsMap[stream.id] ?? null}
            />
          ))}
      </ScrollView>
    </View>
  );
};

export default CreatorLive;
