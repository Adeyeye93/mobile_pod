import { createModalContentContext } from "@/context/ModalContext";
import { createModalContext } from "../components/modals/Modal";

// ============= PLAYLIST MODAL =============
export const {
  ModalContext: PlayListModalContext,
  useModalContext: usePlayListModal,
  ModalProvider: PlayListModalProvider,
  ModalComponent: PlayListModal,
} = createModalContext();

// Playlist content (typed for playlist data)
export const {
  ContentProvider: PlayListContentProvider,
  useModalContent: usePlayListContent,
} = createModalContentContext();
