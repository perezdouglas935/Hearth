'use client'

import { useEffect, useState } from 'react'
import { Cloud, CloudRain, CloudSnow, Sun, CloudFog, CloudLightning, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'

type Weather = {
  temperature: number
  windspeed: number
  weathercode: number
  city: string
}

// Open-Meteo weather code mapping
function interpret(code: number): { label: string; Icon: typeof Sun; tone: string } {
  if (code === 0) return { label: 'Clear & sunny', Icon: Sun, tone: 'from-amber-200/70 to-orange-200/70' }
  if (code <= 3) return { label: 'Partly cloudy', Icon: Cloud, tone: 'from-amber-100/70 to-orange-100/70' }
  if (code === 45 || code === 48) return { label: 'Foggy', Icon: CloudFog, tone: 'from-stone-200/70 to-stone-100/70' }
  if (code >= 51 && code <= 67) return { label: 'Rainy', Icon: CloudRain, tone: 'from-sky-200/70 to-blue-100/70' }
  if (code >= 71 && code <= 77) return { label: 'Snowy', Icon: CloudSnow, tone: 'from-sky-100/70 to-white/70' }
  if (code >= 80 && code <= 82) return { label: 'Showers', Icon: CloudRain, tone: 'from-sky-200/70 to-blue-100/70' }
  if (code >= 95) return { label: 'Thunderstorm', Icon: CloudLightning, tone: 'from-purple-200/70 to-amber-100/70' }
  return { label: 'A gentle day', Icon: Cloud, tone: 'from-amber-100/70 to-orange-100/70' }
}

function encouragingForWeather(label: string): string {
  if (label.includes('Rain') || label.includes('Shower')) return 'Cozy weather for a warm drink and a good book \u2615'
  if (label.includes('Snow')) return 'Bundle up and stay toasty \u2744\ufe0f'
  if (label.includes('Sun')) return 'Soak up the sunshine when you can \u2600\ufe0f'
  if (label.includes('Cloud')) return 'A soft, gentle sky today \u2601\ufe0f'
  if (label.includes('Fog')) return 'Mysterious morning \u2014 take it slow \ud83c\udf2b\ufe0f'
  if (label.includes('Thunder')) return 'Loud skies, soft heart. You\u2019ve got this \u26a1'
  return 'A perfectly ordinary day \u2014 those are special, too.'
}



export function WeatherWidget() {
  const [w, setW] = useState<Weather | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const fetchAt = async (lat: number, lon: number, fallbackCity: string) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit`).catch(() => null)
        if (!res || !res.ok) return
        const data = await res.json().catch(() => null)
        const cw = data?.current_weather
        if (!cw) return
        if (!active) return
        setW({ temperature: cw.temperature, windspeed: cw.windspeed, weathercode: cw.weathercode, city: fallbackCity })
      } catch {
        /* ignore */
      } finally {
        if (active) setLoading(false)
      }
    }

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchAt(pos.coords.latitude, pos.coords.longitude, 'Your area'),
        () => fetchAt(30.27, -97.74, 'Austin, TX'),
        { timeout: 4000 }
      )
    } else {
      fetchAt(30.27, -97.74, 'Austin, TX')
    }

    // Safety timeout
    const t = setTimeout(() => {
      if (active && loading) fetchAt(30.27, -97.74, 'Austin, TX')
    }, 4500)

    return () => { active = false; clearTimeout(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const meta = interpret(w?.weathercode ?? 0)
  const Icon = meta.Icon

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl p-5 paper-texture shadow-[var(--shadow-md)] h-full overflow-hidden relative"
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${meta.tone} blur-2xl opacity-70`} />
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] mb-2">
          <MapPin size={12} />
          <span>{loading ? 'Finding the weather…' : (w?.city ?? 'Right where you are')}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--primary))]/10 flex items-center justify-center">
            <Icon size={28} className="text-[hsl(var(--primary))]" />
          </div>
          <div>
            <div className="text-3xl font-semibold leading-none">
              {loading ? '—' : `${Math.round(w?.temperature ?? 0)}°F`}
            </div>
            <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{loading ? 'one moment' : meta.label}</div>
          </div>
        </div>
        <div className="mt-4 text-sm text-[hsl(var(--foreground))]/80 italic">
          {loading ? 'Brewing the forecast…' : encouragingForWeather(meta.label)}
        </div>
      </div>
    </motion.div>
  )
}
