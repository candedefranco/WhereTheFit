// componente reutilizable para confirmar acciones destructivas
interface ConfirmModalProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmModal({ message, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "32px",
        maxWidth: "380px",
        width: "90%",
        boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
      }}>
        <p style={{ fontSize: "16px", marginBottom: "24px", color: "#333" }}>{message}</p>
        <div className="btn-row">
          <button onClick={onConfirm} className="btn btn-danger">Borrar</button>
          <button onClick={onCancel} className="btn btn-secondary">Cancelar</button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal