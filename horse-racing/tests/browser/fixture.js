import { test as base, expect } from '@playwright/test'

export const test = base.extend({
  page: async ({ page }, use) => {
    const start = new Date('2025-01-01T12:00:00Z')
    await page.clock.install({ time: start })
    await page.clock.pauseAt(new Date(start.getTime() + 1000))
    await page.addInitScript(() => {
      let seed = 3101
      Math.random = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
        return seed / 2 ** 32
      }
    })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    await use(page)
  },
})
export { expect }
