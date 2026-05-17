import { useRef, useEffect, useCallback, useState } from 'react';
import { Download, Eye, EyeOff, ZoomIn, X } from 'lucide-react';
import type { PerlerColor } from '../types';

interface ColorCount {
  color: PerlerColor;
  count: number;
}

interface PatternPixel {
  color: PerlerColor;
  x: number;
  y: number;
}

interface PreviewPanelProps {
  pattern: PatternPixel[][] | null;
  showColorId: boolean;
  selectedImage: string | null;
  colorCounts: ColorCount[];
  exportSize: number;
}

export const PreviewPanel = ({ pattern, showColorId, selectedImage, colorCounts, exportSize }: PreviewPanelProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);
  const [initialPinchDistance, setInitialPinchDistance] = useState(0);
  const [initialPinchScale, setInitialPinchScale] = useState(1);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const exportCanvasRef = useRef<HTMLCanvasElement>(null);
  const zoomCanvasRef = useRef<HTMLCanvasElement>(null);
  const zoomContainerRef = useRef<HTMLDivElement>(null);

  const renderPatternToCanvas = useCallback((canvas: HTMLCanvasElement, patternData: PatternPixel[][], showId: boolean, counts: ColorCount[], cellSize: number = 20) => {
    const padding = 20;
    const patternHeight = patternData.length;
    const patternWidth = patternData[0]?.length || patternHeight;
    const borderWidth = 8;
    const numberWidth = 30;

    const colorsPerRow = 6;
    const colorBoxHeight = 36;
    const colorRows = Math.ceil(counts.length / colorsPerRow);
    const colorSectionHeight = colorRows * colorBoxHeight + 20;

    const maxSize = Math.max(patternWidth, patternHeight);
    canvas.width = maxSize * cellSize + padding * 2 + borderWidth * 2 + numberWidth;
    canvas.height = maxSize * cellSize + padding * 2 + borderWidth * 2 + colorSectionHeight + numberWidth;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = '#F5F5F5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#E8E4E1';
    ctx.fillRect(numberWidth, numberWidth, canvas.width - numberWidth, maxSize * cellSize + padding * 2 + borderWidth * 2);

    ctx.fillStyle = '#D4CFC9';
    ctx.fillRect(numberWidth, numberWidth, canvas.width - numberWidth, borderWidth);
    ctx.fillRect(numberWidth, numberWidth + maxSize * cellSize + padding * 2 + borderWidth - borderWidth, canvas.width - numberWidth, borderWidth);
    ctx.fillRect(numberWidth, numberWidth, borderWidth, maxSize * cellSize + padding * 2 + borderWidth);
    ctx.fillRect(numberWidth + canvas.width - numberWidth - borderWidth, numberWidth, borderWidth, maxSize * cellSize + padding * 2 + borderWidth);

    ctx.fillStyle = '#C4BEB7';
    ctx.fillRect(numberWidth + borderWidth, numberWidth + borderWidth, canvas.width - numberWidth - borderWidth * 2, 4);
    ctx.fillRect(numberWidth + borderWidth, numberWidth + maxSize * cellSize + padding * 2 + borderWidth - borderWidth - 4, canvas.width - numberWidth - borderWidth * 2, 4);
    ctx.fillRect(numberWidth + borderWidth, numberWidth + borderWidth, 4, maxSize * cellSize + padding * 2 + borderWidth - borderWidth * 2);
    ctx.fillRect(numberWidth + canvas.width - numberWidth - borderWidth - 4, numberWidth + borderWidth, 4, maxSize * cellSize + padding * 2 + borderWidth - borderWidth * 2);

    ctx.fillStyle = '#F5F2EF';
    ctx.fillRect(
      numberWidth + borderWidth + 4,
      numberWidth + borderWidth + 4,
      canvas.width - numberWidth - (borderWidth + 4) * 2,
      maxSize * cellSize + padding * 2 + borderWidth - (borderWidth + 4) * 2
    );

    ctx.strokeStyle = '#E0DBD5';
    ctx.lineWidth = 0.5;
    const innerPadding = numberWidth + borderWidth + 4;
    const innerWidth = canvas.width - numberWidth - innerPadding;
    const innerHeight = maxSize * cellSize + padding * 2 + borderWidth - (numberWidth + borderWidth + 4);

    for (let i = 0; i <= 5; i++) {
      const y = innerPadding + (innerHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(innerPadding, y);
      ctx.lineTo(canvas.width - numberWidth, y);
      ctx.stroke();
    }
    for (let i = 0; i <= 5; i++) {
      const x = innerPadding + (innerWidth / 5) * i;
      ctx.beginPath();
      ctx.moveTo(x, innerPadding);
      ctx.lineTo(x, innerPadding + innerHeight);
      ctx.stroke();
    }

    ctx.fillStyle = '#E8E4E1';
    ctx.beginPath();
    ctx.arc(canvas.width - borderWidth - 8, numberWidth + borderWidth + 8, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#C4BEB7';
    ctx.beginPath();
    ctx.arc(canvas.width - borderWidth - 8, numberWidth + borderWidth + 8, 2, 0, Math.PI * 2);
    ctx.fill();

    const patternStartX = innerPadding;
    const patternStartY = innerPadding;

    ctx.strokeStyle = '#D4CFC9';
    ctx.lineWidth = 1;
    for (let y = 0; y <= patternHeight; y++) {
      ctx.beginPath();
      ctx.moveTo(patternStartX, patternStartY + y * cellSize);
      ctx.lineTo(patternStartX + patternWidth * cellSize, patternStartY + y * cellSize);
      ctx.stroke();
    }
    for (let x = 0; x <= patternWidth; x++) {
      ctx.beginPath();
      ctx.moveTo(patternStartX + x * cellSize, patternStartY);
      ctx.lineTo(patternStartX + x * cellSize, patternStartY + patternHeight * cellSize);
      ctx.stroke();
    }

    for (let y = 0; y < patternHeight; y++) {
      for (let x = 0; x < patternWidth; x++) {
        const pixel = patternData[y][x];
        const px = patternStartX + x * cellSize;
        const py = patternStartY + y * cellSize;

        ctx.fillStyle = pixel.color.hex;
        
        if (pixel.color.id === 'bg') {
          ctx.fillStyle = '#F5F2EF';
        }
        
        ctx.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);

        if (pixel.color.hex === '#FFFFFF' && pixel.color.id !== 'bg') {
          ctx.strokeStyle = '#D4CFC9';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
        }

        if (showId && pixel.color.id !== 'bg') {
          const brightness = (pixel.color.rgb.r * 299 + pixel.color.rgb.g * 587 + pixel.color.rgb.b * 114) / 1000;
          ctx.fillStyle = brightness > 200 ? '#666666' : '#ffffff';
          ctx.font = cellSize >= 20 ? 'bold 7px Arial' : 'bold 5px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(pixel.color.id, px + cellSize / 2, py + cellSize / 2);
        }
      }
    }

    ctx.fillStyle = '#666666';
    ctx.font = 'bold 8px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    for (let y = 0; y < patternHeight; y++) {
      const py = patternStartY + y * cellSize + cellSize / 2;
      const num = y + 1;
      ctx.fillText(String(num), numberWidth - 3, py);
    }
    
    ctx.textAlign = 'center';
    for (let x = 0; x < patternWidth; x++) {
      const px = patternStartX + x * cellSize + cellSize / 2;
      const num = x + 1;
      ctx.fillText(String(num), px, numberWidth - 3);
    }

    const colorSectionY = numberWidth + maxSize * cellSize + padding * 2 + borderWidth;
    
    ctx.fillStyle = '#E8E4E1';
    ctx.fillRect(numberWidth, colorSectionY, canvas.width - numberWidth, colorSectionHeight);

    ctx.fillStyle = '#333333';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('使用的颜色', numberWidth + 20, colorSectionY + 20);

    const colorBoxWidth = (canvas.width - numberWidth - 40) / colorsPerRow;
    
    counts.forEach((item, index) => {
      const row = Math.floor(index / colorsPerRow);
      const col = index % colorsPerRow;
      
      const boxX = numberWidth + 20 + col * colorBoxWidth;
      const boxY = colorSectionY + 30 + row * colorBoxHeight;
      
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(boxX, boxY, colorBoxWidth - 8, colorBoxHeight - 8);
      
      ctx.strokeStyle = '#D4CFC9';
      ctx.lineWidth = 1;
      ctx.strokeRect(boxX, boxY, colorBoxWidth - 8, colorBoxHeight - 8);
      
      const colorBoxSize = 28;
      const colorBoxX = boxX + 4;
      const colorBoxY = boxY + 4;
      
      ctx.fillStyle = item.color.hex;
      ctx.fillRect(colorBoxX, colorBoxY, colorBoxSize, colorBoxSize);
      
      if (item.color.hex === '#FFFFFF') {
        ctx.strokeStyle = '#D4CFC9';
        ctx.lineWidth = 1;
        ctx.strokeRect(colorBoxX, colorBoxY, colorBoxSize, colorBoxSize);
      }
      
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(item.color.id, colorBoxX + colorBoxSize + 8, colorBoxY + 12);
      
      ctx.font = '11px Arial';
      ctx.fillStyle = '#666666';
      ctx.fillText(`${item.count} 颗`, colorBoxX + colorBoxSize + 8, colorBoxY + 26);
    });
  }, []);

  useEffect(() => {
    if (pattern && canvasRef.current) {
      const displayCounts = colorCounts.filter(c => c.color.id !== 'bg');
      renderPatternToCanvas(canvasRef.current, pattern, showColorId, displayCounts);
    }
  }, [pattern, showColorId, colorCounts, renderPatternToCanvas]);

  useEffect(() => {
    if (pattern && zoomCanvasRef.current) {
      const displayCounts = colorCounts.filter(c => c.color.id !== 'bg');
      renderPatternToCanvas(zoomCanvasRef.current, pattern, showColorId, displayCounts, 32);
    }
  }, [showZoomModal, pattern, showColorId, colorCounts, renderPatternToCanvas]);

  useEffect(() => {
    if (showZoomModal) {
      setZoomScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [showZoomModal]);

  const clampPosition = useCallback((newPosition: { x: number; y: number }, scale: number) => {
    if (!zoomCanvasRef.current || !zoomContainerRef.current) {
      return newPosition;
    }

    const canvas = zoomCanvasRef.current;
    const container = zoomContainerRef.current;
    
    const canvasWidth = canvas.width * scale;
    const canvasHeight = canvas.height * scale;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    let { x, y } = newPosition;

    if (canvasWidth <= containerWidth) {
      x = (containerWidth - canvasWidth) / 2 / scale;
    } else {
      x = Math.max((containerWidth - canvasWidth) / 2 / scale, Math.min(0, x));
    }

    if (canvasHeight <= containerHeight) {
      y = (containerHeight - canvasHeight) / 2 / scale;
    } else {
      y = Math.max((containerHeight - canvasHeight) / 2 / scale, Math.min(0, y));
    }

    return { x, y };
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoomScale(prev => {
      const newScale = Math.min(5, prev + 0.25);
      return newScale;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomScale(prev => {
      const newScale = Math.max(0.5, prev - 0.25);
      return newScale;
    });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomScale(prev => {
      const newScale = Math.max(0.5, Math.min(5, prev + delta));
      return newScale;
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoomScale > 1) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [zoomScale]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const dx = (e.clientX - dragStart.x) / zoomScale;
      const dy = (e.clientY - dragStart.y) / zoomScale;
      const newPosition = {
        x: position.x + dx,
        y: position.y + dy
      };
      const clampedPosition = clampPosition(newPosition, zoomScale);
      setPosition(clampedPosition);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, dragStart, zoomScale, position, clampPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      setIsPinching(true);
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      setInitialPinchDistance(distance);
      setInitialPinchScale(zoomScale);
    }
  }, [zoomScale]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 1 && isDragging) {
      const dx = (e.touches[0].clientX - dragStart.x) / zoomScale;
      const dy = (e.touches[0].clientY - dragStart.y) / zoomScale;
      const newPosition = {
        x: position.x + dx,
        y: position.y + dy
      };
      const clampedPosition = clampPosition(newPosition, zoomScale);
      setPosition(clampedPosition);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2 && isPinching) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      const scaleRatio = distance / initialPinchDistance;
      const newScale = Math.max(0.5, Math.min(5, initialPinchScale * scaleRatio));
      setZoomScale(newScale);
    }
  }, [isDragging, isPinching, dragStart, zoomScale, position, initialPinchDistance, initialPinchScale, clampPosition]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setIsPinching(false);
  }, []);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (zoomScale === 1) {
      setZoomScale(2);
    } else {
      setZoomScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [zoomScale]);

  const handleResetZoom = useCallback(() => {
    setZoomScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleDownload = useCallback(() => {
    if (!pattern || !exportCanvasRef.current) return;

    const displayCounts = colorCounts.filter(c => c.color.id !== 'bg');
    
    const canvas = exportCanvasRef.current;
    const padding = 20;
    const borderWidth = 8;
    const numberWidth = 30;
    const cellSize = 20;
    const colorsPerRow = 6;
    const colorBoxHeight = 36;
    const colorRows = Math.ceil(displayCounts.length / colorsPerRow);
    const colorSectionHeight = colorRows * colorBoxHeight + 20;

    const patternHeight = pattern.length;
    const patternWidth = pattern[0]?.length || patternHeight;
    const maxSize = Math.max(patternWidth, patternHeight);

    canvas.width = maxSize * cellSize + padding * 2 + borderWidth * 2 + numberWidth;
    canvas.height = maxSize * cellSize + padding * 2 + borderWidth * 2 + colorSectionHeight + numberWidth;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#F5F5F5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#E8E4E1';
    ctx.fillRect(numberWidth, numberWidth, canvas.width - numberWidth, maxSize * cellSize + padding * 2 + borderWidth * 2);

    ctx.fillStyle = '#D4CFC9';
    ctx.fillRect(numberWidth, numberWidth, canvas.width - numberWidth, borderWidth);
    ctx.fillRect(numberWidth, numberWidth + maxSize * cellSize + padding * 2 + borderWidth - borderWidth, canvas.width - numberWidth, borderWidth);
    ctx.fillRect(numberWidth, numberWidth, borderWidth, maxSize * cellSize + padding * 2 + borderWidth);
    ctx.fillRect(numberWidth + canvas.width - numberWidth - borderWidth, numberWidth, borderWidth, maxSize * cellSize + padding * 2 + borderWidth);

    ctx.fillStyle = '#C4BEB7';
    ctx.fillRect(numberWidth + borderWidth, numberWidth + borderWidth, canvas.width - numberWidth - borderWidth * 2, 4);
    ctx.fillRect(numberWidth + borderWidth, numberWidth + maxSize * cellSize + padding * 2 + borderWidth - borderWidth - 4, canvas.width - numberWidth - borderWidth * 2, 4);
    ctx.fillRect(numberWidth + borderWidth, numberWidth + borderWidth, 4, maxSize * cellSize + padding * 2 + borderWidth - borderWidth * 2);
    ctx.fillRect(numberWidth + canvas.width - numberWidth - borderWidth - 4, numberWidth + borderWidth, 4, maxSize * cellSize + padding * 2 + borderWidth - borderWidth * 2);

    ctx.fillStyle = '#F5F2EF';
    ctx.fillRect(
      numberWidth + borderWidth + 4,
      numberWidth + borderWidth + 4,
      canvas.width - numberWidth - (borderWidth + 4) * 2,
      maxSize * cellSize + padding * 2 + borderWidth - (borderWidth + 4) * 2
    );

    ctx.strokeStyle = '#E0DBD5';
    ctx.lineWidth = 0.5;
    const innerPadding = numberWidth + borderWidth + 4;
    const innerWidth = canvas.width - numberWidth - innerPadding;
    const innerHeight = maxSize * cellSize + padding * 2 + borderWidth - (numberWidth + borderWidth + 4);

    for (let i = 0; i <= 5; i++) {
      const y = innerPadding + (innerHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(innerPadding, y);
      ctx.lineTo(canvas.width - numberWidth, y);
      ctx.stroke();
    }
    for (let i = 0; i <= 5; i++) {
      const x = innerPadding + (innerWidth / 5) * i;
      ctx.beginPath();
      ctx.moveTo(x, innerPadding);
      ctx.lineTo(x, innerPadding + innerHeight);
      ctx.stroke();
    }

    ctx.fillStyle = '#E8E4E1';
    ctx.beginPath();
    ctx.arc(canvas.width - borderWidth - 8, numberWidth + borderWidth + 8, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#C4BEB7';
    ctx.beginPath();
    ctx.arc(canvas.width - borderWidth - 8, numberWidth + borderWidth + 8, 2, 0, Math.PI * 2);
    ctx.fill();

    const patternStartX = innerPadding;
    const patternStartY = innerPadding;

    ctx.strokeStyle = '#D4CFC9';
    ctx.lineWidth = 1;
    for (let y = 0; y <= patternHeight; y++) {
      ctx.beginPath();
      ctx.moveTo(patternStartX, patternStartY + y * cellSize);
      ctx.lineTo(patternStartX + patternWidth * cellSize, patternStartY + y * cellSize);
      ctx.stroke();
    }
    for (let x = 0; x <= patternWidth; x++) {
      ctx.beginPath();
      ctx.moveTo(patternStartX + x * cellSize, patternStartY);
      ctx.lineTo(patternStartX + x * cellSize, patternStartY + patternHeight * cellSize);
      ctx.stroke();
    }

    for (let y = 0; y < patternHeight; y++) {
      for (let x = 0; x < patternWidth; x++) {
        const pixel = pattern[y][x];
        const px = patternStartX + x * cellSize;
        const py = patternStartY + y * cellSize;

        ctx.fillStyle = pixel.color.hex;
        
        if (pixel.color.id === 'bg') {
          ctx.fillStyle = '#F5F2EF';
        }
        
        ctx.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);

        if (pixel.color.hex === '#FFFFFF' && pixel.color.id !== 'bg') {
          ctx.strokeStyle = '#D4CFC9';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
        }

        if (showColorId && pixel.color.id !== 'bg') {
          const brightness = (pixel.color.rgb.r * 299 + pixel.color.rgb.g * 587 + pixel.color.rgb.b * 114) / 1000;
          ctx.fillStyle = brightness > 200 ? '#666666' : '#ffffff';
          ctx.font = 'bold 7px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(pixel.color.id, px + cellSize / 2, py + cellSize / 2);
        }
      }
    }

    ctx.fillStyle = '#666666';
    ctx.font = 'bold 8px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    for (let y = 0; y < patternHeight; y++) {
      const py = patternStartY + y * cellSize + cellSize / 2;
      const num = y + 1;
      ctx.fillText(String(num), numberWidth - 3, py);
    }
    
    ctx.textAlign = 'center';
    for (let x = 0; x < patternWidth; x++) {
      const px = patternStartX + x * cellSize + cellSize / 2;
      const num = x + 1;
      ctx.fillText(String(num), px, numberWidth - 3);
    }

    const colorSectionY = numberWidth + maxSize * cellSize + padding * 2 + borderWidth;
    
    ctx.fillStyle = '#E8E4E1';
    ctx.fillRect(numberWidth, colorSectionY, canvas.width - numberWidth, colorSectionHeight);

    ctx.fillStyle = '#333333';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('使用的颜色', numberWidth + 20, colorSectionY + 20);

    const colorBoxWidth = (canvas.width - numberWidth - 40) / colorsPerRow;
    
    displayCounts.forEach((item, index) => {
      const row = Math.floor(index / colorsPerRow);
      const col = index % colorsPerRow;
      
      const boxX = numberWidth + 20 + col * colorBoxWidth;
      const boxY = colorSectionY + 30 + row * colorBoxHeight;
      
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(boxX, boxY, colorBoxWidth - 8, colorBoxHeight - 8);
      
      ctx.strokeStyle = '#D4CFC9';
      ctx.lineWidth = 1;
      ctx.strokeRect(boxX, boxY, colorBoxWidth - 8, colorBoxHeight - 8);
      
      const colorBoxSize = 28;
      const colorBoxX = boxX + 4;
      const colorBoxY = boxY + 4;
      
      ctx.fillStyle = item.color.hex;
      ctx.fillRect(colorBoxX, colorBoxY, colorBoxSize, colorBoxSize);
      
      if (item.color.hex === '#FFFFFF') {
        ctx.strokeStyle = '#D4CFC9';
        ctx.lineWidth = 1;
        ctx.strokeRect(colorBoxX, colorBoxY, colorBoxSize, colorBoxSize);
      }
      
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(item.color.id, colorBoxX + colorBoxSize + 8, colorBoxY + 12);
      
      ctx.font = '11px Arial';
      ctx.fillStyle = '#666666';
      ctx.fillText(`${item.count} 颗`, colorBoxX + colorBoxSize + 8, colorBoxY + 26);
    });

    const link = document.createElement('a');
    link.download = `bead-pattern-${exportSize}x${exportSize}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [pattern, colorCounts, exportSize, showColorId]);

  const handleOpenZoom = useCallback(() => {
    setShowZoomModal(true);
  }, []);

  const handleCloseZoom = useCallback(() => {
    setShowZoomModal(false);
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 h-full min-h-[500px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {showColorId ? <Eye className="w-5 h-5 text-purple-400" /> : <EyeOff className="w-5 h-5 text-purple-400" />}
          <h2 className="text-lg font-semibold text-white">预览</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenZoom}
            disabled={!pattern}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              pattern
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ZoomIn className="w-4 h-4" />
            放大查看
          </button>
          <button
            onClick={handleDownload}
            disabled={!pattern}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              pattern
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/25 hover:scale-105'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Download className="w-4 h-4" />
            下载图纸
          </button>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center overflow-auto">
        {pattern ? (
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-full rounded-lg shadow-2xl border border-white/10 cursor-pointer"
              style={{ maxHeight: '600px', imageRendering: 'pixelated' }}
              onClick={() => pattern && setShowDownloadModal(true)}
            />
            <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-4 text-xs text-gray-400">
              <span>尺寸: {pattern.length} x {pattern.length}</span>
              <span>珠子: {pattern.length * pattern.length} 颗</span>
            </div>
          </div>
        ) : selectedImage ? (
          <div className="text-center">
            <img
              src={selectedImage}
              alt="预览"
              className="max-w-full max-h-[500px] rounded-lg shadow-2xl border border-white/10"
              style={{ maxHeight: '500px' }}
            />
            <p className="text-gray-400 text-sm mt-4">来自社区的作品图片</p>
            <p className="text-gray-500 text-xs mt-1">点击「生成图纸」将其转换为拼豆图案</p>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-lg font-medium">上传图片开始生成</p>
            <p className="text-sm text-gray-500 mt-1">支持多种图片格式</p>
          </div>
        )}
      </div>

      {showZoomModal && (
        <div className="fixed inset-0 bg-black/90 z-50 select-none" onClick={handleCloseZoom}>
          <div className="relative w-full h-full flex flex-col">
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent z-20">
              <h3 className="text-xl font-semibold text-white">放大预览</h3>
              <div className="flex items-center gap-3">
                <div className="text-white text-sm">{(zoomScale * 100).toFixed(0)}%</div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white flex items-center justify-center backdrop-blur-sm text-2xl"
                >
                  −
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white flex items-center justify-center backdrop-blur-sm text-2xl"
                >
                  +
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleResetZoom(); }}
                  className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white text-sm backdrop-blur-sm"
                >
                  重置
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleCloseZoom(); }}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
            <div ref={zoomContainerRef} className="flex-1 flex items-center justify-center overflow-hidden bg-black/50">
              <div
                className="relative"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e); }}
                onMouseMove={(e) => { e.stopPropagation(); handleMouseMove(e); }}
                onMouseUp={(e) => { e.stopPropagation(); handleMouseUp(); }}
                onMouseLeave={(e) => { e.stopPropagation(); handleMouseUp(); }}
                onWheel={handleWheel}
                onDoubleClick={(e) => { e.stopPropagation(); handleDoubleClick(e); }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                style={{
                  transform: `translate(${position.x * zoomScale}px, ${position.y * zoomScale}px) scale(${zoomScale})`,
                  transition: isDragging || isPinching ? 'none' : 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  cursor: zoomScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                  transformOrigin: 'center center'
                }}
              >
                <canvas
                  ref={zoomCanvasRef}
                  className="rounded-lg shadow-2xl pointer-events-none"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>
            </div>
            <div className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-sm z-20">
              滚轮缩放 · 拖拽移动 · 双击放大/缩小 · 双指捏合缩放 · 点击空白处关闭
            </div>
          </div>
        </div>
      )}

      {showDownloadModal && pattern && canvasRef.current && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setShowDownloadModal(false)}>
          <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowDownloadModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 p-2"
            >
              <X className="w-8 h-8" />
            </button>
            <canvas
              ref={canvasRef}
              className="w-full h-auto rounded-lg"
              style={{ imageRendering: 'pixelated' }}
            />
            <div className="mt-4 flex items-center justify-end">
              <button
                onClick={() => {
                  if (canvasRef.current) {
                    const link = document.createElement('a');
                    link.download = `拼豆图纸-${pattern.length}x${pattern.length}.png`;
                    link.href = canvasRef.current.toDataURL('image/png');
                    link.click();
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                <Download className="w-5 h-5" />
                下载图纸
              </button>
            </div>
          </div>
        </div>
      )}

      <canvas ref={exportCanvasRef} className="hidden" />
    </div>
  );
};
