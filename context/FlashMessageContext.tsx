import React, { createContext, useContext, useMemo, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Image
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  interpolate,
} from "react-native-reanimated";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import { icons } from "@/constants/icons";

type ToastType = "info" | "success" | "danger";

export interface ToastOptions {
  id?: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number; // ms
}

type ShowToast = (opts: ToastOptions) => void;

const ToastContext = createContext<{ show: ShowToast } | null>(null);
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within FlashToastProvider");
  return ctx;
};

/** --- Constants --- */
const TOAST_WIDTH = 320;
const TOAST_HEIGHT = 64;
const ENTER_Y = -20;
const EXIT_Y = -36;
const DEFAULT_DURATION = 3000;

/** --- Helper: simple icon render --- */
function Icon({ type }: { type: ToastType }) {
  const color =
    type === "success" ? "#0ACF83" : type === "danger" ? "#FF5C5C" : "#3EA6FF";
  return (
    <View style={[styles.icon, { backgroundColor: color }]}>
      <Image
        style={styles.iconText}
        source={type === "success" ? icons.succ_flash : type === "danger" ? icons.error_flash : icons.info_flash}
      />
    </View>
  );
}

/** --- Single Toast component (animated + draggable) --- */
function ToastView({
  toast,
  onHide,
}: {
  toast: ToastOptions;
  onHide: (id: string | undefined) => void;
}) {
  const translateY = useSharedValue(ENTER_Y);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.98);
  const offsetY = useSharedValue(0);
  const isClosing = useRef(false);

  React.useEffect(() => {
    translateY.value = withSpring(0, { damping: 18, stiffness: 220 });
    opacity.value = withTiming(1, { duration: 220 });
    scale.value = withTiming(1, { duration: 350 });
    let t = setTimeout(() => {
      if ((toast.duration ?? DEFAULT_DURATION) > 0) {
        hide();
      }
    }, toast.duration ?? DEFAULT_DURATION);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hide = (bySwipe = false) => {
    if (isClosing.current) return;
    isClosing.current = true;
    translateY.value = withTiming(EXIT_Y + (bySwipe ? -10 : 0), {
      duration: 240,
    });
    opacity.value = withTiming(0, { duration: 220 }, () => {
      runOnJS(onHide)(toast.id);
    });
    scale.value = withTiming(0.98, { duration: 200 });
  };

  const gestureHandler = (event: PanGestureHandlerGestureEvent) => {
    const vy = event.nativeEvent.velocityY;
    const dy = event.nativeEvent.translationY;
    if (event.nativeEvent.state === 5 /* END */) {
      if (dy < -20 || vy < -200) {
        translateY.value = withTiming(EXIT_Y - Math.abs(vy) / 1000, {
          duration: 220,
        });
        opacity.value = withTiming(0, {}, () => runOnJS(onHide)(toast.id));
      } else {
        translateY.value = withSpring(0, { damping: 18, stiffness: 220 });
      }
      offsetY.value = 0;
    } else {
      offsetY.value = Math.min(0, dy);
      translateY.value = offsetY.value / 2;
      opacity.value = interpolate(translateY.value, [0, -20], [1, 0.8]);
    }
  };

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <PanGestureHandler
      onGestureEvent={gestureHandler}
      onHandlerStateChange={gestureHandler}
    >
      <Animated.View style={[styles.toastContainer, aStyle]}>
        <View style={styles.toastInner}>
          <Icon type={toast.type ?? "info"} />
          <View style={styles.textContainer}>
            {toast.title ? (
              <Text className="font-MonBold" style={styles.title}>{toast.title}</Text>
            ) : null}
            <Text className="font-MonRegular" numberOfLines={2} style={styles.message}>
              {toast.message}
            </Text>
          </View>

          <Pressable onPress={() => hide()} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
}

/** --- Toast Overlay Container (rendered at root level) --- */
export function FlashToastOverlay() {

  // Store reference in context for overlay to access
  React.useEffect(() => {
    // The provider will set these
  }, []);

  // For now, return null - the real implementation is in the provider
  return null;
}

/** --- Provider that manages queue and renders one toast at a time --- */
export const FlashToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queueRef = useRef<ToastOptions[]>([]);
  const [, tick] = React.useState(0);
  const currentRef = useRef<ToastOptions | null>(null);

  const forceUpdate = () => tick((n) => n + 1);

  const show: ShowToast = (opts) => {
    const toast = {
      id: String(Date.now()) + Math.random().toString(36).slice(2),
      ...opts,
    };
    queueRef.current.push(toast);
    if (!currentRef.current) {
      currentRef.current = queueRef.current.shift()!;
    }
    forceUpdate();
  };

  const hideCurrent = (id?: string) => {
    if (currentRef.current && currentRef.current.id === id) {
      currentRef.current = null;
      if (queueRef.current.length > 0) {
        currentRef.current = queueRef.current.shift()!;
      }
    } else {
      queueRef.current = queueRef.current.filter((t) => t.id !== id);
    }
    forceUpdate();
  };

  const ctx = useMemo(() => ({ show }), []);

  return (
    <ToastContext.Provider value={ctx}>
      {children}

      {/* Overlay layer - this renders the toast */}
      <View pointerEvents="box-none" style={styles.overlay}>
        {currentRef.current ? (
          <ToastView toast={currentRef.current} onHide={hideCurrent} />
        ) : null}
      </View>
    </ToastContext.Provider>
  );
};

/** --- Styles --- */
const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: Platform.OS === "ios" ? 54 : 24,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 99999999,
    elevation: 9999,
    pointerEvents: "box-none",
  },
  toastContainer: {
    width: TOAST_WIDTH,
    height: TOAST_HEIGHT,
    borderRadius: TOAST_HEIGHT / 2,
    overflow: "hidden",
  },
  toastInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f1724",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  iconText: {
    tintColor: "#fff",
    width: 25,
    height: 25
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  message: {
    color: "#d1d5db",
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: "#fff",
    fontSize: 14,
  },
});
