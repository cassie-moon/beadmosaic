export type PerlerColor = {
  id: string;
  name: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  series?: string;
  count?: number;
};

export interface PerlerPattern {
  id: string;
  name: string;
  width: number;
  height: number;
  pixelSize: number;
  grid: PerlerColor[][];
  colorPalette: PerlerColor[];
  createdAt: Date;
}

export interface UserPreferences {
  colorStyle: 'vibrant' | 'pastel' | 'monochrome' | 'natural';
  complexity: 'simple' | 'medium' | 'complex';
  theme: 'animals' | 'nature' | 'abstract' | 'characters';
}

export interface DesignOption {
  id: string;
  name: string;
  description: string;
  theme: string[];
  colorStyle: string;
  complexity: number;
}