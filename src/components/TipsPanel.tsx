import { Info, Lightbulb, AlertCircle } from 'lucide-react';

export const TipsPanel = () => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-400" />
        <h2 className="text-lg font-semibold text-white">使用提示</h2>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Info className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-gray-300 text-sm font-medium">图片选择</p>
            <p className="text-gray-500 text-xs mt-1">建议使用纯色背景的图片，效果更佳</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <Info className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <p className="text-gray-300 text-sm font-medium">尺寸选择</p>
            <p className="text-gray-500 text-xs mt-1">尺寸越大，细节越丰富，但拼豆数量也越多</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <p className="text-gray-300 text-sm font-medium">注意事项</p>
            <p className="text-gray-500 text-xs mt-1">本工具在小尺寸（如 24x24）下可能无法准确还原图片细节，建议使用 48x48 及以上尺寸以获得更好的效果</p>
          </div>
        </div>
      </div>
    </div>
  );
};