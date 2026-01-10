import {
  useRef,
  createContext,
  useContext,
  useCallback,
  ReactNode,
} from "react";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useUI } from "@/context/UIContext";

// Type for sheet context
interface SheetContextType {
  ref: React.RefObject<BottomSheet | null>;
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

  function SheetProvider({ children }: { children: ReactNode }) {
    const ref = useRef<BottomSheet>(null);
    return (
      <SheetContext.Provider value={{ ref }}>{children}</SheetContext.Provider>
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
  SheetContext: OptionsSheetContext,
  useSheetContext: useOptionsSheet,
  SheetProvider: OptionsSheetProvider,
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
      console.log("Sheet index:", index);
      setIsSheetOpen(index > 0);
    },
    [setIsSheetOpen]
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      onAnimate={handleAnimate}
      enablePanDownToClose={enablePanDownToClose}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backgroundStyle={{
        backgroundColor,
        borderTopLeftRadius,
        borderTopRightRadius,
      }}
      handleComponent={() => null}
    >
      <BottomSheetView className="bg-background flex-1  h-full">
        {children}
      </BottomSheetView>
    </BottomSheet>
  );
}
