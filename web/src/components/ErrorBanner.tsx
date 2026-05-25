import { AlertTriangle } from 'lucide-react'

interface ErrorBannerProps {
  message: string
  onClose: () => void
}

export default function ErrorBanner({ message, onClose }: ErrorBannerProps) {
  return (
    <div className="error-banner">
      <span>
        <AlertTriangle size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> 
        {message}
      </span>
      <button className="error-banner-btn" onClick={onClose}>
        Fechar
      </button>
    </div>
  )
}
