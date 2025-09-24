import React, { useState, useRef } from "react";
import "./AdminPinModal.css";

interface AdminPinModalProps {
  onConfirm: (pin: string) => void;
  onCancel: () => void;
  message?: string;
  error?: boolean;
  success?: boolean;
}

const AdminPinModal: React.FC<AdminPinModalProps> = ({
  onConfirm,
  onCancel,
  message,
  error,
  success,
}) => {
  const [pin, setPin] = useState("");
  const [localMessage, setLocalMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setLocalMessage("El PIN debe tener 4 dígitos.");
      return;
    }
    setLocalMessage("");
    onConfirm(pin);
  };

  const handleCancel = () => {
    setPin("");
    setLocalMessage("");
    onCancel();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="pin-container">
        <header>
          <h2>🔐 Acceso de Administrador</h2>
          <p className="subtext">Ingresa tu PIN de 4 dígitos para continuar</p>
        </header>
        <main>
          <form onSubmit={handleSubmit} autoComplete="off" noValidate>
            <input
              type="password"
              placeholder="••••"
              maxLength={4}
              autoComplete="off"
              spellCheck={false}
              required
              value={pin}
              onChange={(e) =>
                setPin(e.target.value.replace(/[^0-9]/g, ""))
              }
              ref={inputRef}
            />
            <div className="button-group">
              <button type="submit">Confirmar</button>
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancel}
              >
                Cancelar
              </button>
            </div>
          </form>
          <div
            className={`pin-message${error ? " error" : ""}${
              success ? " success" : ""
            }`}
          >
            {localMessage || message}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPinModal;
