import { Palette, Users } from 'lucide-react';

interface HeaderProps {
  activeTab: 'upload' | 'community';
  onTabChange: (tab: 'upload' | 'community') => void;
}

export const Header = ({ activeTab, onTabChange }: HeaderProps) => {
  const tabs = [
    { id: 'upload' as const, label: '上传图片', icon: Palette },
    { id: 'community' as const, label: '分享社区', icon: Users },
  ];

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-xl">🧩</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">BeadMosaic</h1>
              <p className="text-xs text-gray-500">拼豆图纸生成器</p>
            </div>
          </div>

          <nav className="flex items-center bg-gray-100 rounded-xl p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-xs text-emerald-600">在线生成</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};