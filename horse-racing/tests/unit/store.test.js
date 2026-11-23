import { beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { createPinia, setActivePinia } from 'pinia'
import { useRaceStore } from '../../src/stores/race.js'
import { ROUND_HOLD_MS } from '../../src/domain/race.js'

let store
beforeEach(() => {
  setActivePinia(createPinia())
  store = useRaceStore()
})

function start() {
  store.generateProgram()
  store.toggleRace()
}

test('Start before Generate is inert and generation leaves the program ready', () => {
  store.toggleRace()
  assert.equal(store.phase, 'idle')
  assert.equal(store.schedule.length, 0)
  store.generateProgram()
  store.advance(9000)
  assert.equal(store.phase, 'ready')
  assert.equal(store.elapsedMs, 0)
  assert.equal(store.currentRound.number, 1)
})

test('pause/resume freezes the clock and preserves the same field and elapsed time', () => {
  start()
  const runners = store.currentRound.runners
  store.advance(2500)
  store.toggleRace()
  store.advance(1000)
  assert.equal(store.elapsedMs, 2500)
  assert.equal(store.phase, 'paused')
  store.toggleRace()
  store.advance(100)
  assert.equal(store.elapsedMs, 2600)
  assert.equal(store.currentRound.runners, runners)
})

test('a complete ten-horse result is published once, only after the last crossing', () => {
  start()
  const round = store.currentRound
  store.advance(round.durationMs - 1)
  assert.deepEqual(store.results, [])
  store.advance(1)
  assert.equal(store.results.length, 1)
  assert.equal(store.results[0].runners.length, 10)
  assert.deepEqual(store.results[0].runners.map(r => r.finishMs),
    round.runners.map(r => r.finishMs).sort((a, b) => a - b))
  store.advance(ROUND_HOLD_MS)
  assert.equal(store.results.length, 1)
  assert.equal(store.currentRound.number, 2)
  assert.equal(store.elapsedMs, 0)
})

test('all six rounds finish in order across a long frame; completion is terminal', () => {
  start()
  store.advance(120000)
  assert.deepEqual(store.results.map(r => r.number), [1, 2, 3, 4, 5, 6])
  assert.equal(store.phase, 'completed')
  store.toggleRace()
  store.advance(100)
  assert.equal(store.phase, 'completed')
  assert.equal(store.currentRound.number, 6)
  assert.equal(store.elapsedMs, store.currentRound.durationMs)
  assert.equal(store.results.length, 6)
})

test('regeneration discards the running meet and clears stale progress and results', () => {
  start()
  store.advance(store.currentRound.durationMs + ROUND_HOLD_MS + 100)
  const oldSchedule = store.schedule
  store.generateProgram()
  assert.notEqual(store.schedule, oldSchedule)
  assert.equal(store.phase, 'ready')
  assert.equal(store.results.length, 0)
  assert.equal(store.elapsedMs, 0)
  assert.equal(store.roundIndex, 0)
  store.advance(1234)
  assert.equal(store.elapsedMs, 0)
})

test('invalid frame times do not corrupt the race clock', () => {
  start()
  for (const value of [Infinity, NaN, -1, 0]) store.advance(value)
  assert.equal(store.elapsedMs, 0)
})
