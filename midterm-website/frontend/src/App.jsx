import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import axios from 'axios'

// 1. 首頁組件 (20%)
const Home = () => (
  <div style={{ textAlign: 'center', marginTop: '50px' }}>
    <h1>Welcome</h1>
    <img src="https://vitejs.dev/logo.svg" alt="Vite logo" style={{ width: '200px' }} />
  </div>
)

// 2. 關於頁面組件 (20%)
const About = () => <h1 style={{ padding: '20px' }}>About</h1>

// 3. 使用者列表頁面 (30%)
const Users = () => {
  const [users, setUsers] = useState([])
  useEffect(() => {
    axios.get('/api/v1/users').then(res => setUsers(res.data))
  }, [])
  return (
    <div style={{ padding: '20px' }}>
      <h1>Users</h1>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  )
}

// 4. 新增使用者頁面 (30%)
const CreateUser = () => {
  const [name, setName] = useState('')
  const handleSubmit = async (e) => {
    e.preventDefault()
    await axios.post('/api/v1/users', { name })
    alert('User Created!')
    setName('')
  }
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Create an account</h1>
      <form onSubmit={handleSubmit}>
        <input 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Username" 
          style={{ padding: '10px', width: '300px', marginBottom: '10px' }}
        /><br/>
        <button type="submit" style={{ padding: '10px 50px', background: '#646cff', color: 'white', border: 'none', borderRadius: '5px' }}>
          Create
        </button>
      </form>
    </div>
  )
}

// 主程式：設定導覽列與路徑
function App() {
  return (
    <BrowserRouter>
      <nav style={{ background: '#242424', padding: '10px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
        <Link to="/about" style={{ color: 'white', textDecoration: 'none' }}>About</Link>
        <Link to="/users" style={{ color: 'white', textDecoration: 'none' }}>Users</Link>
        <Link to="/create-user" style={{ color: 'white', textDecoration: 'none' }}>Create User</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/users" element={<Users />} />
        <Route path="/create-user" element={<CreateUser />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App