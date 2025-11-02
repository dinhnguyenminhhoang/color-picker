"use client";

import { useState, useEffect, useRef } from "react";
import {
  SwatchIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  HeartIcon as HeartOutlineIcon,
  TrashIcon,
  SparklesIcon,
  PhotoIcon,
  XMarkIcon,
  EyeDropperIcon,
  ArrowDownTrayIcon,
  SunIcon,
  PaintBrushIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

interface ColorFormats {
  hex: string;
  rgb: string;
  hsl: string;
  hsv: string;
  cmyk: string;
  name: string;
}

interface SavedColor {
  id: string;
  hex: string;
  name: string;
  timestamp: number;
}

interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  timestamp: number;
}

const colorNames: { [key: string]: string } = {
  "#FF0000": "Red",
  "#00FF00": "Green",
  "#0000FF": "Blue",
  "#FFFF00": "Yellow",
  "#FF00FF": "Magenta",
  "#00FFFF": "Cyan",
  "#FFFFFF": "White",
  "#000000": "Black",
  "#808080": "Gray",
  "#FFA500": "Orange",
  "#800080": "Purple",
  "#FFC0CB": "Pink",
  "#A52A2A": "Brown",
  "#FFD700": "Gold",
  "#C0C0C0": "Silver",
};

const popularPalettes = [
  {
    name: "Sunset",
    colors: ["#FF6B6B", "#FFA06B", "#FFD06B", "#FFE66D", "#FFF06B"],
  },
  {
    name: "Ocean",
    colors: ["#1A535C", "#4ECDC4", "#95E1D3", "#A8DADC", "#F1FAEE"],
  },
  {
    name: "Forest",
    colors: ["#2D4A3E", "#5C8A70", "#8BB89F", "#B8D4C8", "#E5F2ED"],
  },
  {
    name: "Royal",
    colors: ["#4A148C", "#6A1B9A", "#8E24AA", "#AB47BC", "#CE93D8"],
  },
  {
    name: "Candy",
    colors: ["#FF99C8", "#FCF6BD", "#D0F4DE", "#A9DEF9", "#E4C1F9"],
  },
  {
    name: "Earth",
    colors: ["#8B4513", "#A0522D", "#CD853F", "#DEB887", "#F5DEB3"],
  },
  {
    name: "Neon",
    colors: ["#FF006E", "#FB5607", "#FFBE0B", "#8338EC", "#3A86FF"],
  },
  {
    name: "Pastel",
    colors: ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF"],
  },
];

export default function Home() {
  const [currentColor, setCurrentColor] = useState("#3B82F6");
  const [colorFormats, setColorFormats] = useState<ColorFormats>({
    hex: "#3B82F6",
    rgb: "rgb(59, 130, 246)",
    hsl: "hsl(217, 91%, 60%)",
    hsv: "hsv(217, 76%, 96%)",
    cmyk: "cmyk(76%, 47%, 0%, 4%)",
    name: "Blue",
  });
  const [savedColors, setSavedColors] = useState<SavedColor[]>([]);
  const [savedPalettes, setSavedPalettes] = useState<ColorPalette[]>([]);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copiedFormat, setCopiedFormat] = useState<string>("");
  const [activeView, setActiveView] = useState<
    "picker" | "palettes" | "harmony"
  >("picker");
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [contrastBg, setContrastBg] = useState("#FFFFFF");
  const [hasEyeDropper, setHasEyeDropper] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if EyeDropper is available (client-side only)
    if (typeof window !== "undefined") {
      setHasEyeDropper("EyeDropper" in window);
    }

    // Load saved data
    const saved = localStorage.getItem("savedColors");
    const palettes = localStorage.getItem("savedPalettes");
    const recent = localStorage.getItem("recentColors");
    const favs = localStorage.getItem("favoriteColors");
    if (saved) setSavedColors(JSON.parse(saved));
    if (palettes) setSavedPalettes(JSON.parse(palettes));
    if (recent) setRecentColors(JSON.parse(recent));
    if (favs) setFavorites(JSON.parse(favs));
  }, []);

  useEffect(() => {
    updateColorFormats(currentColor);
    addToRecentColors(currentColor);
  }, [currentColor]);

  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  const rgbToHsl = (
    r: number,
    g: number,
    b: number
  ): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const rgbToHsv = (
    r: number,
    g: number,
    b: number
  ): { h: number; s: number; v: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;

    if (max !== min) {
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100),
    };
  };

  const rgbToCmyk = (
    r: number,
    g: number,
    b: number
  ): { c: number; m: number; y: number; k: number } => {
    const rPercent = r / 255;
    const gPercent = g / 255;
    const bPercent = b / 255;

    const k = 1 - Math.max(rPercent, gPercent, bPercent);
    const c = k === 1 ? 0 : (1 - rPercent - k) / (1 - k);
    const m = k === 1 ? 0 : (1 - gPercent - k) / (1 - k);
    const y = k === 1 ? 0 : (1 - bPercent - k) / (1 - k);

    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100),
    };
  };

  const getColorName = (hex: string): string => {
    if (colorNames[hex.toUpperCase()]) {
      return colorNames[hex.toUpperCase()];
    }

    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    let name = "";

    if (hsl.l > 90) name += "Very Light ";
    else if (hsl.l > 70) name += "Light ";
    else if (hsl.l < 20) name += "Very Dark ";
    else if (hsl.l < 40) name += "Dark ";

    if (hsl.s < 10) return name + "Gray";
    if (hsl.s < 30) name += "Grayish ";

    if (hsl.h < 15 || hsl.h >= 345) name += "Red";
    else if (hsl.h < 45) name += "Orange";
    else if (hsl.h < 75) name += "Yellow";
    else if (hsl.h < 150) name += "Green";
    else if (hsl.h < 210) name += "Cyan";
    else if (hsl.h < 270) name += "Blue";
    else if (hsl.h < 330) name += "Purple";
    else name += "Pink";

    return name;
  };

  const updateColorFormats = (hex: string) => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

    setColorFormats({
      hex: hex.toUpperCase(),
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
      cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
      name: getColorName(hex),
    });
  };

  const addToRecentColors = (color: string) => {
    setRecentColors((prev) => {
      const filtered = prev.filter((c) => c !== color);
      const newRecent = [color, ...filtered].slice(0, 10);
      if (typeof window !== "undefined") {
        localStorage.setItem("recentColors", JSON.stringify(newRecent));
      }
      return newRecent;
    });
  };

  const copyToClipboard = (text: string, format: string) => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(""), 2000);
    }
  };

  const saveColor = () => {
    const newColor: SavedColor = {
      id: Date.now().toString(),
      hex: currentColor,
      name: colorFormats.name,
      timestamp: Date.now(),
    };
    const newSaved = [newColor, ...savedColors].slice(0, 50);
    setSavedColors(newSaved);
    if (typeof window !== "undefined") {
      localStorage.setItem("savedColors", JSON.stringify(newSaved));
    }
  };

  const savePalette = (colors: string[], name: string) => {
    const newPalette: ColorPalette = {
      id: Date.now().toString(),
      name,
      colors,
      timestamp: Date.now(),
    };
    const newPalettes = [newPalette, ...savedPalettes].slice(0, 20);
    setSavedPalettes(newPalettes);
    if (typeof window !== "undefined") {
      localStorage.setItem("savedPalettes", JSON.stringify(newPalettes));
    }
  };

  const deleteColor = (id: string) => {
    const newSaved = savedColors.filter((c) => c.id !== id);
    setSavedColors(newSaved);
    if (typeof window !== "undefined") {
      localStorage.setItem("savedColors", JSON.stringify(newSaved));
    }
  };

  const toggleFavorite = (hex: string) => {
    const newFavorites = favorites.includes(hex)
      ? favorites.filter((c) => c !== hex)
      : [...favorites, hex];
    setFavorites(newFavorites);
    if (typeof window !== "undefined") {
      localStorage.setItem("favoriteColors", JSON.stringify(newFavorites));
    }
  };

  const generateRandomColor = () => {
    const randomHex =
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0");
    setCurrentColor(randomHex.toUpperCase());
  };

  const useEyeDropper = async () => {
    if (typeof window === "undefined" || !("EyeDropper" in window)) {
      alert(
        "Trình duyệt không hỗ trợ EyeDropper.\nVui lòng dùng Chrome/Edge 95+"
      );
      return;
    }

    try {
      // @ts-ignore
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();

      console.log("🎨 EyeDropper full result:", result);

      // Lấy color value
      let colorValue = result.sRGBHex || result.color || result.value || "";
      console.log("🎨 Raw color value:", colorValue);

      // Nếu là RGBA/RGB format, convert sang HEX
      if (colorValue.includes("rgb")) {
        // Parse rgba(r, g, b, a) hoặc rgb(r, g, b)
        const matches = colorValue.match(/\d+/g);
        if (matches && matches.length >= 3) {
          const r = parseInt(matches[0]);
          const g = parseInt(matches[1]);
          const b = parseInt(matches[2]);

          // Convert to hex
          const toHex = (n: number) => {
            const hex = n.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
          };

          colorValue = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
          console.log("🎨 Converted to HEX:", colorValue);
        }
      } else if (!colorValue.startsWith("#")) {
        // Nếu không có # thì thêm vào
        colorValue = "#" + colorValue;
      }

      // Set màu
      if (colorValue && colorValue.length === 7) {
        console.log("✅ Setting color:", colorValue);
        setCurrentColor(colorValue.toUpperCase());
      } else {
        console.error("❌ Invalid color format:", colorValue);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("❌ EyeDropper error:", error);
      }
    }
  };
  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  };

  const generateShades = (hex: string, count: number = 5): string[] => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const shades: string[] = [];

    for (let i = 0; i < count; i++) {
      const lightness = 10 + (i / (count - 1)) * 80;
      shades.push(hslToHex(hsl.h, hsl.s, lightness));
    }

    return shades;
  };

  const generateTints = (hex: string, count: number = 5): string[] => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const tints: string[] = [];

    for (let i = 0; i < count; i++) {
      const saturation = hsl.s - (i / (count - 1)) * hsl.s;
      tints.push(hslToHex(hsl.h, saturation, hsl.l));
    }

    return tints;
  };

  const generateHarmony = (hex: string, type: string): string[] => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    switch (type) {
      case "complementary":
        return [hex, hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l)];
      case "analogous":
        return [
          hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l),
          hex,
          hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
        ];
      case "triadic":
        return [
          hex,
          hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
          hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
        ];
      case "split":
        return [
          hex,
          hslToHex((hsl.h + 150) % 360, hsl.s, hsl.l),
          hslToHex((hsl.h + 210) % 360, hsl.s, hsl.l),
        ];
      case "tetradic":
        return [
          hex,
          hslToHex((hsl.h + 90) % 360, hsl.s, hsl.l),
          hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
          hslToHex((hsl.h + 270) % 360, hsl.s, hsl.l),
        ];
      case "monochromatic":
        return generateShades(hex, 5);
      default:
        return [hex];
    }
  };

  const getContrastRatio = (color1: string, color2: string): number => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    const getLuminance = (r: number, g: number, b: number) => {
      const [rs, gs, bs] = [r, g, b].map((c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedImage(result);
      setShowImagePicker(true);

      // Draw image on canvas
      setTimeout(() => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;

          const maxSize = 500;
          let width = img.width;
          let height = img.height;

          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }

          canvas.width = width;
          canvas.height = height;
          canvas.style.width = "100%";
          canvas.style.height = "auto";

          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) return;

          ctx.drawImage(img, 0, 0, width, height);
        };
        img.src = result;
      }, 100);
    };
    reader.readAsDataURL(file);
  };

  const pickColorFromImage = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    try {
      const imageData = ctx.getImageData(x, y, 1, 1);
      const [r, g, b] = imageData.data;

      const hex = `#${r.toString(16).padStart(2, "0")}${g
        .toString(16)
        .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
      setCurrentColor(hex.toUpperCase());
    } catch (error) {
      console.error("Error picking color:", error);
    }
  };

  const getContrastColor = (hex: string): string => {
    const rgb = hexToRgb(hex);
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? "#000000" : "#FFFFFF";
  };

  const exportPalette = (colors: string[], name: string) => {
    const data = {
      name,
      colors,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.toLowerCase().replace(/\s+/g, "-")}-palette.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const contrastRatio = getContrastRatio(currentColor, contrastBg);
  const contrastAA = contrastRatio >= 4.5;
  const contrastAAA = contrastRatio >= 7;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <SwatchIcon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
              <div>
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800">
                  Color Picker Pro
                </h1>
                <p className="hidden sm:block text-xs sm:text-sm text-gray-600 mt-1">
                  Công cụ chọn và quản lý màu sắc chuyên nghiệp
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="hidden sm:flex items-center gap-2">
              {hasEyeDropper && (
                <button
                  onClick={useEyeDropper}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition text-sm font-semibold"
                  title="Chọn màu từ màn hình (Chrome/Edge)"
                >
                  <EyeDropperIcon className="w-5 h-5" />
                  <span className="hidden lg:inline">Eyedropper</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Main Area */}
            <div className="lg:col-span-8 space-y-4 sm:space-y-6">
              {/* Color Display Card */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <div
                  className="h-48 sm:h-64 flex items-center justify-center relative"
                  style={{ backgroundColor: currentColor }}
                >
                  <div className="text-center">
                    <p
                      className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2"
                      style={{ color: getContrastColor(currentColor) }}
                    >
                      {currentColor}
                    </p>
                    <p
                      className="text-lg sm:text-xl font-semibold mb-3"
                      style={{
                        color: getContrastColor(currentColor),
                        opacity: 0.9,
                      }}
                    >
                      {colorFormats.name}
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => toggleFavorite(currentColor)}
                        className="p-3 rounded-full hover:bg-white/20 transition"
                      >
                        {favorites.includes(currentColor) ? (
                          <HeartSolidIcon className="w-7 h-7 text-red-500" />
                        ) : (
                          <HeartOutlineIcon
                            className="w-7 h-7"
                            style={{ color: getContrastColor(currentColor) }}
                          />
                        )}
                      </button>
                      <button
                        onClick={saveColor}
                        className="px-4 py-2 rounded-lg font-semibold transition"
                        style={{
                          backgroundColor: getContrastColor(currentColor),
                          color: currentColor,
                        }}
                      >
                        Lưu màu
                      </button>
                    </div>
                  </div>
                </div>

                {/* Color Picker Tools */}
                <div className="p-4 sm:p-6 space-y-4">
                  {/* Main Picker Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4">
                    <div className="sm:col-span-3">
                      <input
                        type="color"
                        value={currentColor}
                        onChange={(e) =>
                          setCurrentColor(e.target.value.toUpperCase())
                        }
                        className="w-full h-20 sm:h-full rounded-xl cursor-pointer border-2 border-gray-300 shadow-md hover:shadow-lg transition"
                      />
                    </div>
                    <div className="sm:col-span-6 space-y-3">
                      <input
                        type="text"
                        value={currentColor}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase();
                          if (/^#[0-9A-F]{0,6}$/.test(value)) {
                            setCurrentColor(value);
                          }
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xl font-bold uppercase text-center"
                        placeholder="#000000"
                        maxLength={7}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={generateRandomColor}
                          className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition text-sm flex items-center justify-center gap-2"
                        >
                          <SparklesIcon className="w-4 h-4" />
                          Random
                        </button>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition text-sm flex items-center justify-center gap-2"
                        >
                          <PhotoIcon className="w-4 h-4" />
                          Từ ảnh
                        </button>
                      </div>
                    </div>
                    <div className="sm:col-span-3">
                      {hasEyeDropper && (
                        <button
                          onClick={useEyeDropper}
                          className="w-full h-full px-4 py-3 bg-gradient-to-br from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-xl font-semibold transition flex flex-col items-center justify-center gap-2"
                        >
                          <EyeDropperIcon className="w-6 h-6" />
                          <span className="text-sm">Eyedropper</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Recent Colors */}
                  {recentColors.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Màu gần đây
                      </p>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {recentColors.map((color, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentColor(color)}
                            className="w-10 h-10 rounded-lg flex-shrink-0 border-2 border-white shadow-md hover:scale-110 transition"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Image Color Picker */}
              {showImagePicker && (
                <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-200 animate-fade-in">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800 text-base sm:text-lg flex items-center gap-2">
                      <PhotoIcon className="w-6 h-6 text-blue-600" />
                      Pick màu từ ảnh
                    </h3>
                    <button
                      onClick={() => {
                        setShowImagePicker(false);
                        setUploadedImage("");
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      onClick={pickColorFromImage}
                      className="w-full max-h-96 border-2 border-gray-300 rounded-xl cursor-crosshair shadow-inner bg-gray-50"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-3 text-center flex items-center justify-center gap-2">
                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                    Click vào ảnh để chọn màu
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Tabs */}
              <div className="bg-white rounded-xl shadow-lg p-2 border border-gray-200">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setActiveView("picker")}
                    className={`px-4 py-2.5 rounded-lg font-semibold transition text-sm ${
                      activeView === "picker"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <PaintBrushIcon className="w-5 h-5 mx-auto mb-1" />
                    Formats
                  </button>
                  <button
                    onClick={() => setActiveView("palettes")}
                    className={`px-4 py-2.5 rounded-lg font-semibold transition text-sm ${
                      activeView === "palettes"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <SwatchIcon className="w-5 h-5 mx-auto mb-1" />
                    Palettes
                  </button>
                  <button
                    onClick={() => setActiveView("harmony")}
                    className={`px-4 py-2.5 rounded-lg font-semibold transition text-sm ${
                      activeView === "harmony"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <AdjustmentsHorizontalIcon className="w-5 h-5 mx-auto mb-1" />
                    Harmony
                  </button>
                </div>
              </div>

              {/* Color Formats Tab */}
              {activeView === "picker" && (
                <div className="space-y-4">
                  {/* Formats */}
                  <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-4 text-base sm:text-lg">
                      Định dạng màu
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(colorFormats).map(([format, value]) => (
                        <div
                          key={format}
                          className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-purple-50 hover:to-pink-50 transition group"
                        >
                          <div className="flex-grow">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                              {format}
                            </p>
                            <p className="text-sm sm:text-base font-mono font-bold text-gray-800">
                              {value}
                            </p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(value, format)}
                            className="ml-3 p-2.5 bg-white hover:bg-purple-600 hover:text-white rounded-lg transition shadow-sm group-hover:shadow-md"
                          >
                            {copiedFormat === format ? (
                              <CheckCircleIcon className="w-5 h-5 text-green-600" />
                            ) : (
                              <ClipboardDocumentIcon className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Accessibility Checker */}
                  <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-4 text-base sm:text-lg">
                      Kiểm tra độ tương phản (WCAG)
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-semibold text-gray-700 flex-shrink-0">
                          Màu nền:
                        </label>
                        <input
                          type="color"
                          value={contrastBg}
                          onChange={(e) =>
                            setContrastBg(e.target.value.toUpperCase())
                          }
                          className="w-16 h-10 rounded-lg cursor-pointer border-2 border-gray-300"
                        />
                        <input
                          type="text"
                          value={contrastBg}
                          onChange={(e) =>
                            setContrastBg(e.target.value.toUpperCase())
                          }
                          className="flex-grow px-3 py-2 border-2 border-gray-300 rounded-lg font-mono text-sm uppercase"
                          maxLength={7}
                        />
                      </div>

                      <div
                        className="p-6 rounded-xl"
                        style={{
                          backgroundColor: contrastBg,
                          color: currentColor,
                        }}
                      >
                        <p className="text-2xl font-bold mb-2">Sample Text</p>
                        <p className="text-sm">
                          The quick brown fox jumps over the lazy dog
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-4 bg-gray-50 rounded-xl text-center">
                          <p className="text-xs text-gray-600 mb-1">
                            Tỷ lệ tương phản
                          </p>
                          <p className="text-2xl font-bold text-purple-600">
                            {contrastRatio.toFixed(2)}:1
                          </p>
                        </div>
                        <div
                          className={`p-4 rounded-xl text-center ${
                            contrastAA ? "bg-green-50" : "bg-red-50"
                          }`}
                        >
                          <p className="text-xs text-gray-600 mb-1">WCAG AA</p>
                          <p
                            className={`text-xl font-bold ${
                              contrastAA ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {contrastAA ? "✓ Pass" : "✗ Fail"}
                          </p>
                        </div>
                        <div
                          className={`p-4 rounded-xl text-center ${
                            contrastAAA ? "bg-green-50" : "bg-red-50"
                          }`}
                        >
                          <p className="text-xs text-gray-600 mb-1">WCAG AAA</p>
                          <p
                            className={`text-xl font-bold ${
                              contrastAAA ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {contrastAAA ? "✓ Pass" : "✗ Fail"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shades & Tints */}
                  <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-4 text-base sm:text-lg flex items-center gap-2">
                      <SunIcon className="w-6 h-6" />
                      Shades & Tints
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          Shades (Tối hơn)
                        </p>
                        <div className="grid grid-cols-5 gap-2">
                          {generateShades(currentColor).map((color, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentColor(color)}
                              className="aspect-square rounded-lg hover:scale-105 transition border-2 border-white shadow-md relative group"
                              style={{ backgroundColor: color }}
                            >
                              <span
                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs font-bold"
                                style={{
                                  color: getContrastColor(color),
                                  fontSize: "0.6rem",
                                }}
                              >
                                {color}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          Tints (Nhạt hơn)
                        </p>
                        <div className="grid grid-cols-5 gap-2">
                          {generateTints(currentColor).map((color, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentColor(color)}
                              className="aspect-square rounded-lg hover:scale-105 transition border-2 border-white shadow-md relative group"
                              style={{ backgroundColor: color }}
                            >
                              <span
                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs font-bold"
                                style={{
                                  color: getContrastColor(color),
                                  fontSize: "0.6rem",
                                }}
                              >
                                {color}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Palettes Tab */}
              {activeView === "palettes" && (
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4 text-base sm:text-lg">
                    Bảng màu phổ biến
                  </h3>
                  <div className="space-y-4">
                    {popularPalettes.map((palette) => (
                      <div
                        key={palette.name}
                        className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition group"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-bold text-gray-700">
                            {palette.name}
                          </h4>
                          <button
                            onClick={() =>
                              exportPalette(palette.colors, palette.name)
                            }
                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white rounded-lg transition"
                            title="Export palette"
                          >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {palette.colors.map((color) => (
                            <button
                              key={color}
                              onClick={() => setCurrentColor(color)}
                              className="aspect-square rounded-lg hover:scale-110 transition border-2 border-white shadow-md relative group/color"
                              style={{ backgroundColor: color }}
                            >
                              <span
                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/color:opacity-100 transition text-xs font-bold px-1"
                                style={{
                                  color: getContrastColor(color),
                                  fontSize: "0.6rem",
                                }}
                              >
                                {color}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Harmony Tab */}
              {activeView === "harmony" && (
                <div className="space-y-4">
                  {[
                    { name: "Complementary", type: "complementary" },
                    { name: "Analogous", type: "analogous" },
                    { name: "Triadic", type: "triadic" },
                    { name: "Split Complementary", type: "split" },
                    { name: "Tetradic", type: "tetradic" },
                    { name: "Monochromatic", type: "monochromatic" },
                  ].map((scheme) => {
                    const colors = generateHarmony(currentColor, scheme.type);
                    return (
                      <div
                        key={scheme.type}
                        className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 group hover:shadow-xl transition"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-gray-800 text-base sm:text-lg">
                            {scheme.name}
                          </h4>
                          <button
                            onClick={() => savePalette(colors, scheme.name)}
                            className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition"
                          >
                            Lưu palette
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                          {colors.map((color, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentColor(color)}
                              className="aspect-square rounded-xl hover:scale-105 transition border-2 border-white shadow-lg relative group/color"
                              style={{ backgroundColor: color }}
                            >
                              <span
                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/color:opacity-100 transition text-xs font-bold px-2"
                                style={{ color: getContrastColor(color) }}
                              >
                                {color}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              {/* Saved Colors */}
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 lg:sticky lg:top-24">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800 text-base sm:text-lg">
                    Màu đã lưu
                  </h3>
                  {savedColors.length > 0 && (
                    <button
                      onClick={() => {
                        setSavedColors([]);
                        if (typeof window !== "undefined") {
                          localStorage.removeItem("savedColors");
                        }
                      }}
                      className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-semibold"
                    >
                      Xóa tất cả
                    </button>
                  )}
                </div>

                <div className="space-y-3 max-h-80 lg:max-h-96 overflow-y-auto">
                  {savedColors.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <SwatchIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm">Chưa có màu nào</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Click "Lưu màu" để thêm
                      </p>
                    </div>
                  ) : (
                    savedColors.map((color) => (
                      <div
                        key={color.id}
                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-purple-50 hover:to-pink-50 transition group"
                      >
                        <button
                          onClick={() => setCurrentColor(color.hex)}
                          className="w-14 h-14 rounded-xl border-2 border-white shadow-md flex-shrink-0 hover:scale-110 transition"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="flex-grow min-w-0">
                          <p className="font-bold text-gray-800 text-sm truncate">
                            {color.name}
                          </p>
                          <p className="text-xs font-mono text-gray-600 font-semibold">
                            {color.hex}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => toggleFavorite(color.hex)}
                            className="p-2 hover:bg-white rounded-lg transition"
                          >
                            {favorites.includes(color.hex) ? (
                              <HeartSolidIcon className="w-4 h-4 text-red-500" />
                            ) : (
                              <HeartOutlineIcon className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => deleteColor(color.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition"
                          >
                            <TrashIcon className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Favorites */}
              {favorites.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-3 text-sm sm:text-base flex items-center gap-2">
                    <HeartSolidIcon className="w-5 h-5 text-red-500" />
                    Yêu thích
                  </h4>
                  <div className="grid grid-cols-5 gap-2">
                    {favorites.slice(0, 15).map((color, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentColor(color)}
                        className="aspect-square rounded-lg hover:scale-110 transition border-2 border-white shadow-md"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Saved Palettes */}
              {savedPalettes.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-800 text-sm sm:text-base">
                      Palettes đã lưu
                    </h4>
                    <button
                      onClick={() => {
                        setSavedPalettes([]);
                        if (typeof window !== "undefined") {
                          localStorage.removeItem("savedPalettes");
                        }
                      }}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold"
                    >
                      Xóa
                    </button>
                  </div>
                  <div className="space-y-3">
                    {savedPalettes.slice(0, 5).map((palette) => (
                      <div
                        key={palette.id}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <p className="text-xs font-semibold text-gray-700 mb-2">
                          {palette.name}
                        </p>
                        <div className="grid grid-cols-5 gap-1">
                          {palette.colors.map((color, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentColor(color)}
                              className="aspect-square rounded hover:scale-110 transition"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 text-center text-gray-600 text-xs sm:text-sm">
          <p>Color Picker Pro - Công cụ chọn màu chuyên nghiệp 🎨</p>
        </div>
      </footer>
    </div>
  );
}
