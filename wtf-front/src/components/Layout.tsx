import { useNavigate } from "react-router-dom"
import { apiFetch } from "../api"


// defino los props que recibe el componente
interface LayoutProps {
  children: React.ReactNode // contenido de la pagina
  showLogout?: boolean // si mostrar o no el boton de cerrar sesion
}

// layout es un componente que envuelve todas las paginas
// contiene el navbar, el contenido y el footer
function Layout({ children, showLogout = true }: LayoutProps) {
  const navigate = useNavigate()

  // cierro la sesion y mando al login
  async function handleLogout() {
    await apiFetch("/auth/logout", { method: "POST" }) // CAMBIO: uso apiFetch en vez de fetch directo
    localStorage.removeItem("user")
    localStorage.removeItem("token") // CAMBIO: borro el token tambien
    navigate("/login")
  }

  return (
    <div id="root">
      {/* navbar con logo y links */}
      <nav className="navbar">
        <a href="/" className="navbar-logo">
          📍 <span>WhereTheFit</span>
        </a>
        <div className="navbar-links">
          <a href="/feed">Feed</a>
          <a href="/feed/create">Publicar</a>
          <a href="/profile">Perfil</a>
          {/* solo muestro el boton si showLogout es true */}
          {showLogout && (
            <button onClick={handleLogout} className="btn btn-small">
              Cerrar sesión
            </button>
          )}
        </div>
      </nav>

      {/* contenido de la pagina */}
      <div className="page-content">
        {children}
      </div>

      {/* footer */}
      <footer className="footer">
        © 2026 WhereTheFit. Todos los derechos reservados.
      </footer>
    </div>
  )
}

export default Layout