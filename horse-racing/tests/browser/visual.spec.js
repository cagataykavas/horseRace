import { test, expect } from './fixture.js'

test('empty desktop dashboard', async ({ page }) => {
  await expect(page).toHaveScreenshot('desktop-empty.png')
})

test('mid-race field and paused controls', async ({ page }) => {
  await page.getByRole('button', { name: 'Generate program' }).click()
  await page.getByRole('button', { name: 'Start' }).click()
  await page.clock.fastForward(3200)
  await page.getByRole('button', { name: 'Pause' }).click()
  await expect(page).toHaveScreenshot('desktop-paused.png')
})

test('completed meet with the finishing grid and published standings', async ({ page }) => {
  await page.getByRole('button', { name: 'Generate program' }).click()
  await page.getByRole('button', { name: 'Start' }).click()
  await page.clock.fastForward(120000)
  await expect(page.getByRole('status')).toContainText('All rounds finished')
  await expect(page).toHaveScreenshot('desktop-finished.png')
})

test('mobile starting grid and the three data panels', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Generate program' }).click()
  await expect(page).toHaveScreenshot('mobile-ready.png', { fullPage: true })
})
