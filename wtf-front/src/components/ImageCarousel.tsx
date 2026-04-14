import { useState } from "react"

interface ImageCarouselProps {
  images: { id: number; url: string; order: number }[]
  title: string
}

// carrusel de imagenes estilo instagram
function ImageCarousel({ images, title }: ImageCarouselProps) {
  // indice de la imagen actual
  const [currentIndex, setCurrentIndex] = useState(0)

  if (images.length === 0) return null

  // si hay una sola imagen, la muestro sin carrusel
  if (images.length === 1) {
    return (
      <img
        src={images[0].url}
        alt={title}
        style={{ width: "100%", borderRadius: "8px", objectFit: "contain", maxHeight: "500px", backgroundColor: "#f5f5f5" }}
      />
    )
  }

  return (
    <div style={{ position: "relative", marginBottom: "16px" }}>
      {/* imagen actual */}
      <img
        src={images[currentIndex].url}
        alt={title}
        style={{ width: "100%", borderRadius: "8px", objectFit: "contain", maxHeight: "500px", backgroundColor: "#f5f5f5", display: "block" }}
      />

      {/* flecha izquierda */}
      {currentIndex > 0 && (
        <button
          onClick={() => setCurrentIndex(currentIndex - 1)}
          style={{
            position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)",
            background: "rgba(0,0,0,0.4)", color: "white", border: "none", borderRadius: "50%",
            width: "32px", height: "32px", cursor: "pointer", fontSize: "16px"
          }}
        >
          ‹
        </button>
      )}

      {/* flecha derecha */}
      {currentIndex < images.length - 1 && (
        <button
          onClick={() => setCurrentIndex(currentIndex + 1)}
          style={{
            position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)",
            background: "rgba(0,0,0,0.4)", color: "white", border: "none", borderRadius: "50%",
            width: "32px", height: "32px", cursor: "pointer", fontSize: "16px"
          }}
        >
          ›
        </button>
      )}

      {/* indicadores de posicion */}
      <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "8px" }}>
        {images.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentIndex(index)}
            style={{
              width: "8px", height: "8px", borderRadius: "50%", cursor: "pointer",
              backgroundColor: index === currentIndex ? "#6a9ea8" : "#ddd"
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default ImageCarousel