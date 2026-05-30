import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("token")
    const userRaw = params.get("user")
    const error = params.get("error")

    if (error || !token || !userRaw) {
      navigate("/login?error=google_failed")
      return
    }

    try {
      const user = JSON.parse(decodeURIComponent(userRaw))
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))
      navigate("/feed")
    } catch {
      navigate("/login?error=google_failed")
    }
  }, [])

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <p>Iniciando sesión con Google...</p>
    </div>
  )
}

export default AuthCallback