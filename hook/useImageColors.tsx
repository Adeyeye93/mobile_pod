import { useState, useEffect } from "react";
import { getColors } from "react-native-image-colors";

declare global {
  interface Window {
    storage?: {
      get: (key: string) => Promise<{ value: string } | null>;
      set: (key: string, value: string) => Promise<{ value: string } | null>;
      delete: (key: string) => Promise<{ deleted: boolean } | null>;
      list: (prefix?: string) => Promise<{ keys: string[] } | null>;
    };
  }
}

const initialState = {
  colorOne: { value: "", name: "" },
  colorTwo: { value: "", name: "" },
  colorThree: { value: "", name: "" },
  colorFour: { value: "", name: "" },
  rawResult: "",
  loading: true,
};

export const useImageColors = (imageUrl: string, podcastId?: string) => {
  const [colors, setColors] = useState(initialState);

  const fetchColors = async (url: string, id?: string) => {
    // Check if URL is valid
    if (!url) {
      console.warn("No image URL provided");
      setColors((prev) => ({ ...prev, loading: false }));
      return;
    }

    // Try to load from cache first
    if (id && typeof window !== "undefined" && window.storage) {
      try {
        const cacheKey = `image-colors:${id}`;
        const cached = await window.storage.get(cacheKey);

        if (cached) {
          const cachedColors = JSON.parse(cached.value);
          setColors({ ...cachedColors, loading: false });
          return;
        }
      } catch (error) {
        console.warn("Error loading from cache:", error);
      }
    }

    // If not in cache, fetch colors
    try {
      const result = await getColors(url, {
        fallback: "#000000",
        pixelSpacing: 5,
      });

      let colorData: typeof initialState;

      switch (result.platform) {
        case "android":
          colorData = {
            colorOne: { value: result.average, name: "average" },
            colorTwo: { value: result.muted, name: "muted" },
            colorThree: { value: result.darkVibrant, name: "darkVibrant" },
            colorFour: { value: result.dominant, name: "dominant" },
            rawResult: JSON.stringify(result),
            loading: false,
          };
          break;
        case "web":
          colorData = {
            colorOne: { value: result.lightVibrant, name: "lightVibrant" },
            colorTwo: { value: result.dominant, name: "dominant" },
            colorThree: { value: result.vibrant, name: "vibrant" },
            colorFour: { value: result.darkVibrant, name: "darkVibrant" },
            rawResult: JSON.stringify(result),
            loading: false,
          };
          break;
        case "ios":
          colorData = {
            colorOne: { value: result.background, name: "background" },
            colorTwo: { value: result.detail, name: "detail" },
            colorThree: { value: result.primary, name: "primary" },
            colorFour: { value: result.secondary, name: "secondary" },
            rawResult: JSON.stringify(result),
            loading: false,
          };
          break;
        default:
          throw new Error("Unexpected platform");
      }

      setColors(colorData);

      // Save to cache if we have a podcast ID
      if (id && typeof window !== "undefined" && window.storage) {
        try {
          const cacheKey = `image-colors:${id}`;
          // Store without rawResult to save space
          const cacheData = {
            colorOne: colorData.colorOne,
            colorTwo: colorData.colorTwo,
            colorThree: colorData.colorThree,
            colorFour: colorData.colorFour,
            loading: false,
          };
          await window.storage.set(cacheKey, JSON.stringify(cacheData));
        } catch (error) {
          console.warn("Error saving to cache:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching colors:", error);
      setColors((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    if (imageUrl) {
      fetchColors(imageUrl, podcastId);
    }
  }, [imageUrl, podcastId]);

  return colors;
};

// Hook to clear color cache (if needed)
export const useClearColorCache = () => {
  const clearCache = async (podcastId: string) => {
    if (typeof window !== "undefined" && window.storage) {
      try {
        const cacheKey = `image-colors:${podcastId}`;
        await window.storage.delete(cacheKey);
      } catch (error) {
        console.warn("Error clearing cache:", error);
      }
    }
  };

  return { clearCache };
};
