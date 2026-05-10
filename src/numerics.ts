export type MethodKey = 'euler' | 'rk2' | 'rk4'

export type StepPoint = {
  n: number
  x: number
  y: number
  exact: number
  error: number
}

export type ConvergenceRow = {
  method: MethodKey
  h: number
  steps: number
  finalError: number
  ratio: number | null
}

export const methodNames: Record<MethodKey, string> = {
  euler: '欧拉法',
  rk2: '二阶 Runge-Kutta',
  rk4: '四阶 Runge-Kutta',
}

export const derivative = (x: number, y: number) => y - x * x + 1

export const exactSolution = (x: number) => (x + 1) ** 2 - 0.5 * Math.exp(x)

const eulerStep = (x: number, y: number, h: number) => y + h * derivative(x, y)

const rk2Step = (x: number, y: number, h: number) => {
  const k1 = derivative(x, y)
  const k2 = derivative(x + h, y + h * k1)
  return y + (h * (k1 + k2)) / 2
}

const rk4Step = (x: number, y: number, h: number) => {
  const k1 = derivative(x, y)
  const k2 = derivative(x + h / 2, y + (h * k1) / 2)
  const k3 = derivative(x + h / 2, y + (h * k2) / 2)
  const k4 = derivative(x + h, y + h * k3)
  return y + (h * (k1 + 2 * k2 + 2 * k3 + k4)) / 6
}

const steps: Record<MethodKey, (x: number, y: number, h: number) => number> = {
  euler: eulerStep,
  rk2: rk2Step,
  rk4: rk4Step,
}

export const solve = (method: MethodKey, h = 0.2, xEnd = 2): StepPoint[] => {
  const result: StepPoint[] = []
  let x = 0
  let y = 0.5
  let n = 0

  const pushPoint = () => {
    const exact = exactSolution(x)
    result.push({ n, x, y, exact, error: Math.abs(y - exact) })
  }

  pushPoint()
  while (x < xEnd - 1e-12) {
    const stepH = Math.min(h, xEnd - x)
    y = steps[method](x, y, stepH)
    x += stepH
    n += 1
    pushPoint()
  }
  return result
}

export const convergenceTable = (hValues = [0.4, 0.2, 0.1, 0.05, 0.025]): ConvergenceRow[] =>
  (['euler', 'rk2', 'rk4'] as const).flatMap((method) => {
    let previousError: number | null = null
    return hValues.map((h) => {
      const points = solve(method, h)
      const finalError = points.at(-1)?.error ?? Number.NaN
      const row: ConvergenceRow = {
        method,
        h,
        steps: points.length - 1,
        finalError,
        ratio: previousError === null ? null : previousError / finalError,
      }
      previousError = finalError
      return row
    })
  })

export const formatNumber = (value: number, digits = 6) =>
  value === 0 ? '0' : value.toLocaleString('zh-CN', { maximumSignificantDigits: digits })

export const formatFixed = (value: number, digits = 4) =>
  value.toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
