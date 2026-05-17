import type { PerlerColor } from '../types';

export const PERLER_COLORS: PerlerColor[] = [
  { id: 'H1', name: '纯白', hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 } },
  { id: 'H2', name: '奶油白', hex: '#FDF8F3', rgb: { r: 253, g: 248, b: 243 } },
  { id: 'H3', name: '浅灰', hex: '#E8E8E8', rgb: { r: 232, g: 232, b: 232 } },
  { id: 'H4', name: '中灰', hex: '#A0A0A0', rgb: { r: 160, g: 160, b: 160 } },
  { id: 'H5', name: '深灰', hex: '#666666', rgb: { r: 102, g: 102, b: 102 } },
  { id: 'H7', name: '纯黑', hex: '#1A1A1A', rgb: { r: 26, g: 26, b: 26 } },
  { id: 'H9', name: '银灰', hex: '#C8C8C8', rgb: { r: 200, g: 200, b: 200 } },
  { id: 'H10', name: '浅灰白', hex: '#F0F0F0', rgb: { r: 240, g: 240, b: 240 } },
  { id: 'H11', name: '暖灰', hex: '#969696', rgb: { r: 150, g: 150, b: 150 } },
  { id: 'H14', name: '灰白', hex: '#D8D8D8', rgb: { r: 216, g: 216, b: 216 } },
  { id: 'H17', name: '米白', hex: '#FAF8F5', rgb: { r: 250, g: 248, b: 245 } },
  { id: 'H20', name: '珍珠白', hex: '#F5F5F5', rgb: { r: 245, g: 245, b: 245 } },
  
  { id: 'E2', name: '极浅粉', hex: '#FFF0F3', rgb: { r: 255, g: 240, b: 243 } },
  { id: 'E1', name: '浅粉', hex: '#FFE4E9', rgb: { r: 255, g: 228, b: 233 } },
  { id: 'E3', name: '粉红', hex: '#FFB6C1', rgb: { r: 255, g: 182, b: 193 } },
  { id: 'E15', name: '淡粉', hex: '#FFE8EC', rgb: { r: 255, g: 232, b: 236 } },
  { id: 'F14', name: '深粉', hex: '#FF8FA3', rgb: { r: 255, g: 143, b: 163 } },
  { id: 'F5', name: '红色', hex: '#FF4757', rgb: { r: 255, g: 71, b: 87 } },
  { id: 'F20', name: '粉红', hex: '#FF99AA', rgb: { r: 255, g: 153, b: 170 } },
  { id: 'F22', name: '玫瑰粉', hex: '#FFB3C1', rgb: { r: 255, g: 179, b: 193 } },
  { id: 'F24', name: '深粉红', hex: '#FF7A91', rgb: { r: 255, g: 122, b: 145 } },
  { id: 'F6', name: '珊瑚红', hex: '#FF7F50', rgb: { r: 255, g: 127, b: 80 } },
  { id: 'F8', name: '酒红', hex: '#8B0000', rgb: { r: 139, g: 0, b: 0 } },
  
  { id: 'A1', name: '奶油黄', hex: '#FFF9E6', rgb: { r: 255, g: 249, b: 230 } },
  { id: 'A3', name: '金黄', hex: '#FFD93D', rgb: { r: 255, g: 217, b: 61 } },
  { id: 'A10', name: '杏色', hex: '#FFD4B8', rgb: { r: 255, g: 212, b: 184 } },
  { id: 'A20', name: '浅米色', hex: '#F5E6C8', rgb: { r: 245, g: 230, b: 200 } },
  { id: 'A25', name: '肤色', hex: '#FFE4C9', rgb: { r: 255, g: 228, b: 201 } },
  { id: 'A5', name: '橙色', hex: '#FFA500', rgb: { r: 255, g: 165, b: 0 } },
  { id: 'A8', name: '柠檬黄', hex: '#FFFACD', rgb: { r: 255, g: 250, b: 205 } },
  
  { id: 'G2', name: '浅棕', hex: '#DBC4A8', rgb: { r: 219, g: 196, b: 168 } },
  { id: 'G4', name: '深棕', hex: '#704214', rgb: { r: 112, g: 66, b: 20 } },
  { id: 'G7', name: '巧克力棕', hex: '#5D3A1A', rgb: { r: 93, g: 58, b: 26 } },
  { id: 'G16', name: '浅棕褐', hex: '#B8966E', rgb: { r: 184, g: 150, b: 110 } },
  { id: 'G17', name: '深棕褐', hex: '#6B4423', rgb: { r: 107, g: 68, b: 35 } },
  { id: 'F11', name: '棕色', hex: '#8B4513', rgb: { r: 139, g: 69, b: 19 } },
  { id: 'G14', name: '小麦色', hex: '#E8C48A', rgb: { r: 232, g: 196, b: 138 } },
  { id: 'G20', name: '咖啡棕', hex: '#4A3728', rgb: { r: 74, g: 55, b: 40 } },
  
  { id: 'B2', name: '浅绿', hex: '#B8E6D0', rgb: { r: 184, g: 230, b: 208 } },
  { id: 'B4', name: '翠绿', hex: '#008080', rgb: { r: 0, g: 128, b: 128 } },
  { id: 'B6', name: '深绿', hex: '#228B22', rgb: { r: 34, g: 139, b: 34 } },
  { id: 'B8', name: '黄绿', hex: '#9ACD32', rgb: { r: 154, g: 205, b: 50 } },
  { id: 'B10', name: '薄荷绿', hex: '#98FB98', rgb: { r: 152, g: 251, b: 152 } },
  { id: 'B12', name: '橄榄绿', hex: '#808000', rgb: { r: 128, g: 128, b: 0 } },
  
  { id: 'C2', name: '浅蓝', hex: '#B8D8E8', rgb: { r: 184, g: 216, b: 232 } },
  { id: 'C4', name: '天蓝', hex: '#87CEEB', rgb: { r: 135, g: 206, b: 235 } },
  { id: 'C6', name: '深蓝', hex: '#1E90FF', rgb: { r: 30, g: 144, b: 255 } },
  { id: 'C8', name: '海军蓝', hex: '#000080', rgb: { r: 0, g: 0, b: 128 } },
  { id: 'C23', name: '浅蓝灰', hex: '#C8D8E8', rgb: { r: 200, g: 216, b: 232 } },
  { id: 'C25', name: '冰蓝', hex: '#ADD8E6', rgb: { r: 173, g: 216, b: 230 } },
  
  { id: 'D8', name: '薰衣草', hex: '#E8D8E8', rgb: { r: 232, g: 216, b: 232 } },
  { id: 'D4', name: '紫色', hex: '#800080', rgb: { r: 128, g: 0, b: 128 } },
  { id: 'D6', name: '深紫', hex: '#4B0082', rgb: { r: 75, g: 0, b: 130 } },
  { id: 'D10', name: '淡紫', hex: '#DA70D6', rgb: { r: 218, g: 112, b: 214 } },
  { id: 'D12', name: '紫罗兰', hex: '#EE82EE', rgb: { r: 238, g: 130, b: 238 } },
  
  { id: 'Z1', name: '金色', hex: '#DAA520', rgb: { r: 218, g: 165, b: 32 } },
  { id: 'Z2', name: '银色', hex: '#C0C0C0', rgb: { r: 192, g: 192, b: 192 } },
];

export const getColorById = (id: string): PerlerColor | undefined => {
  return PERLER_COLORS.find(color => color.id === id);
};