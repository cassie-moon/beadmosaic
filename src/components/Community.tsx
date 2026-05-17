import { useState, useMemo } from 'react';
import { Search, Upload, Star, Heart, MessageCircle, User, Filter, X, LogIn, LogOut, Check, Grid, List, ChevronDown, Download } from 'lucide-react';
import { PERLER_COLORS } from '../data/colors';
import type { PerlerColor } from '../types';

interface PatternPixel {
  color: PerlerColor;
  x: number;
  y: number;
}

interface ColorCount {
  color: PerlerColor;
  count: number;
}

interface CommunityDesign {
  id: string;
  title: string;
  author: string;
  authorId: string;
  category: string;
  tags: string[];
  pattern: PatternPixel[][];
  colorCounts: ColorCount[];
  previewImage: string;
  likes: number;
  rating: number;
  ratingCount: number;
  comments: Comment[];
  createdAt: string;
  size: number;
}

interface Comment {
  id: string;
  author: string;
  authorId: string;
  content: string;
  createdAt: string;
}

interface CommunityProps {
  onSelectPattern: (pattern: PatternPixel[][], counts: ColorCount[]) => void;
  onSwitchToUpload: () => void;
  currentPattern: PatternPixel[][] | null;
  currentColorCounts: ColorCount[];
}

const categories = [
  { id: 'all', label: '全部', icon: '⊕' },
  { id: 'animals', label: '动物', icon: '●' },
  { id: 'characters', label: '角色', icon: '◇' },
  { id: 'nature', label: '自然', icon: '○' },
  { id: 'food', label: '美食', icon: '△' },
  { id: 'objects', label: '物品', icon: '□' },
  { id: 'abstract', label: '抽象', icon: '☆' },
  { id: 'holiday', label: '节日', icon: '♡' },
];

const sortOptions = [
  { id: 'latest', label: '最新发布' },
  { id: 'popular', label: '最受欢迎' },
  { id: 'rating', label: '评分最高' },
];

const mockUsers: Record<string, { name: string; avatar: string }> = {
  'user1': { name: '拼豆小能手', avatar: '🐰' },
  'user2': { name: '创意达人', avatar: '🎨' },
  'user3': { name: '手工爱好者', avatar: '🧵' },
  'current': { name: '我', avatar: '👤' },
};

const generateMockDesigns = (): CommunityDesign[] => {
  const designs: CommunityDesign[] = [
    {
      id: 'design-0',
      title: '可爱像素画',
      author: '拼豆小能手',
      authorId: 'user1',
      category: 'animals',
      tags: ['可爱', '彩色'],
      pattern: [],
      colorCounts: [],
      previewImage: '/design1.jpg',
      likes: 128,
      rating: 4.8,
      ratingCount: 32,
      comments: [{ id: 'c1', author: '拼豆小能手', authorId: 'user1', content: '太可爱了！', createdAt: '2024-01-15' }],
      createdAt: '2024-01-15',
      size: 32,
    },
    {
      id: 'design-1',
      title: '彩虹图案',
      author: '创意达人',
      authorId: 'user2',
      category: 'abstract',
      tags: ['彩虹', '彩色'],
      pattern: [],
      colorCounts: [],
      previewImage: '/design2.jpg',
      likes: 256,
      rating: 4.9,
      ratingCount: 58,
      comments: [],
      createdAt: '2024-01-14',
      size: 32,
    },
    {
      id: 'design-2',
      title: '精致小作',
      author: '手工爱好者',
      authorId: 'user3',
      category: 'characters',
      tags: ['可爱', '精致'],
      pattern: [],
      colorCounts: [],
      previewImage: '/design3.jpg',
      likes: 89,
      rating: 4.6,
      ratingCount: 21,
      comments: [],
      createdAt: '2024-01-13',
      size: 32,
    },
    {
      id: 'design-3',
      title: '粉色系作品',
      author: '拼豆小能手',
      authorId: 'user1',
      category: 'nature',
      tags: ['粉色', '少女心'],
      pattern: [],
      colorCounts: [],
      previewImage: '/design4.jpg',
      likes: 175,
      rating: 4.7,
      ratingCount: 45,
      comments: [],
      createdAt: '2024-01-12',
      size: 32,
    },
  ];

  return designs;
};

const renderPatternPreview = (pattern: PatternPixel[][], size: number): string => {
  const canvas = document.createElement('canvas');
  const scale = Math.min(120 / size, 120 / size);
  canvas.width = size * scale;
  canvas.height = size * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  pattern.forEach(row => {
    row.forEach(pixel => {
      ctx.fillStyle = pixel.color.hex;
      ctx.fillRect(pixel.x * scale, pixel.y * scale, scale, scale);
    });
  });

  return canvas.toDataURL();
};

export const Community = ({ onSelectPattern, onSwitchToUpload, currentPattern, currentColorCounts }: CommunityProps) => {
  const [designs, setDesigns] = useState<CommunityDesign[]>(() => generateMockDesigns());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; avatar: string } | null>(null);
  const [likedDesigns, setLikedDesigns] = useState<Set<string>>(new Set());
  const [ratedDesigns, setRatedDesigns] = useState<Set<string>>(new Set());
  const [showComments, setShowComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');

  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: 'animals',
    tags: '',
  });

  const filteredDesigns = useMemo(() => {
    let result = [...designs];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        d =>
          d.title.toLowerCase().includes(query) ||
          d.author.toLowerCase().includes(query) ||
          d.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(d => d.category === selectedCategory);
    }

    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => b.likes - a.likes);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'latest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [designs, searchQuery, selectedCategory, sortBy]);

  const handleLike = (designId: string) => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }

    setDesigns(prev =>
      prev.map(d => {
        if (d.id === designId) {
          const isLiked = likedDesigns.has(designId);
          return {
            ...d,
            likes: isLiked ? d.likes - 1 : d.likes + 1,
          };
        }
        return d;
      })
    );

    setLikedDesigns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(designId)) {
        newSet.delete(designId);
      } else {
        newSet.add(designId);
      }
      return newSet;
    });
  };

  const handleRate = (designId: string, rating: number) => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }

    if (ratedDesigns.has(designId)) return;

    setDesigns(prev =>
      prev.map(d => {
        if (d.id === designId) {
          const newRatingCount = d.ratingCount + 1;
          const newRating = ((d.rating * d.ratingCount) + rating) / newRatingCount;
          return {
            ...d,
            rating: Math.round(newRating * 10) / 10,
            ratingCount: newRatingCount,
          };
        }
        return d;
      })
    );

    setRatedDesigns(prev => new Set(prev).add(designId));
  };

  const handleAddComment = (designId: string) => {
    if (!currentUser || !newComment.trim()) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      author: currentUser.name,
      authorId: 'current',
      content: newComment,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setDesigns(prev =>
      prev.map(d => {
        if (d.id === designId) {
          return {
            ...d,
            comments: [...d.comments, comment],
          };
        }
        return d;
      })
    );

    setNewComment('');
  };

  const handleUseDesign = (design: CommunityDesign) => {
    if (design.pattern && design.pattern.length > 0) {
      onSelectPattern(design.pattern, design.colorCounts, design.previewImage || undefined);
      onSwitchToUpload();
    } else if (design.previewImage) {
      setPreviewImage(design.previewImage);
      setPreviewTitle(design.title);
    }
  };

  const handleLogin = (username: string) => {
    setCurrentUser({ name: username, avatar: '👤' });
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLikedDesigns(new Set());
    setRatedDesigns(new Set());
  };

  const handleUpload = () => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    setShowUploadModal(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4">
      <div className="text-center py-6">
        <h2 className="text-2xl font-medium text-gray-800 mb-2">分享社区</h2>
        <p className="text-gray-500 text-sm">浏览、分享和下载其他创作者的拼豆作品</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索作品、作者或标签..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="appearance-none pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 cursor-pointer"
            >
              {sortOptions.map(opt => (
                <option key={opt.id} value={opt.id} className="bg-white">
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {currentUser ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-700 text-sm">{currentUser.avatar} {currentUser.name}</span>
              <button
                onClick={handleLogout}
                className="p-2 bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-sm"
            >
              <LogIn className="w-4 h-4" />
              登录
            </button>
          )}

          <button
            onClick={handleUpload}
            className="flex items-center gap-2 px-4 py-2.5 bg-pink-400 hover:bg-pink-500 text-white rounded-lg transition-colors text-sm"
          >
            <Upload className="w-4 h-4" />
            上传作品
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              selectedCategory === cat.id
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="mr-1.5">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {filteredDesigns.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">没有找到匹配的作品</p>
          <p className="text-gray-500 text-sm mt-2">试试其他搜索词或分类</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredDesigns.map(design => (
            <DesignCard
              key={design.id}
              design={design}
              isLiked={likedDesigns.has(design.id)}
              isRated={ratedDesigns.has(design.id)}
              onLike={handleLike}
              onRate={handleRate}
              onUse={handleUseDesign}
              onToggleComments={() => setShowComments(showComments === design.id ? null : design.id)}
              comments={showComments === design.id ? design.comments : []}
              newComment={newComment}
              setNewComment={setNewComment}
              onAddComment={() => handleAddComment(design.id)}
              currentUser={currentUser}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDesigns.map(design => (
            <DesignListItem
              key={design.id}
              design={design}
              isLiked={likedDesigns.has(design.id)}
              isRated={ratedDesigns.has(design.id)}
              onLike={handleLike}
              onRate={handleRate}
              onUse={handleUseDesign}
              onToggleComments={() => setShowComments(showComments === design.id ? null : design.id)}
              comments={showComments === design.id ? design.comments : []}
              newComment={newComment}
              setNewComment={setNewComment}
              onAddComment={() => handleAddComment(design.id)}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
        />
      )}

      {showUploadModal && (
        <UploadModal
          form={uploadForm}
          setForm={setUploadForm}
          onClose={() => setShowUploadModal(false)}
          onUpload={(pattern, counts) => {
            const canvas = document.createElement('canvas');
            const size = pattern.length;
            const scale = Math.min(200 / size, 200 / size);
            canvas.width = size * scale;
            canvas.height = size * scale;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.imageSmoothingEnabled = false;
              pattern.forEach(row => {
                row.forEach(pixel => {
                  ctx.fillStyle = pixel.color.hex;
                  ctx.fillRect(pixel.x * scale, pixel.y * scale, scale, scale);
                });
              });
            }
            
            const newDesign: CommunityDesign = {
              id: `design-${Date.now()}`,
              title: uploadForm.title || '未命名作品',
              author: currentUser?.name || '匿名',
              authorId: 'current',
              category: uploadForm.category,
              tags: uploadForm.tags.split(',').map(t => t.trim()).filter(Boolean),
              pattern,
              colorCounts: counts,
              previewImage: canvas.toDataURL(),
              likes: 0,
              rating: 0,
              ratingCount: 0,
              comments: [],
              createdAt: new Date().toISOString().split('T')[0],
              size,
            };

            setDesigns(prev => [newDesign, ...prev]);
            setShowUploadModal(false);
            setUploadForm({ title: '', category: 'animals', tags: '' });
          }}
          currentPattern={currentPattern}
          currentColorCounts={currentColorCounts}
        />
      )}

      {previewImage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-200 p-2"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={previewImage}
              alt={previewTitle}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
            <div className="mt-4 flex items-center justify-between">
              <h3 className="text-gray-800 text-xl font-semibold">{previewTitle}</h3>
              <a
                href={previewImage}
                download={`${previewTitle}.jpg`}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-sm"
              >
                <Download className="w-5 h-5" />
                下载图片
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface DesignCardProps {
  design: CommunityDesign;
  isLiked: boolean;
  isRated: boolean;
  onLike: (id: string) => void;
  onRate: (id: string, rating: number) => void;
  onUse: (design: CommunityDesign) => void;
  onToggleComments: () => void;
  comments: Comment[];
  newComment: string;
  setNewComment: (v: string) => void;
  onAddComment: () => void;
  currentUser: { name: string; avatar: string } | null;
}

const DesignCard = ({
  design,
  isLiked,
  isRated,
  onLike,
  onRate,
  onUse,
  onToggleComments,
  comments,
  newComment,
  setNewComment,
  onAddComment,
  currentUser,
}: DesignCardProps) => {
  const [hoverRating, setHoverRating] = useState(0);
  const previewUrl = design.previewImage || (design.pattern && design.pattern.length > 0 ? renderPatternPreview(design.pattern, design.size) : '');

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
      <div className="relative aspect-square bg-gray-50">
        {previewUrl ? (
          <img src={previewUrl} alt={design.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
            {design.size}x{design.size}
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-end justify-center pb-3 gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={() => onUse(design)}
            className="px-4 py-2 bg-white text-gray-700 text-sm rounded-lg hover:bg-gray-50 shadow-sm"
          >
            使用此图纸
          </button>
        </div>
        <div className="absolute top-3 right-3 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-md text-xs text-white">
          {design.size}x{design.size}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <h3 className="text-gray-800 font-medium truncate">{design.title}</h3>
        <p className="text-gray-500 text-sm">{design.author}</p>

        <div className="flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onMouseEnter={() => !isRated && setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => onRate(design.id, star)}
                className={`transition-colors ${isRated ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
              >
                <Star
                  className={`w-4 h-4 ${
                    star <= (hoverRating || Math.round(design.rating))
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-gray-400 text-xs">{design.rating.toFixed(1)}</span>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => onLike(design.id)}
            className={`flex items-center gap-1 transition-colors ${isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'}`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
            <span className="text-sm">{design.likes}</span>
          </button>

          <button
            onClick={onToggleComments}
            className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">{design.comments.length}</span>
          </button>
        </div>
      </div>

      {comments.length > 0 && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          <h4 className="text-gray-700 text-sm font-medium">评论</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {comments.map(comment => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-700 text-sm font-medium">{comment.author}</span>
                  <span className="text-gray-400 text-xs">{comment.createdAt}</span>
                </div>
                <p className="text-gray-600 text-sm">{comment.content}</p>
              </div>
            ))}
          </div>
          {currentUser && (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="写下你的评论..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-300"
              />
              <button
                onClick={onAddComment}
                className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors"
              >
                发送
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface DesignListItemProps {
  design: CommunityDesign;
  isLiked: boolean;
  isRated: boolean;
  onLike: (id: string) => void;
  onRate: (id: string, rating: number) => void;
  onUse: (design: CommunityDesign) => void;
  onToggleComments: () => void;
  comments: Comment[];
  newComment: string;
  setNewComment: (v: string) => void;
  onAddComment: () => void;
  currentUser: { name: string; avatar: string } | null;
}

const DesignListItem = ({
  design,
  isLiked,
  isRated,
  onLike,
  onRate,
  onUse,
  onToggleComments,
  comments,
  newComment,
  setNewComment,
  onAddComment,
  currentUser,
}: DesignListItemProps) => {
  const [hoverRating, setHoverRating] = useState(0);
  const previewUrl = design.previewImage || renderPatternPreview(design.pattern, design.size);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all">
      <div className="flex flex-col md:flex-row">
        <div className="relative w-full md:w-48 h-48 bg-gray-800 flex-shrink-0">
          {previewUrl ? (
            <img src={previewUrl} alt={design.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              {design.size}x{design.size}
            </div>
          )}
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 rounded-lg text-xs text-white">
            {design.size}x{design.size}
          </div>
        </div>

        <div className="flex-1 p-4 flex flex-col">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-white font-medium text-lg">{design.title}</h3>
                <p className="text-gray-400 text-sm">by {design.author} · {design.createdAt}</p>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1">
                <span className="text-gray-400 text-sm">{categories.find(c => c.id === design.category)?.icon}</span>
                <span className="text-white text-sm">{categories.find(c => c.id === design.category)?.label}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              {design.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onMouseEnter={() => !isRated && setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => onRate(design.id, star)}
                      className={`transition-colors ${isRated ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= (hoverRating || Math.round(design.rating))
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-500'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-gray-400 text-sm">{design.rating.toFixed(1)} ({design.ratingCount})</span>
              </div>

              <button
                onClick={() => onLike(design.id)}
                className={`flex items-center gap-1 transition-colors ${isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'}`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-400' : ''}`} />
                <span className="text-sm">{design.likes}</span>
              </button>

              <button
                onClick={onToggleComments}
                className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">{comments.length} 评论</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => onUse(design)}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              使用此图纸
            </button>
          </div>
        </div>
      </div>

      {comments.length > 0 && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-4">
          <h4 className="text-white text-sm font-medium">评论</h4>
          <div className="space-y-2">
            {comments.map(comment => (
              <div key={comment.id} className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-sm font-medium">{comment.author}</span>
                  <span className="text-gray-500 text-xs">{comment.createdAt}</span>
                </div>
                <p className="text-gray-300 text-sm">{comment.content}</p>
              </div>
            ))}
          </div>
          {currentUser && (
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                placeholder="写下你的评论..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="flex-1 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={onAddComment}
                className="px-4 py-2 bg-purple-500 text-white rounded-xl text-sm hover:bg-purple-600 transition-colors"
              >
                发送
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface LoginModalProps {
  onClose: () => void;
  onLogin: (username: string) => void;
}

const LoginModal = ({ onClose, onLogin }: LoginModalProps) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-gray-100 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">登录分享社区</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-600 text-sm mb-2">用户名</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="输入用户名"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300"
            />
          </div>

          <div className="bg-emerald-50 rounded-xl p-4">
            <p className="text-gray-600 text-sm">
              <span className="text-emerald-600">💡 提示：</span>
              这是一个本地演示，无需真实账号。输入任意用户名即可登录。
            </p>
          </div>

          <button
            type="submit"
            disabled={!username.trim()}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            登录
          </button>
        </form>
      </div>
    </div>
  );
};

interface UploadModalProps {
  form: { title: string; category: string; tags: string };
  setForm: React.Dispatch<React.SetStateAction<{ title: string; category: string; tags: string }>>;
  onClose: () => void;
  onUpload: (pattern: PatternPixel[][], counts: ColorCount[]) => void;
  currentPattern: PatternPixel[][] | null;
  currentColorCounts: ColorCount[];
}

const UploadModal = ({ form, setForm, onClose, onUpload, currentPattern, currentColorCounts }: UploadModalProps) => {
  const handleSubmit = () => {
    if (currentPattern) {
      const counts = currentColorCounts.length > 0 ? currentColorCounts : [];
      onUpload(currentPattern, counts);
    }
  };

  const canUpload = currentPattern && currentPattern.length > 0;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-gray-100 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">上传作品</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-600 text-sm mb-2">作品标题</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="给你的作品起个名字"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300"
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-2">分类</label>
            <select
              value={form.category}
              onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300"
            >
              {categories.filter(c => c.id !== 'all').map(cat => (
                <option key={cat.id} value={cat.id} className="bg-white">
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-2">标签</label>
            <input
              type="text"
              value={form.tags}
              onChange={e => setForm(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="用逗号分隔标签，如：可爱,彩色,简单"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300"
            />
          </div>

          <div className="bg-emerald-50 rounded-xl p-4">
            <p className="text-gray-600 text-sm">
              <span className="text-emerald-600">📌 提示：</span>
              {canUpload ? '图纸已准备好，可以上传到社区！' : '请先在"上传图片"中生成图纸，然后返回这里上传。'}
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canUpload}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {canUpload ? '确认上传' : '请先生成图纸'}
          </button>
        </div>
      </div>
    </div>
  );
};