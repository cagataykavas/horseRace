import { computed, ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { generateHorses } from '../domain/roster.js'
import { finishOrder, generateSchedule, ROUND_HOLD_MS } from '../domain/race.js'

export const useRaceStore = defineStore('race', () => {
  const horses = shallowRef(generateHorses())
  const schedule = shallowRef([])
  const results = shallowRef([])
  const roundIndex = ref(0)
  const elapsedMs = ref(0)
  const phase = ref('idle')
  const currentRound = computed(() => schedule.value[roundIndex.value] ?? null)

  function generateProgram() {
    phase.value = 'ready'
    horses.value = generateHorses()
    schedule.value = generateSchedule(horses.value)
    results.value = []
    roundIndex.value = 0
    elapsedMs.value = 0
  }

  function toggleRace() {
    if (phase.value === 'running') phase.value = 'paused'
    else if (phase.value === 'ready' || phase.value === 'paused') phase.value = 'running'
  }

  function advance(deltaMs) {
    if (phase.value !== 'running' || !Number.isFinite(deltaMs) || deltaMs <= 0) return
    let remaining = deltaMs
    while (remaining > 0) {
      const round = currentRound.value
      const lastRound = roundIndex.value === schedule.value.length - 1
      const boundary = round.durationMs + (lastRound ? 0 : ROUND_HOLD_MS)
      const step = Math.min(remaining, boundary - elapsedMs.value)
      elapsedMs.value += step
      remaining -= step
      if (elapsedMs.value >= round.durationMs && results.value.length === roundIndex.value) {
        results.value = [...results.value, { number: round.number, distance: round.distance, runners: finishOrder(round) }]
      }
      if (elapsedMs.value < boundary) break
      if (lastRound) {
        phase.value = 'completed'
        break
      }
      roundIndex.value++
      elapsedMs.value = 0
    }
  }

  return { horses, schedule, results, phase, roundIndex, elapsedMs, currentRound, generateProgram, toggleRace, advance }
})
