import React, { createContext, useContext, useState } from "react";

// ============= CONTENT CONTEXT FACTORY =============
/**
 * This creates a separate context for managing the CONTENT inside a modal
 * Independent from the modal's open/close state
 */

export interface ModalContentState<T = any> {
  data: T | null;
  content: React.ReactNode;
  loading: boolean;
  error: string | null;
  tittle: string | null;
}

export interface ModalContentContextType<T = any> extends ModalContentState<T> {
  setData: (data: T) => void;
  setContent: (content: React.ReactNode) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
  setTittle: (tittle: string) => void;
}

export function createModalContentContext<T = any>() {
  const ContentContext = createContext<ModalContentContextType<T> | undefined>(
    undefined,
  );

  function ContentProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<T | null>(null);
    const [content, setContent] = useState<React.ReactNode>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tittle, setTittle] = useState<string | null>(null);

    const value: ModalContentContextType<T> = {
      data,
      content,
      loading,
      error,
      tittle,
      setTittle,
      setData,
      setContent,
      setLoading,
      setError,
      clear: () => {
        setData(null);
        setContent(null);
        setLoading(false);
        setError(null);
      },
    };

    return (
      <ContentContext.Provider value={value}>
        {children}
      </ContentContext.Provider>
    );
  }

  function useModalContent(): ModalContentContextType<T> {
    const context = useContext(ContentContext);
    if (!context) {
      throw new Error(
        "useModalContent must be used within its corresponding ContentProvider",
      );
    }
    return context;
  }

  return {
    ContentContext,
    ContentProvider,
    useModalContent,
  };
}
