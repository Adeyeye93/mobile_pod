import React from "react";
import { getColors, ImageColorsResult } from "react-native-image-colors";

const useImageColors = ({ imageUrl }: { imageUrl: string }) => {
  const [colors, setColors] = React.useState<ImageColorsResult | null>(null);

  React.useEffect(() => {
    const url = imageUrl;
    getColors(url, {
      fallback: "#fff",
      cache: true,
      key: url,
    }).then((result) => setColors(result));
  }, []);

  return colors;
};
export default useImageColors;