import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login.tsx"
import UserList from "./pages/UserList"
import CreateUser from "./pages/CreateUser.tsx"
import EditUser from "./pages/EditUser"
import Profile from "./pages/Profile"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* si no hay usuario logueado, mando al login */}
        <Route path="/" element={<UserList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create" element={<CreateUser />} />
        <Route path="/edit/:id" element={<EditUser />} />
        <Route path="/profile" element={<Profile />} />
        {/* cualquier ruta desconocida va al inicio */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App