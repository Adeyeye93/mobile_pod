import React, { useState, useEffect } from "react";
import { Platform } from "react-native";
import { getColors } from "react-native-image-colors";

const initialState = {
  colorOne: { value: "", name: "" },
  colorTwo: { value: "", name: "" },
  colorThree: { value: "", name: "" },
  colorFour: { value: "", name: "" },
  rawResult: "",
  loading: true,
};

export const useImageColors = (imageUrl: string) => {
  const [colors, setColors] = useState(initialState);

  const fetchColors = async (url: string) => {
    // Check if URL is valid
    if (!url) {
      console.warn("No image URL provided");
      setColors((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      const result = await getColors(url, {
        fallback: "#000000",
        pixelSpacing: 5,
      });

      switch (result.platform) {
        case "android":
          setColors({
            colorOne: { value: result.average, name: "average" },
            colorTwo: { value: result.muted, name: "muted" },
            colorThree: { value: result.darkVibrant, name: "darkVibrant" },
            colorFour: { value: result.dominant, name: "dominant" },
            rawResult: JSON.stringify(result),
            loading: false,
          });
          break;
        case "web":
          setColors({
            colorOne: { value: result.lightVibrant, name: "lightVibrant" },
            colorTwo: { value: result.dominant, name: "dominant" },
            colorThree: { value: result.vibrant, name: "vibrant" },
            colorFour: { value: result.darkVibrant, name: "darkVibrant" },
            rawResult: JSON.stringify(result),
            loading: false,
          });
          break;
        case "ios":
          setColors({
            colorOne: { value: result.background, name: "background" },
            colorTwo: { value: result.detail, name: "detail" },
            colorThree: { value: result.primary, name: "primary" },
            colorFour: { value: result.secondary, name: "secondary" },
            rawResult: JSON.stringify(result),
            loading: false,
          });
          break;
        default:
          throw new Error("Unexpected platform");
      }
    } catch (error) {
      console.error("Error fetching colors:", error);
      setColors((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    if (imageUrl) {
      fetchColors(imageUrl);
    }
  }, [imageUrl]);

  return colors;
};
