import { PERLER_COLORS } from '../data/colors';
import type { PerlerColor } from '../types';

interface PerlerPattern {
  id: string;
  name: string;
  width: number;
  height: number;
  pixelSize: number;
  grid: PerlerColor[][];
  colorPalette: PerlerColor[];
  createdAt: Date;
}

const rgbToLab = (r: number, g: number, b: number): { l: number; a: number; b: number } => {
  r /= 255;
  g /= 255;
  b /= 255;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0;
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  const fx = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + 16 / 116;
  const fy = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116;
  const fz = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + 16 / 116;

  return {
    l: (116 * fy) - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz)
  };
};

const ciede2000 = (
  lab1: { l: number; a: number; b: number },
  lab2: { l: number; a: number; b: number }
): number => {
  const l1 = lab1.l, a1 = lab1.a, b1 = lab1.b;
  const l2 = lab2.l, a2 = lab2.a, b2 = lab2.b;

  const avgL = (l1 + l2) / 2;
  const c1 = Math.sqrt(a1 * a1 + b1 * b1);
  const c2 = Math.sqrt(a2 * a2 + b2 * b2);
  const avgC = (c1 + c2) / 2;

  const g = (1 - Math.sqrt(Math.pow(avgC, 7) / (Math.pow(avgC, 7) + Math.pow(25, 7)))) / 2;
  const a1Prime = a1 * (1 + g);
  const a2Prime = a2 * (1 + g);

  const c1Prime = Math.sqrt(a1Prime * a1Prime + b1 * b1);
  const c2Prime = Math.sqrt(a2Prime * a2Prime + b2 * b2);
  const avgCPrime = (c1Prime + c2Prime) / 2;

  const h1Prime = c1Prime === 0 ? 0 : Math.atan2(b1, a1Prime);
  const h2Prime = c2Prime === 0 ? 0 : Math.atan2(b2, a2Prime);

  let deltaLPrime = l2 - l1;
  let deltaCPrime = c2Prime - c1Prime;

  let hDiff = h2Prime - h1Prime;
  if (c1Prime * c2Prime === 0) {
    hDiff = 0;
  } else if (Math.abs(hDiff) > Math.PI) {
    hDiff += hDiff > 0 ? -2 * Math.PI : 2 * Math.PI;
  }

  const deltaHPrime = 2 * Math.sqrt(c1Prime * c2Prime) * Math.sin(hDiff / 2);

  const avgHPrime = c1Prime * c2Prime === 0 
    ? h1Prime + h2Prime 
    : (Math.abs(hDiff) <= Math.PI 
      ? (h1Prime + h2Prime) / 2 
      : (h1Prime + h2Prime + (h1Prime + h2Prime < 0 ? 2 * Math.PI : -2 * Math.PI)) / 2);

  const t = 1 
    - 0.17 * Math.cos(avgHPrime - Math.PI / 6) 
    + 0.24 * Math.cos(2 * avgHPrime) 
    + 0.32 * Math.cos(3 * avgHPrime + Math.PI / 30) 
    - 0.2 * Math.cos(4 * avgHPrime - 63 * Math.PI / 180);

  const theta = 30 * Math.exp(-Math.pow((avgHPrime * 180 / Math.PI - 275) / 25, 2));
  const rC = 2 * Math.sqrt(Math.pow(avgCPrime, 7) / (Math.pow(avgCPrime, 7) + Math.pow(25, 7)));
  const sL = 1 + (0.015 * Math.pow(avgL - 50, 2)) / Math.sqrt(20 + Math.pow(avgL - 50, 2));
  const sC = 1 + 0.045 * avgCPrime;
  const sH = 1 + 0.015 * avgCPrime * t;

  const rT = (-Math.sin(2 * theta)) * rC;

  const deltaL = deltaLPrime / sL;
  const deltaC = deltaCPrime / sC;
  const deltaH = deltaHPrime / sH;

  return Math.sqrt(deltaL * deltaL + deltaC * deltaC + deltaH * deltaH + rT * deltaC * deltaH);
};

export const calculateColorDistance = (
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number }
): number => {
  const lab1 = rgbToLab(color1.r, color1.g, color1.b);
  const lab2 = rgbToLab(color2.r, color2.g, color2.b);
  return ciede2000(lab1, lab2);
};

export const findClosestPerlerColor = (rgb: { r: number; g: number; b: number }): PerlerColor => {
  let minDistance = Infinity;
  let closestColor = PERLER_COLORS[0];

  for (const color of PERLER_COLORS) {
    const distance = calculateColorDistance(rgb, color.rgb);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = color;
    }
  }

  return { ...closestColor };
};

export const pixelateImage = (
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number
): PerlerColor[][] => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('无法创建Canvas上下文');

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const data = imageData.data;

  const grid: PerlerColor[][] = [];

  for (let y = 0; y < targetHeight; y++) {
    const row: PerlerColor[] = [];
    for (let x = 0; x < targetWidth; x++) {
      const index = (y * targetWidth + x) * 4;
      const rgb = {
        r: data[index],
        g: data[index + 1],
        b: data[index + 2],
      };
      const perlerColor = findClosestPerlerColor(rgb);
      row.push(perlerColor);
    }
    grid.push(row);
  }

  return grid;
};

export const createPattern = (
  grid: PerlerColor[][],
  pixelSize: number = 10
): PerlerPattern => {
  const colorPalette = getUniqueColors(grid);
  
  return {
    id: Date.now().toString(),
    name: `Pattern ${Date.now()}`,
    width: grid[0]?.length || 0,
    height: grid.length,
    pixelSize,
    grid,
    colorPalette,
    createdAt: new Date(),
  };
};

export const getUniqueColors = (grid: PerlerColor[][]): PerlerColor[] => {
  const colorMap = new Map<string, PerlerColor>();

  for (const row of grid) {
    for (const color of row) {
      if (!colorMap.has(color.id)) {
        colorMap.set(color.id, { ...color, count: 0 });
      }
      const existing = colorMap.get(color.id)!;
      existing.count = (existing.count || 0) + 1;
    }
  }

  return Array.from(colorMap.values());
};

export const renderPatternToCanvas = (
  ctx: CanvasRenderingContext2D,
  grid: PerlerColor[][],
  beadSize: number = 10,
  gap: number = 2
) => {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const color = grid[y][x];
      const centerX = x * (beadSize + gap) + beadSize / 2;
      const centerY = y * (beadSize + gap) + beadSize / 2;

      ctx.beginPath();
      ctx.arc(centerX, centerY, beadSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = color.hex;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX - beadSize / 4, centerY - beadSize / 4, beadSize / 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fill();
    }
  }
};

export const downloadCanvas = (canvas: HTMLCanvasElement, filename: string) => {
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};