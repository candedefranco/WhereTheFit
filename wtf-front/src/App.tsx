import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login.tsx"
import CreateUser from "./pages/CreateUser.tsx"
import EditUser from "./pages/EditUser"
import Profile from "./pages/Profile"
import CreatePost from "./pages/CreatePost"
import Feed from "./pages/Feed"
import EditPost from "./pages/EditPost"
import PostDetail from "./pages/PostDetail"
import UserProfile from "./pages/UserProfile"
import Search from "./pages/Search"
import AuthCallback from "./pages/AuthCallback"
import SetPassword from "./pages/SetPassword"
import Chat from "./pages/Chat"
import VerifyEmail from "./pages/VerifyEmail"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* si no hay usuario logueado, mando al login */}
        <Route path="/" element={<Navigate to={"/feed"} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create" element={<CreateUser />} />
        <Route path="/edit/:id" element={<EditUser />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/feed/create" element={<CreatePost />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/feed/edit/:id" element={<EditPost />} />
        <Route path="/feed/post/:id" element={<PostDetail />} />
        {/* cualquier ruta desconocida va al inicio */}
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/profile/:id" element={<UserProfile />} />
        <Route path="/search" element={<Search />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
