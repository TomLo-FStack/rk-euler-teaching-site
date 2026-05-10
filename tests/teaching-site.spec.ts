import { expect, test } from '@playwright/test'

test('renders the math and programming teaching structure', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /从一条切线/ })).toBeVisible()
  await expect(page.getByText('y\' = y - x² + 1')).toBeVisible()
  await expect(page.getByRole('link', { name: '数学部分' })).toBeVisible()
  await expect(page.getByRole('link', { name: '编程部分' })).toBeVisible()
  await expect(page.getByText('二阶 Runge-Kutta：先试走，再平均')).toBeVisible()
  await expect(page.getByText('四阶 Runge-Kutta：看四个代表斜率')).toBeVisible()
  await expect(page.getByText('步长减半，误差按方法阶数下降')).toBeVisible()
  await expect(page.getByText('def rk4_step')).toBeVisible()
})

test('method and step controls change the reported error', async ({ page }) => {
  await page.goto('/')

  const finalError = page.getByTestId('final-error')
  const rk4Error = await finalError.textContent()

  await page.getByRole('button', { name: '欧拉法' }).click()
  const eulerError = await finalError.textContent()

  expect(rk4Error).not.toEqual(eulerError)
  await expect(finalError).toContainText(/0\.4|0\.5/)

  await page.getByRole('slider', { name: '步长' }).fill('2')
  const smallerStepError = await finalError.textContent()
  expect(smallerStepError).not.toEqual(eulerError)
})

test('charts and tables are visible on desktop and mobile', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('curve-chart')).toBeVisible()
  await expect(page.locator('.recharts-wrapper').first()).toBeVisible()
  await expect(page.getByRole('table')).toBeVisible()
  await expect(page.getByText('GitHub Actions')).toBeVisible()
})
