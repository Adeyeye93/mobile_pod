import React, { createContext, useContext, useState } from "react";
import {
  Modal,
  View,
  Pressable,
  Text,
  Image,
  ImageSourcePropType,
} from "react-native";
import { icons } from "@/constants/icons";
import Divider from "../divider";

// ============= CUSTOM MODAL COMPONENT =============

export function CustomModal({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  animationType = "slide",
  backgroundColor = "#181a20",
  MenuIcons,
}: CustomModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType={animationType}
      onRequestClose={onClose}
    >
      {/* Dark overlay background */}
      <View className="flex-1 bg-background flex-row items-center justify-center">
        {/* Modal content container */}
        <Pressable
          className="w-full h-full pt-16 px-4"
          style={{
            backgroundColor,
            maxHeight: "100%",
          }}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="w-full flex-row items-center justify-between px-4 py-4 ">
            {(title || showCloseButton) && (
              <View className=" gap-5 w-2/3 flex-row items-center justify-between">
                {showCloseButton && (
                  <Pressable onPress={onClose}>
                    <Image className="w-6 h-6" source={icons.backPage} />
                  </Pressable>
                )}
                <Text
                  numberOfLines={1}
                  className="text-textSecondary font-MonBold text-2xl flex-1"
                >
                  {title || ""}
                </Text>
              </View>
            )}
            {MenuIcons?.map((menu, index) => (
              <Pressable key={menu}>
                <Image className="w-6 h-6" source={menu} />
              </Pressable>
            ))}
          </View>

          {showCloseButton && <Divider gap={1} value={380} />}

          {/* Modal content */}
          <View className="flex-1">{children}</View>
        </Pressable>
      </View>
    </Modal>
  );
}

// ============= Modal CONTEXT FACTORY =============

export function createModalContext(): CreateModalContextReturn {
  const ModalContext = createContext<ModalContextType | undefined>(undefined);

  function ModalProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const value: ModalContextType = {
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((prev) => !prev),
    };

    return (
      <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
    );
  }

  function useModalContext(): ModalContextType {
    const context = useContext(ModalContext);
    if (!context) {
      throw new Error(
        "useModalContext must be used within its corresponding ModalProvider",
      );
    }
    return context;
  }

  function ModalComponent({
    title,
    children,
    MenuIcons,
    animationType = "slide",
    backgroundColor = "#181a20",
    showCloseButton,
  }: {
    title: string | null;
    children: React.ReactNode;
    animationType?: "none" | "slide" | "fade";
    backgroundColor?: string;
    MenuIcons?: ImageSourcePropType[];
    showCloseButton?: boolean;
  }) {
    const { isOpen, close } = useModalContext();

    return (
      <CustomModal
        visible={isOpen}
        onClose={close}
        title={title}
        animationType={animationType}
        backgroundColor={backgroundColor}
        MenuIcons={MenuIcons}
        showCloseButton={showCloseButton}
      >
        {children}
      </CustomModal>
    );
  }

  return {
    ModalContext,
    useModalContext,
    ModalProvider,
    ModalComponent,
  };
}
