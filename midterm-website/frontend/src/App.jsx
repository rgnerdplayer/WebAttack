import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'https://webattack-backend.onrender.com/api/v1';

// --- Navbar (文字與權限鎖死) ---
const Navbar = ({ token, onLogout }) => (
  <nav style={{ background: '#1a1a1b', padding: '15px 30px', display: 'flex', gap: '25px', alignItems: 'center', borderBottom: '2px solid #343536' }}>
    <Link to="/" style={{ color: '#d7dadc', textDecoration: 'none', fontWeight: 'bold', fontSize: '20px' }}>SecureSite</Link>
    <div style={{ flex: 1, display: 'flex', gap: '20px' }}>
      <Link to="/" style={{ color: '#d7dadc', textDecoration: 'none' }}>Home</Link>
      <Link to="/about" style={{ color: '#d7dadc', textDecoration: 'none' }}>About</Link>
      <Link to="/forum" style={{ color: '#d7dadc', textDecoration: 'none' }}>Forum</Link>
      {token && <Link to="/divination" style={{ color: '#ffd700', textDecoration: 'none' }}>✨ AI Divination</Link>}
      {token && <Link to="/profile" style={{ color: '#d7dadc', textDecoration: 'none' }}>Upload Avatar</Link>}
    </div>
    <div>
      {token ? (
        <button onClick={onLogout} style={{ background: '#343536', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
      ) : (
        <Link to="/auth" style={{ color: '#d7dadc', textDecoration: 'none', background: '#0079d3', padding: '8px 15px', borderRadius: '4px' }}>Login/Signup</Link>
      )}
    </div>
  </nav>
);

// --- Home (保留：曾憲揚、好難。) ---
const Home = () => (
  <div style={{ textAlign: 'center', padding: '50px', background: '#030303', minHeight: '80vh', color: 'white' }}>
    <img src="/my-photo.jpg" alt="Owner" style={{ width: '180px', height: '180px', borderRadius: '15px', objectFit: 'cover', border: '4px solid #343536', marginBottom: '20px' }} />
    <h1 style={{ fontSize: '36px', marginBottom: '10px', color: '#ffffff' }}>曾憲揚 (Tseng Sian-Yang)</h1>
    <p style={{ maxWidth: '700px', margin: '0 auto', fontSize: '18px', lineHeight: '1.8', color: '#ccc' }}>好難。</p>
  </div>
);

// --- About (保留所有個人經歷) ---
const About = () => (
  <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', lineHeight: '1.8', color: '#d7dadc' }}>
    <h2 style={{ borderBottom: '1px solid #343536', paddingBottom: '10px', color: '#ffffff' }}>About Me</h2>
    <p>&emsp;I am born in USA but moved to Taiwan at 1 year old. I currently study at NTU GICE, and I am about to graduate this semester.</p>
    <p>&emsp;I used to be very interesed in physics, or science in general. During college, I gradually gave up or hated a lot of subjects. Now I am into piano and language learning. One of my dreams is to study at music schools abroad. Languages I have studied:</p>
    <ul><li>Japanese</li><li>Spanish</li><li>German</li><li>Russian</li><li>French</li></ul>
    <p>&emsp;As for extracurricular activities, I do a lot of competitive programming. Although I am too old to attend ICPC events, there is another event called Universal Cup (ucup) that is open to everyone, which makes it more competitive than ICPC! I am going to Shanghai in May for the season 3 finals.</p>
    <p>&emsp;I also practice a bit of card magic though recently inactive.</p>
    <p>&emsp;My future goal is to apply for music masters abroad next year. If I don't succeed, I will probably just go to Google and reconsider everything. If I were to pursue a normal life and be an engineer, I want to learn more software and system stuff.</p>
  </div>
);

// --- Forum (完整內容) ---
const Forum = () => {
  const [comments, setComments] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const token = localStorage.getItem('token');
  const fetchComments = () => { axios.get(`${API_BASE}/comments`).then(res => setComments(res.data)).catch(err => console.error(err)); };
  useEffect(() => { fetchComments(); }, []);
  const postComment = async () => {
    if (!token) return alert('Please login to post!');
    try {
      await axios.post(`${API_BASE}/comments`, { content: newMsg }, { headers: { Authorization: `Bearer ${token}` } });
      setNewMsg(''); fetchComments();
    } catch (err) { alert("發文失敗"); }
  };
  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', color: '#d7dadc' }}>
      <h2 style={{ marginBottom: '20px', color: '#ffffff' }}>Forum 交流區</h2>
      {token && (
        <div style={{ background: '#1a1a1b', padding: '20px', borderRadius: '4px', marginBottom: '30px', border: '1px solid #343536' }}>
          <textarea value={newMsg} onChange={e => setNewMsg(e.target.value)} style={{ width: '100%', height: '100px', background: '#272729', color: 'white', border: '1px solid #343536', padding: '10px' }} />
          <button onClick={postComment} style={{ background: '#d7dadc', color: '#1a1a1b', border: 'none', padding: '10px 25px', marginTop: '10px', fontWeight: 'bold', cursor: 'pointer' }}>發送留言</button>
        </div>
      )}
      {comments.map(c => (
        <div key={c.id} style={{ background: '#1a1a1b', border: '1px solid #343536', borderRadius: '4px', display: 'flex', marginBottom: '15px' }}>
          <div style={{ width: '140px', padding: '20px', borderRight: '1px solid #343536', textAlign: 'center' }}>
            <img src={c.author.avatar || 'https://via.placeholder.com/80'} style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
            <div style={{ color: '#4fbcff', marginTop: '10px' }}>{c.author.username}</div>
          </div>
          <div style={{ flex: 1, padding: '20px' }}>{c.content}</div>
        </div>
      ))}
    </div>
  );
};

// --- Profile (還原你的 Avatar 上傳邏輯) ---
const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [file, setFile] = useState(null);
  const token = localStorage.getItem('token');
  const fetchMyData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/me`, { headers: { Authorization: `Bearer ${token}` } });
      setUserInfo(res.data);
    } catch (err) { console.error("Failed"); }
  };
  useEffect(() => { if (token) fetchMyData(); }, [token]);
  const handleUpload = async () => {
    if (!file) return alert('Select a file!');
    const formData = new FormData(); formData.append('avatar', file);
    try {
      await axios.post(`${API_BASE}/upload-avatar`, formData, { headers: { Authorization: `Bearer ${token}` } });
      alert('Avatar Updated!'); fetchMyData();
    } catch (err) { alert('Upload failed'); }
  };
  return (
    <div style={{ padding: '60px 20px', maxWidth: '500px', margin: '0 auto', color: 'white' }}>
      <div style={{ background: '#1a1a1b', padding: '30px', borderRadius: '8px', border: '1px solid #343536', textAlign: 'center' }}>
        <h2 style={{ color: '#ffffff', marginBottom: '20px' }}>User Profile</h2>
        <img src={userInfo?.avatar || 'https://via.placeholder.com/120'} style={{ width: '120px', height: '120px', borderRadius: '50%', border: '3px solid #0079d3', marginBottom: '20px' }} />
        <h3 style={{ color: '#4fbcff' }}>{userInfo?.username}</h3>
        <input type="file" onChange={e => setFile(e.target.files[0])} style={{ marginTop: '20px', display: 'block', width: '100%' }} />
        <button onClick={handleUpload} style={{ marginTop: '20px', background: '#0079d3', color: 'white', padding: '10px 20px', border: 'none', cursor: 'pointer', width: '100%' }}>Update Avatar</button>
      </div>
    </div>
  );
};

// --- Divination (還原你的 Gemini 占卜邏輯) ---
const Divination = () => {
  const [apiKey, setApiKey] = useState('');
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');
  const handleDivination = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/divination`, { apiKey, question }, { headers: { Authorization: `Bearer ${token}` } });
      setResult(res.data.result);
    } catch (error) { setResult("發生錯誤"); } finally { setLoading(false); }
  };
  return (
    <div style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto', color: '#d7dadc' }}>
      <div style={{ background: '#1a1a1b', padding: '30px', borderRadius: '8px', border: '1px solid #343536' }}>
        <h2 style={{ color: '#ffd700', textAlign: 'center' }}>✨ 神秘塔羅占卜</h2>
        <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Gemini API Key" style={{ width: '100%', padding: '10px', background: '#272729', color: 'white', marginTop: '20px' }} />
        <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="你想占卜什麼？" style={{ width: '100%', height: '100px', background: '#272729', color: 'white', marginTop: '10px', padding: '10px' }} />
        <button onClick={handleDivination} style={{ width: '100%', padding: '15px', background: '#8a2be2', color: 'white', marginTop: '10px', cursor: 'pointer' }}>
          {loading ? "🔮 解讀中..." : "🔮 開始占卜"}
        </button>
        {result && <div style={{ marginTop: '20px', whiteSpace: 'pre-wrap' }}>{result}</div>}
      </div>
    </div>
  );
};

// --- AuthPage (還原回 username 登入) ---
const AuthPage = ({ setToken }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/login' : '/signup';
      const res = await axios.post(`${API_BASE}${endpoint}`, { username, password });
      if (isLogin) { localStorage.setItem('token', res.data.token); setToken(res.data.token); navigate('/'); }
      else { setIsLogin(true); alert('Signup success!'); }
    } catch (err) { alert('Auth Failed'); }
  };
  return (
    <div style={{ padding: '80px', textAlign: 'center' }}>
      <h1 style={{ color: 'white' }}>{isLogin ? 'Login' : 'Signup'}</h1>
      <form onSubmit={handleSubmit} style={{ display: 'inline-flex', flexDirection: 'column', gap: '15px' }}>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" style={{ padding: '10px', width: '280px', background: '#1a1a1b', color: 'white' }} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" style={{ padding: '10px', width: '280px', background: '#1a1a1b', color: 'white' }} />
        <button type="submit" style={{ padding: '10px', background: '#0079d3', color: 'white', cursor: 'pointer' }}>Submit</button>
      </form>
      <p style={{ color: '#4fbcff', cursor: 'pointer', marginTop: '20px' }} onClick={() => setIsLogin(!isLogin)}>{isLogin ? "Need an account?" : "Login"}</p>
    </div>
  );
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  useEffect(() => {
    document.body.style.backgroundColor = '#030303';
    document.body.style.color = '#d7dadc';
    document.body.style.margin = '0';
  }, []);
  const handleLogout = () => { localStorage.removeItem('token'); setToken(null); window.location.href = '/'; };
  return (
    <BrowserRouter>
      <div style={{ background: '#030303', minHeight: '100vh' }}>
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