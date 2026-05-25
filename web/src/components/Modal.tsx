import { AlertTriangle, Check, Info, X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "confirm";
  onConfirm?: () => void;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function Modal({
  isOpen,
  title,
  message,
  type,
  onConfirm,
  onClose,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
}: ModalProps) {
  if (!isOpen) return null;

  const renderIcon = () => {
    switch (type) {
      case "success":
        return (
          <div className="modal-icon-wrapper success">
            <Check size={28} />
          </div>
        );
      case "error":
        return (
          <div className="modal-icon-wrapper error">
            <X size={28} />
          </div>
        );
      case "warning":
      case "confirm":
        return (
          <div className="modal-icon-wrapper warning">
            <AlertTriangle size={28} />
          </div>
        );
      default:
        return (
          <div className="modal-icon-wrapper info">
            <Info size={28} />
          </div>
        );
    }
  };

  const handleConfirmClick = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {renderIcon()}

        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>

        <div className="modal-actions">
          {type === "confirm" ? (
            <>
              <button
                className="btn btn-secondary"
                onClick={onClose}
                style={{ width: "auto", flex: 1 }}
              >
                {cancelText}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmClick}
                style={{ width: "auto", flex: 1 }}
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary"
              onClick={onClose}
              style={{ width: "120px", margin: "0 auto" }}
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
