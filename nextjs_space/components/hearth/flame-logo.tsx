'use client'

import { motion } from 'framer-motion'

export function FlameLogo({ size = 32 }: { size?: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      initial={{ scale: 0.95 }}
      animate={{ scale: [0.96, 1.03, 0.97, 1.02, 0.98], rotate: [-1, 2, -2, 1, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      style={{ transformOrigin: 'bottom center', filter: 'drop-shadow(0 4px 8px rgba(198, 123, 92, 0.35))' }}
    >
      {/* Outer flame */}
      <path
        d="M16 2c1.4 4.4-1.4 6.5-3.4 8.7-2.7 2.9-4.6 5.4-4.6 9.1C8 25.5 11.6 30 16 30s8-4.5 8-10.2c0-2.6-1.1-4.6-2.4-6.4-1.7-2.4-3.6-4.7-3.4-8 .1-1.6.5-2.5-2.2-3.4z"
        fill="hsl(16 65% 55%)"
      />
      {/* Inner flame */}
      <path
        d="M16 9c.8 2.4-.8 3.6-2 5-1.5 1.7-2.5 3-2.5 5.1 0 3.2 2 5.7 4.5 5.7s4.5-2.5 4.5-5.7c0-1.5-.6-2.7-1.4-3.7-1-1.4-2-2.7-1.9-4.5.1-.9.3-1.4-1.2-1.9z"
        fill="hsl(41 80% 60%)"
      />
      {/* Core */}
      <ellipse cx="16" cy="22" rx="2" ry="3" fill="hsl(48 95% 75%)" />
    </motion.svg>
  )
}
