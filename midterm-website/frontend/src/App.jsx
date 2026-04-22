import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'https://webattack-backend.onrender.com/api/v1';

// --- Navbar 導覽列 ---
const Navbar = ({ token, onLogout }) => (
  <nav style={{ background: '#1a1a1b', padding: '15px 30px', display: 'flex', gap: '25px', alignItems: 'center', borderBottom: '2px solid #343536' }}>
    <Link to="/" style={{ color: '#ffffff', textDecoration: 'none', fontWeight: 'bold', fontSize: '20px' }}>SecureSite</Link>
    <div style={{ flex: 1, display: 'flex', gap: '20px' }}>
      <Link to="/" style={{ color: '#d7dadc', textDecoration: 'none' }}>Home</Link>
      <Link to="/about" style={{ color: '#d7dadc', textDecoration: 'none' }}>About</Link>
      <Link to="/forum" style={{ color: '#d7dadc', textDecoration: 'none' }}>Forum</Link>
      {token && <Link to="/divination" style={{ color: '#ffd700', textDecoration: 'none' }}>✨ AI Divination</Link>}
      {token && <Link to="/profile" style={{ color: '#d7dadc', textDecoration: 'none' }}>Profile</Link>}
    </div>
    {token ? (
      <button onClick={onLogout} style={{ background: '#343536', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
    ) : (
      <Link to="/auth" style={{ color: 'white', background: '#0079d3', padding: '8px 15px', borderRadius: '4px', textDecoration: 'none' }}>Login</Link>
    )}
  </nav>
);

// --- 分頁組件 (修復標題顏色與結構) ---
const Home = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1 style={{ color: '#ffffff', fontSize: '48px', marginBottom: '20px' }}>Welcome to SecureSite</h1>
    <p style={{ fontSize: '18px', color: '#d7dadc' }}>這是你的期中專案測試站點。嘗試探索漏洞或參與討論！</p>
  </div>
);

const About = () => (
  <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
    <h2 style={{ color: '#ffffff', marginBottom: '20px' }}>關於本站</h2>
    <p>本網站用於網頁安全課程演示，包含基本的論壇功能與 AI 占卜測試。</p>
    <p style={{ marginTop: '20px', color: '#818384' }}>技術棧: React + Express + Prisma + Supabase</p>
  </div>
);

const Forum = () => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await axios.post(`${API_BASE}/comments`, { content: newComment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewComment('');
      fetchComments();
    } catch (err) {
      setMessage('發文失敗，請檢查權限');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ color: '#ffffff', marginBottom: '20px', fontSize: '28px' }}>Forum 交流區</h2>
      
      {token ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
          <input 
            value={newComment} 
            onChange={e => setNewComment(e.target.value)}
            placeholder="說點什麼吧..."
            style={{ flex: 1, padding: '12px', background: '#1a1a1b', color: 'white', border: '1px solid #343536', borderRadius: '4px' }}
          />
          <button type="submit" style={{ padding: '10px 20px', background: '#d7dadc', color: '#1a1a1b', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>發佈</button>
        </form>
      ) : (
        <div style={{ textAlign: 'center', padding: '30px', background: '#1a1a1b', borderRadius: '4px', marginBottom: '20px', border: '1px solid #343536' }}>
          <p style={{ color: '#d7dadc' }}>請先登入後再參與討論</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {comments.map(c => (
          <div key={c.id} style={{ background: '#1a1a1b', padding: '15px', borderRadius: '4px', border: '1px solid #343536' }}>
            <div style={{ color: '#818384', fontSize: '12px', marginBottom: '8px' }}>使用者 ID: {c.authorId}</div>
            <div style={{ color: '#d7dadc' }}>{c.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 其他頁面保持簡約 ---
const Profile = () => <div style={{ padding: '40px', textAlign: 'center' }}><h2 style={{ color: '#ffffff' }}>個人檔案</h2><p>功能開發中...</p></div>;
const Divination = () => <div style={{ padding: '40px', textAlign: 'center' }}><h2 style={{ color: '#ffffff' }}>✨ AI 占卜</h2><p>請輸入你的問題...</p></div>;

// --- AuthPage ---
const AuthPage = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
    try {
      const res = await axios.post(`${API_BASE}${endpoint}`, { email, password });
      if (isLoginMode) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        navigate('/');
      } else {
        setMessage('註冊成功，請切換至登入');
        setIsLoginMode(true);
      }
    } catch (err) {
      setMessage(err.response?.data?.error || '認證失敗');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh' }}>
      <h2 style={{ color: 'white', marginBottom: '20px' }}>{isLoginMode ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={{ padding: '10px', width: '280px', background: '#1a1a1b', color: 'white', border: '1px solid #343536' }} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" style={{ padding: '10px', width: '280px', background: '#1a1a1b', color: 'white', border: '1px solid #343536' }} />
        <button type="submit" style={{ padding: '10px', background: '#0079d3', color: 'white', border: 'none', borderRadius: '4px' }}>Submit</button>
      </form>
      <p style={{ color: '#ff4500', marginTop: '10px' }}>{message}</p>
      <button onClick={() => setIsLoginMode(!isLoginMode)} style={{ background: 'none', border: 'none', color: '#4fbcff', textDecoration: 'underline', cursor: 'pointer', marginTop: '10px' }}>
        {isLoginMode ? "Need an account?" : "Have an account?"}
      </button>
    </div>
  );
};

// --- App 核心結構 ---
function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  // 強制設定 body 背景，解決 Safari/無痕模式白屏問題
  useEffect(() => {
    document.body.style.backgroundColor = '#030303';
    document.body.style.color = '#d7dadc';
    document.body.style.margin = '0';
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    window.location.href = '/'; 
  };

  return (
    <BrowserRouter>
      {/* 這裡的 background 和 minHeight 確保 React 渲染範圍也是黑的 */}
      <div style={{ background: '#030303', minHeight: '100vh', width: '100%' }}>
        <Navbar token={token} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/divination" element={<Divination />} />
          <Route path="/auth" element={<AuthPage setToken={setToken} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;