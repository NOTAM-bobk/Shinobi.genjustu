import { useState, useEffect, useMemo } from 'react';
import { 
  Terminal, Search, RefreshCw, LayoutGrid, Code2, Image as ImageIcon, 
  Activity, Heart, MessageSquare, ExternalLink, Play, ChevronDown, 
  ChevronUp, Maximize2, User, Info, Menu, X, Download, Copy, Check
} from 'lucide-react';

// --- TYPES ---
type Profile = {
  username?: string;
  display_name?: string;
  avatar_url?: string;
};

type Post = {
  id: string;
  content?: string;
  code?: string;
  code_language?: string;
  media_url?: string;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
  profile?: Profile;
};

const API_URL = 'https://genjutsu-social.vercel.app/api/genjutsu-feed';
const SOURCE_URL = 'https://genjutsu-social.vercel.app';

// --- SUB-COMPONENTS ---

const CodeBlock = ({ code, language }: { code: string; language: string }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [previewActive, setPreviewActive] = useState(false);
  const [copied, setCopied] = useState(false);

  const isPreviewable = ['html', 'css', 'javascript', 'js'].includes(language?.toLowerCase());

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSrcDoc = () => {
    const lang = language?.toLowerCase();
    if (!lang || lang === 'html') return code;
    if (lang === 'css') {
      return `<html><head><style>${code}</style></head><body style="font-family:sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; margin:0; background:#f9f9f9;"><div style="padding:2rem; background:white; border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.1);">Styling Preview</div></body></html>`;
    }
    if (lang === 'javascript' || lang === 'js') {
      return `<html><body style="font-family:monospace; background:#111; color:#0f0; padding:1rem; margin:0;"><h3 style="color:#fff; margin-top:0;">Terminal JS Output</h3><pre id="out"></pre><script>
        const console = { log: (...args) => { 
          document.getElementById('out').innerText += args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ') + '\\n'; 
        }};
        try { ${code} } catch(e) { console.log("Error: " + e.message); }
      </script></body></html>`;
    }
    return code;
  };

  const openNewWindow = () => {
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(getSrcDoc());
      win.document.close();
    }
  };

  return (
    <div className="my-4 border border-black shadow-[2px_2px_0px_0px_#000] rounded-md overflow-hidden flex flex-col bg-[#1a1a1a]">
      <div className="bg-[#2a2a2a] px-3 py-1.5 flex justify-between items-center border-b border-[#444]">
        <span className="text-gray-400 font-mono text-xs uppercase font-bold tracking-wider">{language || 'txt'}</span>
        <button 
          onClick={handleCopy}
          className="text-gray-400 hover:text-white transition-colors p-1"
          title="Copy Code"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
        </button>
      </div>
      
      <div className={`relative ${collapsed ? 'max-h-[200px]' : ''} overflow-hidden`}>
        <pre className="p-4 text-green-400 font-mono text-sm overflow-x-auto m-0">
          <code>{code}</code>
        </pre>
        {collapsed && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#1a1a1a] to-transparent pointer-events-none" />
        )}
      </div>

      <div className="flex flex-wrap gap-2 p-2 bg-[#222] border-t border-[#333]">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-white bg-[#333] hover:bg-[#444] border border-[#555] rounded-sm transition-colors"
        >
          {collapsed ? <><ChevronDown size={14} /> View All</> : <><ChevronUp size={14} /> Collapse</>}
        </button>
        
        {isPreviewable && (
          <button 
            onClick={() => setPreviewActive(!previewActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border rounded-sm transition-colors ${previewActive ? 'bg-white text-black border-white' : 'bg-[#333] text-white hover:bg-[#444] border-[#555]'}`}
          >
            <Play size={14} /> {previewActive ? 'Stop Preview' : 'Live Preview'}
          </button>
        )}
      </div>

      {previewActive && (
        <div className="bg-white border-t border-black h-[350px] flex flex-col">
          <div className="bg-gray-100 border-b border-gray-300 p-1.5 flex justify-end">
            <button onClick={openNewWindow} className="flex items-center gap-1 text-xs font-mono text-gray-600 hover:text-black px-2 py-1">
              <Maximize2 size={12} /> Pop-out
            </button>
          </div>
          <iframe 
            srcDoc={getSrcDoc()} 
            className="flex-1 w-full border-none bg-white" 
            title="Code Preview"
            sandbox="allow-scripts"
          />
        </div>
      )}
    </div>
  );
};

const PostCard = ({ post }: { post: Post }) => {
  const name = post.profile?.display_name || post.profile?.username || 'ANON';
  const handle = post.profile?.username || 'ghost';
  const avatarUrl = post.profile?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${handle}`;
  const [mediaExpanded, setMediaExpanded] = useState(false);

  const handleDownload = () => {
    let content = `AUTHOR: ${name} (@${handle})\nDATE: ${new Date(post.created_at).toLocaleString()}\n\n`;
    if (post.content) content += `--- CONTENT ---\n${post.content}\n\n`;
    if (post.code) content += `--- CODE (${post.code_language || 'txt'}) ---\n${post.code}\n`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terminal-post-${post.id.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <article className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] p-4 sm:p-6 mb-6 rounded-lg transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000]">
      <div className="flex justify-between items-start mb-4 gap-3">
        <div className="flex gap-3 items-center min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 border border-black rounded-md bg-gray-200 shrink-0 overflow-hidden shadow-[2px_2px_0px_0px_#000]">
            <img src={avatarUrl} alt={handle} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${handle}`; }} />
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <div className="font-bold uppercase text-sm sm:text-[0.95rem] truncate text-black leading-tight">{name}</div>
            <div className="font-mono text-[10px] sm:text-xs text-gray-500">@{handle}</div>
          </div>
        </div>
        <div className="font-mono text-[9px] sm:text-[10px] text-gray-500 shrink-0 border border-gray-200 px-2 py-1 rounded-sm bg-gray-50">
          {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {post.content && (
        <div className="text-gray-800 text-sm sm:text-base mb-4 whitespace-pre-wrap break-words leading-relaxed">
          {post.content}
        </div>
      )}

      {post.code && <CodeBlock code={post.code} language={post.code_language || ''} />}

      {post.media_url && (
        <div 
          className={`relative my-4 border border-black shadow-[2px_2px_0px_0px_#000] rounded-md overflow-hidden bg-gray-100 cursor-pointer transition-all duration-300 ${mediaExpanded ? '' : 'max-h-[300px]'}`}
          onClick={() => setMediaExpanded(!mediaExpanded)}
        >
          <img src={post.media_url} alt="Attachment" className="w-full h-auto block" loading="lazy" />
          {!mediaExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-center pb-4">
              <span className="flex items-center gap-2 bg-black text-white px-3 py-1.5 text-xs font-mono rounded-sm border border-white/20 shadow-lg">
                <Maximize2 size={14} /> View Full Size
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-t border-gray-200 mt-5 pt-4 gap-4">
        <div className="flex gap-4 font-mono text-xs text-gray-600">
          <span className="flex items-center gap-1.5"><Heart size={14} /> {post.likes_count || 0}</span>
          <span className="flex items-center gap-1.5"><MessageSquare size={14} /> {post.comments_count || 0}</span>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={handleDownload}
            className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 font-mono text-xs px-3 py-1.5 bg-white border border-black shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 rounded-sm text-black transition-all"
            title="Download Post"
          >
            <Download size={12} /> <span className="sm:hidden">Save</span>
          </button>
          <a 
            href={`${SOURCE_URL}/post/${post.id}`} 
            target="_blank" 
            rel="noreferrer"
            className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 font-mono text-xs px-3 py-1.5 bg-black text-white border border-black shadow-[2px_2px_0px_0px_#ccc] hover:shadow-[3px_3px_0px_0px_#ccc] hover:-translate-y-0.5 rounded-sm transition-all"
          >
            <ExternalLink size={12} /> Source
          </a>
        </div>
      </div>
    </article>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'code' | 'media'>('all');
  const [search, setSearch] = useState('');
  
  // New UI states
  const [showInfo, setShowInfo] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, { cache: 'no-store' });
      const data = await res.json();
      if (data.ok) setPosts(data.posts);
    } catch (e) {
      console.error("Fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      const passType = filter === 'all' || (filter === 'code' && p.code) || (filter === 'media' && p.media_url);
      const searchStr = search.toLowerCase();
      const match = (p.content || '').toLowerCase().includes(searchStr) || 
                    (p.code || '').toLowerCase().includes(searchStr) || 
                    (p.profile?.username || '').toLowerCase().includes(searchStr);
      return passType && match;
    });
  }, [posts, filter, search]);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    let lines = 0, likes = 0;
    const userMap: Record<string, { count: number; likes: number }> = {};

    posts.forEach(p => {
      if (p.code) lines += p.code.split('\n').length;
      likes += (p.likes_count || 0);

      const handle = p.profile?.username || 'ghost';
      if (!userMap[handle]) userMap[handle] = { count: 0, likes: 0 };
      userMap[handle].count++;
      userMap[handle].likes += (p.likes_count || 0);
    });

    const topUsers = Object.entries(userMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);

    return {
      todayCount: posts.filter(p => new Date(p.created_at).toDateString() === today).length,
      totalLines: lines,
      totalLikes: likes,
      topUsers
    };
  }, [posts]);

  // Initial Loading Animation Screen
  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa]">
        <div className="w-20 h-20 bg-black animate-ping mb-8 shadow-[8px_8px_0px_#ccc]"></div>
        <div className="font-mono font-black uppercase tracking-widest text-black animate-pulse text-lg">
          Booting Terminal...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-black font-sans selection:bg-blue-200">
      
      {/* HEADER */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b-2 border-black z-40 h-16 sm:h-20 flex items-center justify-between px-3 sm:px-6 shadow-sm">
        
        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden p-2 -ml-2 mr-1 hover:bg-gray-100 rounded-md"
        >
          <Menu size={24} />
        </button>

        <div className="flex items-center gap-2 font-black uppercase text-base sm:text-xl tracking-tight shrink-0">
          <Terminal size={20} className="text-black sm:w-6 sm:h-6" />
          <span className="hidden sm:inline">Genjutsu_Dev</span>
        </div>

        <div className="flex-1 max-w-md mx-2 sm:mx-4 relative group">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" />
          <input 
            type="text" 
            placeholder="Search queries..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border-2 border-black/20 focus:border-black rounded-md py-1.5 sm:py-2 pl-9 pr-3 sm:pr-4 font-mono text-xs sm:text-sm outline-none transition-colors shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setShowInfo(true)}
            className="hidden sm:flex items-center justify-center p-2 rounded-full hover:bg-gray-200 transition-colors"
            title="API Info"
          >
            <Info size={20} />
          </button>
          <button 
            onClick={fetchFeed}
            className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-black text-white font-mono text-xs sm:text-sm font-bold uppercase rounded-md border border-black shadow-[2px_2px_0px_#ccc] hover:shadow-[4px_4px_0px_#ccc] hover:-translate-y-[2px] transition-all active:translate-y-0 active:shadow-none"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{loading ? 'Syncing...' : 'Sync'}</span>
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative w-4/5 max-w-[300px] h-full bg-[#fafafa] border-r-2 border-black shadow-[8px_0_0_rgba(0,0,0,0.1)] p-5 overflow-y-auto transform transition-transform animate-in slide-in-from-left">
            <div className="flex justify-between items-center mb-6">
              <span className="font-black uppercase text-lg">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-gray-200 rounded">
                <X size={24} />
              </button>
            </div>
            
            <button 
              onClick={() => { setShowInfo(true); setIsMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 mb-6 rounded-md font-mono text-sm border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000]"
            >
              <Info size={16} /> System Information
            </button>

            {/* Sidebar Content rendered inside Drawer for Mobile */}
            <SidebarContent 
              filter={filter} 
              setFilter={(f) => { setFilter(f); setIsMobileMenuOpen(false); }} 
              stats={stats} 
            />
          </div>
        </div>
      )}

      {/* MAIN GRID */}
      <main className="max-w-[1200px] mx-auto w-full p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 sm:gap-8 items-start">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:block space-y-6 lg:sticky lg:top-28">
          <SidebarContent filter={filter} setFilter={setFilter} stats={stats} />
        </aside>

        {/* FEED */}
        <section className="min-w-0 pb-20">
          {filteredPosts.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-black/20 rounded-lg p-8 sm:p-12 text-center flex flex-col items-center justify-center text-gray-500 font-mono">
              <Search size={40} className="text-gray-300 mb-4 sm:size-48" />
              <div className="text-base sm:text-lg text-black font-bold mb-2">[ 404_NO_RECORDS_FOUND ]</div>
              <p className="text-xs sm:text-sm">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredPosts.map(p => <PostCard key={p.id} post={p} />)}
            </div>
          )}
        </section>

      </main>

      {/* INFO MODAL */}
      {showInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border-2 border-black shadow-[8px_8px_0px_#000] p-6 sm:p-8 max-w-md w-full rounded-md relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowInfo(false)} 
              className="absolute top-4 right-4 text-gray-500 hover:text-black hover:bg-gray-100 p-1 rounded transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="font-black text-xl sm:text-2xl uppercase mb-6 flex items-center gap-2 border-b-2 border-black pb-2">
              <Info size={24} /> System Info
            </h2>
            <div className="space-y-5 font-mono text-sm">
              <p className="text-gray-700 leading-relaxed">
                Welcome to the Genjutsu Dev Terminal. This interface connects to the Genjutsu Social API to visualize developer updates.
              </p>
              
              <div className="bg-gray-50 p-4 border border-black rounded-sm shadow-inner">
                <div className="font-bold mb-2 text-black flex items-center gap-2">
                  <Activity size={16}/> API Source:
                </div>
                <a href="https://iamovi.github.io/genjutsu/api/" target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline break-all block">
                  https://iamovi.github.io/genjutsu/api/
                </a>
              </div>
              
              <div className="bg-gray-50 p-4 border border-black rounded-sm shadow-inner">
                <div className="font-bold mb-2 text-black flex items-center gap-2">
                  <Code2 size={16}/> Source Code:
                </div>
                <a href="https://github.com/NOTAM-bobk/Shinobi.genjustu/tree/main" target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline break-all block">
                  GitHub Repository (NOTAM-bobk)
                </a>
              </div>
            </div>
            <button 
              onClick={() => setShowInfo(false)}
              className="w-full mt-6 bg-black text-white font-bold uppercase py-3 border-2 border-black shadow-[4px_4px_0px_#ccc] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#ccc] transition-all"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Extracted Sidebar Content for reuse in Desktop and Mobile Drawer
function SidebarContent({ filter, setFilter, stats }: { filter: string, setFilter: (f: any) => void, stats: any }) {
  return (
    <>
      <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_#000] p-4 sm:p-5 mb-6">
        <h2 className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-gray-500 mb-4">
          <Activity size={16} /> Filter Stream
        </h2>
        <div className="flex flex-col gap-2">
          {[
            { id: 'all', label: 'Everything', icon: LayoutGrid },
            { id: 'code', label: 'Code Only', icon: Code2 },
            { id: 'media', label: 'Visuals', icon: ImageIcon },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-mono text-sm transition-all border-2 ${
                filter === f.id 
                  ? 'bg-[#E5F0FF] border-blue-600 text-blue-900 shadow-[2px_2px_0px_0px_#2563EB]' 
                  : 'bg-transparent border-transparent hover:bg-gray-100 text-gray-700 hover:border-black/10'
              }`}
            >
              <f.icon size={16} /> {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_#000] p-4 sm:p-5">
        <h2 className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-gray-500 mb-4">
          <Activity size={16} /> Global Analytics
        </h2>
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center font-mono text-xs">
            <span className="text-gray-600">Daily Posts</span>
            <span className="font-black text-black bg-gray-100 px-2 py-0.5 rounded border border-gray-300">{stats.todayCount}</span>
          </div>
          <div className="flex justify-between items-center font-mono text-xs">
            <span className="text-gray-600">Source Lines</span>
            <span className="font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{stats.totalLines}</span>
          </div>
          <div className="flex justify-between items-center font-mono text-xs">
            <span className="text-gray-600">Engagement</span>
            <span className="font-black text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">{stats.totalLikes}</span>
          </div>
        </div>

        <div className="pt-4 border-t-2 border-dashed border-gray-200">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Top Contributors</div>
          <div className="space-y-2">
            {stats.topUsers.map(([handle, data]: [string, any]) => (
              <div key={handle} className="flex justify-between items-center font-mono text-xs bg-gray-50 p-1.5 rounded border border-gray-100">
                <span className="flex items-center gap-1.5 text-gray-700 truncate mr-2">
                  <User size={12} className="text-gray-400 shrink-0"/> @{handle}
                </span>
                <span className="font-bold text-black shrink-0">{data.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
