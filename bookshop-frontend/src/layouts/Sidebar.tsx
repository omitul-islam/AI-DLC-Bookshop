import { NavLink } from 'react-router-dom';
import { HomeIcon, BookOpenIcon, UserGroupIcon, ShoppingCartIcon, TagIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

const navItems = [
  { to: '/', label: 'Dashboard', icon: HomeIcon },
  { to: '/books', label: 'Books', icon: BookOpenIcon },
  { to: '/customers', label: 'Customers', icon: UserGroupIcon },
  { to: '/categories', label: 'Categories', icon: TagIcon },
  { to: '/orders', label: 'Orders', icon: ShoppingCartIcon },
  { to: '/audit-log', label: 'Audit Log', icon: ClipboardDocumentCheckIcon },
];

export function Sidebar() {
  return (
    <aside className="w-[250px] bg-gray-900 text-white flex flex-col min-h-screen fixed left-0 top-0 bottom-0 z-40 overflow-y-auto">
      <div className="px-6 pb-6 pt-6 border-b border-gray-800">
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold transition-transform group-hover:scale-105 shadow-lg shadow-indigo-500/25">
            B
          </div>
          <span className="text-base font-semibold tracking-tight">Bookshop</span>
        </NavLink>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gray-800/50 text-white border-l-[3px] border-indigo-400 rounded-l-none'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white border-l-[3px] border-transparent'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto px-4 pt-4 pb-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
            A
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-200 truncate">Admin</p>
            <p className="text-xs text-gray-500 truncate">admin@bookshop.io</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
