'use client'

import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useRef } from 'react'

export function CountUp({ to, duration = 1.2 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const value = useMotionValue(0)
  const rounded = useTransform(value, (v) => Math.round(v).toLocaleString())

  useEffect(() => {
    if (inView) {
      const controls = animate(value, to, { duration, ease: 'easeOut' })
      return controls.stop
    }
  }, [inView, to, duration, value])

  return <motion.span ref={ref}>{rounded}</motion.span>
}
