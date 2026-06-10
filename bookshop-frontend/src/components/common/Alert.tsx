import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  variant: AlertVariant;
  title: string;
  message?: string;
  onClose?: () => void;
}

const config: Record<AlertVariant, {
  bg: string; text: string; icon: typeof CheckCircleIcon;
}> = {
  success: { bg: 'bg-green-50 border-green-200', text: 'text-green-800', icon: CheckCircleIcon },
  error: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', icon: XCircleIcon },
  warning: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', icon: ExclamationTriangleIcon },
  info: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', icon: InformationCircleIcon },
};

export function Alert({ variant, title, message, onClose }: AlertProps) {
  const c = config[variant];
  const Icon = c.icon;

  return (
    <div className={`flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg border ${c.bg} ${c.text}`}>
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        {message && <p className="text-sm opacity-80 mt-0.5">{message}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className="p-0.5 rounded hover:bg-white/30 transition-colors flex-shrink-0" aria-label="Dismiss">
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
