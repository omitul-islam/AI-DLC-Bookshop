import { ClockIcon, TruckIcon, CheckIcon } from '@heroicons/react/24/outline';
import type { OrderStatus } from '../../types';

const config: Record<OrderStatus, {
  bg: string; text: string; ring: string; label: string; icon: typeof ClockIcon;
}> = {
  pending: {
    bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20',
    label: 'Pending', icon: ClockIcon,
  },
  shipped: {
    bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-600/20',
    label: 'Shipped', icon: TruckIcon,
  },
  delivered: {
    bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20',
    label: 'Delivered', icon: CheckIcon,
  },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const c = config[status];
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${c.bg} ${c.text} ${c.ring}`}>
      <Icon className="w-3 h-3" aria-hidden="true" />
      {c.label}
    </span>
  );
}
