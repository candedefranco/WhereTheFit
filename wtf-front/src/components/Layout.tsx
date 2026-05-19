import { useNavigate } from "react-router-dom"
import { apiFetch } from "../api"

interface LayoutProps {
  children: React.ReactNode
  showLogout?: boolean
}

function Layout({ children, showLogout = true }: LayoutProps) {
  const navigate = useNavigate()

  async function handleLogout() {
    await apiFetch("/auth/logout", { method: "POST" })
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    navigate("/login")
  }

  return (
    <div id="root">
      <nav className="navbar">
      {/* logo a la izquierda */}
      <a href="/" className="navbar-logo">
        <img src="/logo-wtf.svg" alt="WhereTheFit logo" width={45} height={40} /> <span>WhereTheFit</span>
      </a>

      {/* buscador en el centro */}
      {localStorage.getItem("user") && (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <select
              id="search-type"
              style={{ borderRadius: "20px", padding: "6px 12px", fontSize: "13px", border: "none", outline: "none" }}
            >
              <option value="search">Título</option>
              <option value="tag">Tag</option>
              <option value="category">Categoría</option>
            </select>
            <input
              type="text"
              placeholder="Buscar publicaciones..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const type = (document.getElementById("search-type") as HTMLSelectElement).value
                  window.location.href = `/feed?${type}=${(e.target as HTMLInputElement).value}`
                }
              }}
              style={{ borderRadius: "20px", padding: "6px 16px", fontSize: "13px", border: "none", outline: "none", width: "280px" }}
            />
          </div>
        )}

      {/* links a la derecha */}
      <div className="navbar-links">
        {localStorage.getItem("user") && <a href="/feed">Feed</a>}
        {localStorage.getItem("user") && <a href="/feed/create">Publicar</a>}
        {localStorage.getItem("user") && <a href="/profile">Perfil</a>}
        {showLogout && localStorage.getItem("user") && (
          <button onClick={handleLogout} className="btn btn-small">
            Cerrar sesión
          </button>
        )}
      </div>
    </nav>

      <div className="page-content">
        {children}
      </div>

      <footer className="footer">
        © 2026 WhereTheFit. Todos los derechos reservados.
      </footer>
    </div>
  )
}

export default Layout