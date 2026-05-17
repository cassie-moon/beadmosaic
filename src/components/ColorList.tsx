import { Palette, Layers } from 'lucide-react';
import type { PerlerColor } from '../types';

interface ColorCount {
  color: PerlerColor;
  count: number;
}

interface ColorListProps {
  colorCounts: ColorCount[];
}

export const ColorList = ({ colorCounts }: ColorListProps) => {
  const safeColorCounts = colorCounts || [];
  const totalBeads = safeColorCounts.reduce((sum, item) => sum + (item?.count || 0), 0);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-semibold text-gray-800">颜色清单</h2>
        </div>

        {safeColorCounts.length > 0 ? (
          <>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {safeColorCounts.map((item) => {
                const isLight = ['#ffffff', '#f0f0f0', '#e0e8ea', '#c9c9c9', '#f5f5dc', '#fffacd', '#fffafa', '#faf0e6', '#ffe4c4'].includes(item.color.hex);
                return (
                  <div
                    key={item.color.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 cursor-pointer group"
                  >
                    <div
                      className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-xs font-bold shadow-sm group-hover:scale-110 transition-transform"
                      style={{
                        backgroundColor: item.color.hex,
                        color: isLight ? '#333333' : '#ffffff',
                      }}
                    >
                      {item.color.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 text-sm font-medium truncate">{item.color.id}</p>
                      <p className="text-gray-500 text-xs">{item.color.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-800 font-bold">{item.count}</p>
                      <p className="text-gray-400 text-xs">颗</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span className="text-gray-500 text-xs">颜色种类</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">{safeColorCounts.length}</p>
                </div>
                <div className="bg-pink-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Palette className="w-4 h-4 text-pink-600" />
                    <span className="text-gray-500 text-xs">总珠子数</span>
                  </div>
                  <p className="text-2xl font-bold text-pink-600">{totalBeads}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">生成图纸后显示颜色清单</p>
          </div>
        )}
      </div>

      <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
        <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center gap-2">
          💡 小提示
        </h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex items-start gap-2">
            <span className="text-amber-500">•</span>
            <span>建议使用对比度高的图片</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500">•</span>
            <span>图片主体尽量居中</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500">•</span>
            <span>小尺寸图纸更清晰</span>
          </li>
        </ul>
      </div>
    </div>
  );
};