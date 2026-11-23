import { shuffled } from './roster.js'

export const DISTANCES = [1200, 1400, 1600, 1800, 2000, 2200]
export const FIELD_SIZE = 10
export const ROUND_HOLD_MS = 1000
const SECTORS = 6

// Times are on a compressed race clock. Each equal-distance sector has its own pace.
function drawRunner(horse, index, distance, random) {
  const form = 140 + horse.condition * 0.5 + random() * 56
  let elapsed = 0
  const splits = Array.from({ length: SECTORS }, () => {
    const speed = form * (0.82 + random() * 0.36)
    elapsed += 1000 * (distance / SECTORS) / speed
    return elapsed
  })
  return { horse, lane: index + 1, splits, finishMs: elapsed }
}

export function generateSchedule(horses, random = Math.random) {
  return DISTANCES.map((distance, index) => {
    const runners = shuffled(horses, random).slice(0, FIELD_SIZE)
      .map((horse, lane) => drawRunner(horse, lane, distance, random))
    return {
      number: index + 1, distance, runners,
      durationMs: Math.max(...runners.map(runner => runner.finishMs)),
    }
  })
}

export function progressAt(runner, elapsedMs) {
  if (elapsedMs <= 0) return 0
  if (elapsedMs >= runner.finishMs) return 1
  const sector = runner.splits.findIndex(end => elapsedMs < end)
  const start = sector === 0 ? 0 : runner.splits[sector - 1]
  const fraction = (elapsedMs - start) / (runner.splits[sector] - start)
  return (sector + fraction) / runner.splits.length
}

export function finishOrder(round) {
  // Full-precision crossing times also order horses that finish in the same frame.
  // An exact tie uses the starting lane as the deterministic tie-break.
  return [...round.runners].sort((a, b) => a.finishMs - b.finishMs || a.lane - b.lane)
}
