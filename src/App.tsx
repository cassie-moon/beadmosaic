import { useState, useCallback } from 'react';
import './index.css';
import { Header } from './components/Header';
import { UploadPanel } from './components/UploadPanel';
import { PreviewPanel } from './components/PreviewPanel';
import { ColorList } from './components/ColorList';
import { Community } from './components/Community';
import { TipsPanel } from './components/TipsPanel';
import { PERLER_COLORS } from './data/colors';
import type { PerlerColor } from './types';

interface ColorCount {
  color: PerlerColor;
  count: number;
}

interface PatternPixel {
  color: PerlerColor;
  x: number;
  y: number;
}

interface CommunityProps {
  onSelectPattern: (pattern: PatternPixel[][], counts: ColorCount[]) => void;
  onSwitchToUpload: () => void;
  currentPattern: PatternPixel[][] | null;
  currentColorCounts: ColorCount[];
}

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  const rDiff = r1 - r2;
  const gDiff = g1 - g2;
  const bDiff = b1 - b2;
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

function detectBackground(width: number, height: number, pixels: Uint8ClampedArray, method: 'corner' | 'edge' | 'brightest' = 'corner'): boolean[][] {
  let bgR = 255, bgG = 255, bgB = 255;
  const tolerance = 40;

  if (method === 'corner') {
    const cornerColors: { r: number; g: number; b: number }[] = [];
    const margin = 3;
    
    const corners = [
      { x: 0, y: 0 },
      { x: width - 1, y: 0 },
      { x: 0, y: height - 1 },
      { x: width - 1, y: height - 1 },
    ];

    for (const corner of corners) {
      for (let dx = 0; dx < margin; dx++) {
        for (let dy = 0; dy < margin; dy++) {
          const x = corner.x === 0 ? dx : width - 1 - dx;
          const y = corner.y === 0 ? dy : height - 1 - dy;
          const i = (y * width + x) * 4;
          cornerColors.push({
            r: pixels[i],
            g: pixels[i + 1],
            b: pixels[i + 2],
          });
        }
      }
    }

    bgR = cornerColors.reduce((sum, c) => sum + c.r, 0) / cornerColors.length;
    bgG = cornerColors.reduce((sum, c) => sum + c.g, 0) / cornerColors.length;
    bgB = cornerColors.reduce((sum, c) => sum + c.b, 0) / cornerColors.length;

  } else if (method === 'edge') {
    const edgeColors: { r: number; g: number; b: number }[] = [];
    const margin = 2;
    
    for (let x = 0; x < width; x++) {
      for (let dy = 0; dy < margin; dy++) {
        const i = (dy * width + x) * 4;
        edgeColors.push({ r: pixels[i], g: pixels[i + 1], b: pixels[i + 2] });
        const i2 = ((height - 1 - dy) * width + x) * 4;
        edgeColors.push({ r: pixels[i2], g: pixels[i2 + 1], b: pixels[i2 + 2] });
      }
    }

    for (let y = 0; y < height; y++) {
      for (let dx = 0; dx < margin; dx++) {
        const i = (y * width + dx) * 4;
        edgeColors.push({ r: pixels[i], g: pixels[i + 1], b: pixels[i + 2] });
        const i2 = (y * width + width - 1 - dx) * 4;
        edgeColors.push({ r: pixels[i2], g: pixels[i2 + 1], b: pixels[i2 + 2] });
      }
    }

    bgR = edgeColors.reduce((sum, c) => sum + c.r, 0) / edgeColors.length;
    bgG = edgeColors.reduce((sum, c) => sum + c.g, 0) / edgeColors.length;
    bgB = edgeColors.reduce((sum, c) => sum + c.b, 0) / edgeColors.length;

  } else if (method === 'brightest') {
    let maxBrightness = 0;
    let brightestColors: { r: number; g: number; b: number }[] = [];
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
        const brightness = (r + g + b) / 3;
        
        if (brightness > maxBrightness) {
          maxBrightness = brightness;
          brightestColors = [{ r, g, b }];
        } else if (brightness >= maxBrightness - 10) {
          brightestColors.push({ r, g, b });
        }
      }
    }

    bgR = brightestColors.reduce((sum, c) => sum + c.r, 0) / brightestColors.length;
    bgG = brightestColors.reduce((sum, c) => sum + c.g, 0) / brightestColors.length;
    bgB = brightestColors.reduce((sum, c) => sum + c.b, 0) / brightestColors.length;
  }

  const backgroundMask: boolean[][] = Array(height)
    .fill(null)
    .map(() => Array(width).fill(false));

  const visited: boolean[][] = Array(height)
    .fill(null)
    .map(() => Array(width).fill(false));

  const queue: { x: number; y: number }[] = [];

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (x < 1 || x >= width - 1 || y < 1 || y >= height - 1) {
        const i = (y * width + x) * 4;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        if (colorDistance(r, g, b, bgR, bgG, bgB) < tolerance) {
          queue.push({ x, y });
          visited[y][x] = true;
        }
      }
    }
  }

  const dirs = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
  ];

  while (queue.length > 0) {
    const { x, y } = queue.shift()!;
    backgroundMask[y][x] = true;

    for (const dir of dirs) {
      const nx = x + dir.dx;
      const ny = y + dir.dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height && !visited[ny][nx]) {
        const i = (ny * width + nx) * 4;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        if (colorDistance(r, g, b, bgR, bgG, bgB) < tolerance) {
          visited[ny][nx] = true;
          queue.push({ x: nx, y: ny });
        }
      }
    }
  }

  return backgroundMask;
}

function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'community'>('upload');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [exportSize, setExportSize] = useState(64);
  const [pattern, setPattern] = useState<PatternPixel[][] | null>(null);
  const [colorCounts, setColorCounts] = useState<ColorCount[]>([]);
  const [showColorId, setShowColorId] = useState(true);
  const [removeBackground, setRemoveBackground] = useState(true);
  const [backgroundMethod, setBackgroundMethod] = useState<'corner' | 'edge' | 'brightest'>('corner');
  const [isProcessing, setIsProcessing] = useState(false);

  const findClosestPerlerColor = useCallback((r: number, g: number, b: number): PerlerColor => {
    let closestColor = PERLER_COLORS[0];
    let minDistance = Infinity;

    for (const color of PERLER_COLORS) {
      const rDiff = r - color.rgb.r;
      const gDiff = g - color.rgb.g;
      const bDiff = b - color.rgb.b;
      const distance = rDiff * rDiff + gDiff * gDiff + bDiff * bDiff;

      if (distance < minDistance) {
        minDistance = distance;
        closestColor = color;
      }
    }

    return closestColor;
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setPattern(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const detectForeground = (pixels: Uint8ClampedArray, width: number, height: number): boolean[][] => {
    const isForeground: boolean[][] = [];
    
    for (let y = 0; y < height; y++) {
      isForeground[y] = [];
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        
        const isWhite = r >= 245 && g >= 245 && b >= 245;
        isForeground[y][x] = !isWhite;
      }
    }

    return isForeground;
  };

  const generatePattern = useCallback(() => {
    if (!selectedImage || isProcessing) return;

    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const targetSize = exportSize;
      const width = targetSize;
      const height = targetSize;

      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');

      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      tempCanvas.width = width;
      tempCanvas.height = height;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      const imgRatio = img.width / img.height;
      const canvasRatio = width / height;

      let drawWidth = width;
      let drawHeight = height;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > canvasRatio) {
        drawWidth = width;
        drawHeight = width / imgRatio;
        offsetY = (height - drawHeight) / 2;
      } else {
        drawWidth = height * imgRatio;
        drawHeight = height;
        offsetX = (width - drawWidth) / 2;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, img.width, img.height, offsetX, offsetY, drawWidth, drawHeight);

      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = imageData.data;

      let backgroundMask: boolean[][] | null = null;

      if (removeBackground) {
        backgroundMask = detectBackground(width, height, pixels, backgroundMethod);
      }

      const newPattern: PatternPixel[][] = [];
      const colorMap = new Map<string, number>();

      for (let y = 0; y < height; y++) {
        const row: PatternPixel[] = [];
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];

          const isBackground = backgroundMask && backgroundMask[y][x];
          
          let color: PerlerColor;
          
          if (isBackground) {
            color = { id: 'bg', name: '背景', hex: '#F5F5F5', rgb: { r: 245, g: 245, b: 245 } };
          } else {
            color = findClosestPerlerColor(r, g, b);
            const key = color.id;
            colorMap.set(key, (colorMap.get(key) || 0) + 1);
          }

          row.push({ color, x, y });
        }
        newPattern.push(row);
      }

      setPattern(newPattern);

      const counts: ColorCount[] = [];
      colorMap.forEach((count, id) => {
        const color = PERLER_COLORS.find((c) => c.id === id);
        if (color) {
          counts.push({ color, count });
        }
      });
      counts.sort((a, b) => b.count - a.count);
      setColorCounts(counts);

      setIsProcessing(false);
    };

    img.onerror = () => {
      setIsProcessing(false);
      alert('图片加载失败，请尝试其他图片');
    };

    img.src = selectedImage;
  }, [selectedImage, isProcessing, findClosestPerlerColor, removeBackground, backgroundMethod]);

  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null);
    setPattern(null);
    setColorCounts([]);
  }, []);

  const handlePatternSizeChange = useCallback((size: number) => {
    setExportSize(size);
    setPattern(null);
  }, []);

  const handleSelectPattern = useCallback((newPattern: PatternPixel[][], counts: ColorCount[], imageUrl?: string) => {
    setPattern(newPattern);
    setColorCounts(counts);
    if (imageUrl) {
      setSelectedImage(imageUrl);
    }
  }, []);

  const handleSwitchToUpload = useCallback(() => {
    setActiveTab('upload');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'upload' && (
          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <UploadPanel
                selectedImage={selectedImage}
                exportSize={exportSize}
                showColorId={showColorId}
                removeBackground={removeBackground}
                backgroundMethod={backgroundMethod}
                isProcessing={isProcessing}
                onFileSelect={handleFileSelect}
                onExportSizeChange={setExportSize}
                onShowColorIdChange={setShowColorId}
                onRemoveBackgroundChange={setRemoveBackground}
                onBackgroundMethodChange={setBackgroundMethod}
                onGenerate={generatePattern}
                onRemoveImage={handleRemoveImage}
              />
            </div>

            <div className="lg:col-span-5">
              <PreviewPanel
                pattern={pattern}
                showColorId={showColorId}
                selectedImage={selectedImage}
                colorCounts={colorCounts}
                exportSize={exportSize}
              />
            </div>

            <div className="lg:col-span-3 space-y-4">
              <ColorList colorCounts={colorCounts} />
              <TipsPanel />
            </div>
          </div>
        )}

        {activeTab === 'community' && (
          <Community
            onSelectPattern={handleSelectPattern}
            onSwitchToUpload={handleSwitchToUpload}
            currentPattern={pattern}
            currentColorCounts={colorCounts}
          />
        )}
      </main>

      <footer className="border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-sm">🧩</span>
              </div>
              <span className="text-white font-medium">BeadMosaic</span>
            </div>
            <p className="text-gray-500 text-sm text-center md:text-right">
              让拼豆创作更简单 ✨ | 支持多种图片格式转换
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;