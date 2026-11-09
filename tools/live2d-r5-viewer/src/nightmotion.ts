type Thrust = {
  perMinute: number
  startedAt: number
  ramped: boolean
  stoppedAt?: number
}

export const nightWindow = window as Window & {
  __chiakiNod?: number
  __chiakiThrust?: Thrust
}

export const setThrust = (perMinute: number) => {
  const now = performance.now()
  const current = nightWindow.__chiakiThrust
  if (perMinute > 0) {
    nightWindow.__chiakiThrust = {
      perMinute,
      startedAt: now,
      // A tempo change mid-scene keeps full strength instead of easing in again.
      ramped: !!current && current.stoppedAt === undefined,
    }
  } else if (current && current.stoppedAt === undefined) {
    current.stoppedAt = now
  }
}

// One shove per beat: a sharp rise that settles before the next one, 0..1.
export const thrustPulse = (now: number) => {
  const thrust = nightWindow.__chiakiThrust
  if (!thrust) return 0
  const beat = 60000 / thrust.perMinute
  const phase = ((((now - thrust.startedAt) % beat) + beat) % beat) / beat
  const ramp = thrust.ramped ? 1 : Math.min(1, (now - thrust.startedAt) / 1500)
  const fade =
    thrust.stoppedAt === undefined
      ? 1
      : Math.max(0, 1 - (now - thrust.stoppedAt) / 500)
  if (fade === 0) nightWindow.__chiakiThrust = undefined
  return (ramp * fade * ((1 - Math.exp(-phase * 30)) * Math.exp(-phase * 5))) / 0.6
}

const NOD_SECONDS = 0.7

// A single dip of the head and back, 0..1.
export const nodAmount = (now: number) => {
  const startedAt = nightWindow.__chiakiNod
  if (startedAt === undefined) return 0
  const p = (now - startedAt) / 1000 / NOD_SECONDS
  if (p >= 1) {
    nightWindow.__chiakiNod = undefined
    return 0
  }
  return (
    Math.sin(Math.PI * Math.min(1, p * 1.25)) * (p < 0.8 ? 1 : 1 - (p - 0.8) * 5)
  )
}
