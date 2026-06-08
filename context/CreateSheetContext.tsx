import {
  useRef,
  createContext,
  useContext,
  useCallback,
  ReactNode,
  useState,
} from "react";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useUI } from "@/context/UIContext";
import { Image, Pressable, View } from "react-native";
import { icons } from "@/constants/icons";

// Type for sheet context
interface SheetContextType<T = any> {
  ref: React.RefObject<BottomSheet | null>;
  data: T | null;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}
// Generic Sheet Context Factory
function createSheetContext() {
  const SheetContext = createContext<SheetContextType | null>(null);

  function useSheetContext(): SheetContextType {
    const context = useContext(SheetContext);
    if (!context) {
      throw new Error("useSheetContext must be used within SheetProvider");
    }
    return context;
  }

  function SheetProvider<T>({ children }: { children: ReactNode }) {
    const ref = useRef<BottomSheet>(null);
    const [data, setData] = useState<T | null>(null);

    return (
      <SheetContext.Provider value={{ ref, data, setData }}>
        {children}
      </SheetContext.Provider>
    );
  }

  return { SheetContext, useSheetContext, SheetProvider };
}

// Create separate contexts for different sheets
export const {
  SheetContext: CommentsSheetContext,
  useSheetContext: useCommentsSheet,
  SheetProvider: CommentsSheetProvider,
} = createSheetContext();

export const {
  SheetContext: LiveRecorderSheetContext,
  useSheetContext: useLiveRecorderSheet,
  SheetProvider: LiveRecorderSheetProvider,
} = createSheetContext();

export const {
  SheetContext: LiveListenerContext,
  useSheetContext: useLiveListenerSheet,
  SheetProvider: LiveListenerSheetProvider,
} = createSheetContext();


export const {
  SheetContext: CategorySheetContext,
  useSheetContext: useCategorySheet,
  SheetProvider: CategorySheetProvider,
} = createSheetContext();

export const {
  SheetContext: InviteSheetContext,
  useSheetContext: useInviteSheet,
  SheetProvider: InviteSheetProvider,
} = createSheetContext();

export const {
  SheetContext: StreamTimeSheetContext,
  useSheetContext: useStreamTimeSheet,
  SheetProvider: StreamTimeSheetProvider,
} = createSheetContext();

export const {
  SheetContext: LivePrivacySheetContext,
  useSheetContext: useLivePrivacySheet,
  SheetProvider: LivePrivacySheetProvider,
} = createSheetContext();

export const {
  SheetContext: OptionsSheetContext,
  useSheetContext: useOptionsSheet,
  SheetProvider: OptionsSheetProvider,
} = createSheetContext();

export const {
  SheetContext: SearchSheetContext,
  useSheetContext: useSearchSheet,
  SheetProvider: SearchSheetProvider,
} = createSheetContext();

export const {
  SheetContext: LogoutSheetContext,
  useSheetContext: useLogoutSheet,
  SheetProvider: LogoutSheetProvider,
} = createSheetContext();

export function Sheet({
  children,
  context,
  snapPoints = [1, 300],
  backgroundColor = "#1f222b",
  borderTopLeftRadius = 35,
  borderTopRightRadius = 35,
  onClose,
  enablePanDownToClose = true,
  showCloseButton = true
}: SheetProps) {
  const sheetContext = useContext(context);
  if (!sheetContext) {
    throw new Error("Sheet must be used within appropriate SheetProvider");
  }
  const { ref: bottomSheetRef } = sheetContext;
  const { setIsSheetOpen } = useUI();

  const handleAnimate = (fromIndex: number, toIndex: number) => {
    if (toIndex === 0) {
      onClose?.();
    }
  };

  const handleSheetChanges = useCallback(
    (index: number) => {
      setIsSheetOpen(index > 0);
    },
    [setIsSheetOpen],
  );

  return (
    <BottomSheet
      enablePanDownToClose={false}
      enableHandlePanningGesture={false}
      enableContentPanningGesture={false}
      enableDynamicSizing={false}
      animateOnMount={true}
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      onAnimate={handleAnimate}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backgroundStyle={{
        backgroundColor,
        borderTopLeftRadius,
        borderTopRightRadius,
      }}
      handleComponent={() => null}
    >
      <BottomSheetView className="flex-1  h-full bg-[#111827] border-t border-gray-700">
        {showCloseButton && <View style={{ position: "relative" }}>
          <Pressable
            onPress={() => bottomSheetRef.current?.close()}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 50,
            }}
            className="p-1 rounded-full"
          >
            <Image
              source={icons.close_modal}
              style={{ width: 20, height: 20 }}
            />
          </Pressable>
        </View>}
        {children}
      </BottomSheetView>
    </BottomSheet>
  );
}
