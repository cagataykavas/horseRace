import test from 'node:test'
import assert from 'node:assert/strict'
import { generateHorses } from '../../src/domain/roster.js'
import { generateSchedule, finishOrder, progressAt } from '../../src/domain/race.js'

function randomStream(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 2 ** 32
  }
}

test('the stable contains 20 distinct horses, each with a unique named silk', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const horses = generateHorses(randomStream(seed))
    assert.equal(horses.length, 20)
    for (const field of ['id', 'name', 'colorName', 'hex']) {
      assert.equal(new Set(horses.map(h => h[field])).size, 20)
    }
    assert.ok(horses.every(h => Number.isInteger(h.condition) && h.condition >= 1 && h.condition <= 100))
  }
})

test('both condition endpoints are reachable', () => {
  assert.ok(generateHorses(() => 0).every(h => h.condition === 1))
  assert.ok(generateHorses(() => 0.999999).every(h => h.condition === 100))
})

test('each draw yields the six specified distances and ten unique roster members per round', () => {
  for (let seed = 0; seed < 25; seed++) {
    const random = randomStream(seed)
    const horses = generateHorses(random)
    const copy = structuredClone(horses)
    const rounds = generateSchedule(horses, random)
    assert.deepEqual(rounds.map(r => r.distance), [1200, 1400, 1600, 1800, 2000, 2200])
    assert.deepEqual(rounds.map(r => r.number), [1, 2, 3, 4, 5, 6])
    for (const round of rounds) {
      assert.equal(round.runners.length, 10)
      assert.equal(new Set(round.runners.map(r => r.horse.id)).size, 10)
      assert.ok(round.runners.every((r, i) => r.lane === i + 1 && horses.includes(r.horse)))
    }
    assert.deepEqual(horses, copy)
  }
})

test('different draws change lineups and later rounds can reuse a horse', () => {
  const horses = generateHorses(randomStream(1))
  const ids = round => round.runners.map(r => r.horse.id)
  const a = generateSchedule(horses, randomStream(31))
  const b = generateSchedule(horses, randomStream(32))
  assert.notDeepEqual(ids(a[0]), ids(b[0]))
  assert.notDeepEqual(ids(a[0]), ids(a[1]))
  assert.ok(ids(a[1]).some(id => ids(a[0]).includes(id)))
})

test('position interpolates by sector, starts at zero, and stops at the line', () => {
  const runner = { splits: [100, 300], finishMs: 300 }
  for (const [time, expected] of [[-1, 0], [0, 0], [50, 0.25], [100, 0.5], [200, 0.75], [300, 1], [400, 1]]) {
    assert.equal(progressAt(runner, time), expected)
  }
})

test('better condition helps and longer rounds take more time at otherwise identical pace', () => {
  const horses = generateHorses(() => 0.4)
  const draw = condition => generateSchedule(horses.map(h => ({ ...h, condition })), () => 0.4)
  const low = draw(1)
  const high = draw(100)
  assert.ok(high[0].durationMs < low[0].durationMs)
  assert.ok(high[5].durationMs > high[0].durationMs)
})

test('same-frame finishes use exact crossing time, with lane as the exact-tie breaker', () => {
  const round = { runners: [
    { lane: 1, finishMs: 5005.9 }, { lane: 2, finishMs: 5004.2 }, { lane: 3, finishMs: 5004.2 },
  ] }
  assert.deepEqual(finishOrder(round).map(r => r.lane), [2, 3, 1])
  assert.deepEqual(round.runners.map(r => r.lane), [1, 2, 3])
})
