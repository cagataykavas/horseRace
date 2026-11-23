import { test as realBrowser } from '@playwright/test'
import { test, expect } from './fixture.js'

const generate = page => page.getByRole('button', { name: 'Generate program' }).click()
const track = page => page.getByRole('region', { name: 'Race track' })
const board = (page, name) => page.getByRole('region', { name, exact: true })
const positions = page => track(page).locator('.runner').evaluateAll(nodes => nodes.map(n => parseFloat(n.style.left)))

test('generate draws six fields of ten from the visible 20; Start is gated', async ({ page }) => {
  const errors = []
  page.on('pageerror', err => errors.push(err.message))
  await expect(page.getByRole('button', { name: 'Start' })).toBeDisabled()
  await expect(board(page, 'Horse list').locator('tbody tr')).toHaveCount(20)
  await generate(page)
  const names = await board(page, 'Horse list').locator('tbody td:first-child').allTextContents()
  const program = board(page, 'Program')
  await expect(program.locator('h3')).toHaveCount(6)
  for (const [i, distance] of [1200, 1400, 1600, 1800, 2000, 2200].entries()) {
    const round = program.getByRole('region', { name: 'Round ' + (i + 1), exact: true })
    await expect(round.getByRole('heading')).toContainText(distance + ' m')
    const field = await round.locator('tbody td:nth-child(2)').allTextContents()
    expect(field).toHaveLength(10)
    expect(new Set(field).size).toBe(10)
    expect(field.every(name => names.includes(name))).toBe(true)
  }
  await expect(board(page, 'Results').locator('tbody')).toHaveCount(0)
  await expect(track(page).locator('.runner')).toHaveCount(10)
  expect(await positions(page)).toEqual(Array(10).fill(0))
  expect(errors).toEqual([])
})

test('visible movement pauses exactly and resumes from the same positions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await generate(page)
  await page.getByRole('button', { name: 'Start' }).click()
  await page.clock.runFor(750)
  await expect(page.locator('.horse.moving')).toHaveCount(10)
  await page.getByRole('button', { name: 'Pause' }).click()
  const stopped = await positions(page)
  expect(stopped.every(p => p > 0 && p < 100)).toBe(true)
  await expect(page.locator('.horse.moving')).toHaveCount(0)
  await expect(page.locator('.horse .body').first()).toHaveCSS('animation-play-state', 'paused')
  await page.clock.fastForward(8000)
  expect(await positions(page)).toEqual(stopped)
  await page.getByRole('button', { name: 'Resume' }).click()
  await page.clock.runFor(250)
  expect((await positions(page)).every((p, i) => p > stopped[i])).toBe(true)
})

test('one running meet publishes six complete standings in program order', async ({ page }) => {
  await generate(page)
  await page.getByRole('button', { name: 'Start' }).click()
  const result = board(page, 'Results')
  let previous = 0
  let sawPartialFinish = false
  for (let step = 0; step < 220 && previous < 6; step++) {
    await page.clock.fastForward(500)
    const rounds = await result.locator('.round-block').count()
    const progress = await positions(page)
    if (previous === 0 && progress.some(p => p === 100) && progress.some(p => p < 100)) {
      expect(rounds).toBe(0)
      sawPartialFinish = true
    }
    if (rounds === previous) continue
    expect(rounds).toBe(previous + 1)
    const label = 'Round ' + rounds
    const published = result.getByRole('region', { name: label, exact: true })
    const scheduled = board(page, 'Program').getByRole('region', { name: label, exact: true })
    const ranked = await published.locator('tbody td:nth-child(2)').allTextContents()
    expect(ranked).toHaveLength(10)
    expect(ranked.sort()).toEqual((await scheduled.locator('tbody td:nth-child(2)').allTextContents()).sort())
    previous = rounds
  }
  expect(sawPartialFinish).toBe(true)
  expect(previous).toBe(6)
  await expect(page.getByRole('status')).toContainText('All rounds finished')
  await expect(page.getByRole('button', { name: 'Finished' })).toBeDisabled()
  const atLine = await page.locator('.runway').evaluateAll(nodes => nodes.map(node => {
    const sprite = node.querySelector('svg').getBoundingClientRect()
    const nose = sprite.left + sprite.width * 63 / 68
    return Math.abs(node.getBoundingClientRect().right - nose)
  }))
  expect(atLine.every(error => error < 1)).toBe(true)
})

test('regenerate during a later round cancels the clock and restores the starting grid', async ({ page }) => {
  await generate(page)
  await page.getByRole('button', { name: 'Start' }).click()
  await page.clock.fastForward(12000)
  await expect(board(page, 'Results').locator('.round-block').first()).toBeVisible()
  await generate(page)
  await page.clock.fastForward(30000)
  await expect(page.getByRole('status')).toContainText('Ready')
  await expect(board(page, 'Results').locator('.round-block')).toHaveCount(0)
  expect(await positions(page)).toEqual(Array(10).fill(0))
  await page.getByRole('button', { name: 'Start' }).click()
  await page.clock.runFor(500)
  expect((await positions(page)).every(p => p > 0)).toBe(true)
})

for (const width of [360, 768, 1024, 1440]) {
  test('left-hand gates are stacked and their digits rotate counterclockwise at ' + width + 'px', async ({ page }) => {
    await page.setViewportSize({ width, height: 850 })
    await generate(page)
    const gates = page.locator('.gate')
    expect(await gates.allTextContents()).toEqual(['1','2','3','4','5','6','7','8','9','10'])
    const boxes = await gates.evaluateAll(nodes => nodes.map(node => {
      const box = node.getBoundingClientRect()
      const label = node.querySelector('.gate-number')
      const ink = label.getBoundingClientRect()
      const runway = node.nextElementSibling.getBoundingClientRect()
      return {
        x: box.x,
        y: box.y,
        rotated: getComputedStyle(label).transform === 'matrix(0, -1, 1, 0, 0, 0)',
        inside: ink.left >= box.left && ink.right <= box.right && ink.top >= box.top && ink.bottom <= box.bottom,
        trackToRight: runway.left >= box.right && runway.width > box.width,
      }
    }))
    expect(boxes.every((box, i) => box.x === boxes[0].x && (i === 0 || box.y > boxes[i - 1].y)
      && box.rotated && box.inside && box.trackToRight)).toBe(true)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}

realBrowser('the production HTML opens offline and animates with a real browser clock', async ({ page, context }) => {
  const requests = []
  page.on('request', req => {
    if (/^https?:/.test(req.url())) requests.push(req.url())
  })
  await context.setOffline(true)
  await page.goto(new URL('../../dist/index.html', import.meta.url).href)
  await generate(page)
  await page.getByRole('button', { name: 'Start' }).click()
  await expect.poll(async () => (await positions(page)).filter(p => p > 0).length).toBe(10)
  await page.getByRole('button', { name: 'Pause' }).click()
  await expect(page.getByRole('status')).toContainText('Paused')
  expect(requests).toEqual([])
})
