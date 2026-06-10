interface BookHouseLogoProps {
  size?: number;
  className?: string;
}

export function BookHouseLogo({ size = 40, className = '' }: BookHouseLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="BookHouse"
    >
      <defs>
        <linearGradient id="badge-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>

      {/* Outer ring */}
      <circle cx="20" cy="20" r="19" stroke="url(#badge-bg)" strokeWidth="2" fill="white" />

      {/* Inner ring */}
      <circle cx="20" cy="20" r="16.5" stroke="url(#badge-bg)" strokeWidth="0.8" fill="none" />

      {/* "BOOK" text */}
      <text x="20" y="9" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="#4F46E5" fontFamily="Inter, system-ui, sans-serif" letterSpacing="1.5">BOOK</text>

      {/* Decorative dots */}
      <circle cx="10" cy="20" r="1" fill="#6366F1" opacity="0.6" />
      <circle cx="30" cy="20" r="1" fill="#A855F7" opacity="0.6" />

      {/* House roof line */}
      <polyline points="13,24 20,16 27,24" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* House walls */}
      <rect x="15" y="24" width="10" height="7" rx="0.8" stroke="#4F46E5" strokeWidth="1.2" fill="none" />

      {/* Book spine in center of house */}
      <line x1="20" y1="17" x2="20" y2="24" stroke="#818CF8" strokeWidth="1.2" strokeLinecap="round" />

      {/* Book pages (angled lines) */}
      <line x1="17" y1="18" x2="17" y2="24" stroke="#A5B4FC" strokeWidth="0.6" strokeLinecap="round" />
      <line x1="23" y1="18" x2="23" y2="24" stroke="#A5B4FC" strokeWidth="0.6" strokeLinecap="round" />

      {/* Door */}
      <rect x="18.5" y="27" width="3" height="4" rx="1" fill="#E0E7FF" stroke="#4F46E5" strokeWidth="0.6" />

      {/* "HOUSE" text */}
      <text x="20" y="35" textAnchor="middle" fontSize="4.8" fontWeight="700" fill="#A855F7" fontFamily="Inter, system-ui, sans-serif" letterSpacing="1.5">HOUSE</text>
    </svg>
  );
}
