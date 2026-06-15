import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiFetch } from "../api"

interface LayoutProps {
  children: React.ReactNode
  showLogout?: boolean
}

// mismas categorias que en CreatePost, para que el buscador ofrezca las mismas opciones
const categories = [
  "Abrigos",
  "Pantalones",
  "Remeras",
  "Vestidos",
  "Faldas",
  "Zapatos",
  "Accesorios",
  "Bolsos",
  "Ropa interior",
  "Deportivo",
  "Top",
  "Otro",
]

function Layout({ children, showLogout = true }: LayoutProps) {
  const navigate = useNavigate()

  // tipo de busqueda seleccionado (titulo, tag o categoria)
  const [searchType, setSearchType] = useState("search")
  // valor del campo de busqueda (texto libre o categoria elegida)
  const [searchValue, setSearchValue] = useState("")

  async function handleLogout() {
    await apiFetch("/auth/logout", { method: "POST" })
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    navigate("/login")
  }

  // cuando cambia el tipo de busqueda, reseteo el valor para no mezclar texto con categoria
  function handleSearchTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSearchType(e.target.value)
    setSearchValue("")
  }

  // busqueda por texto libre (titulo o tag), se dispara con Enter
  function handleTextSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && searchValue.trim() !== "") {
      window.location.href = `/feed?${searchType}=${encodeURIComponent(searchValue)}`
    }
  }

  // busqueda por categoria, se dispara apenas se elige una opcion del dropdown
  function handleCategorySearch(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value
    setSearchValue(value)
    if (value) {
      window.location.href = `/feed?category=${encodeURIComponent(value)}`
    }
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
              value={searchType}
              onChange={handleSearchTypeChange}
              style={{ borderRadius: "20px", padding: "6px 12px", fontSize: "13px", border: "none", outline: "none" }}
            >
              <option value="search">Título</option>
              <option value="tag">Tag</option>
              <option value="category">Categoría</option>
            </select>

            {/* si el tipo es categoria, muestro un dropdown con las mismas opciones que al crear un post */}
            {searchType === "category" ? (
              <select
                value={searchValue}
                onChange={handleCategorySearch}
                style={{ borderRadius: "20px", padding: "6px 16px", fontSize: "13px", border: "none", outline: "none", width: "280px" }}
              >
                <option value="">Seleccioná una categoría</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Buscar publicaciones..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleTextSearch}
                style={{ borderRadius: "20px", padding: "6px 16px", fontSize: "13px", border: "none", outline: "none", width: "280px" }}
              />
            )}
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