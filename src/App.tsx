import { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { BookOpen, Braces, Calculator, ChartNoAxesCombined, Code2, GitBranch, Play, Sigma } from 'lucide-react'
import './App.css'
import { convergenceTable, formatFixed, formatNumber, methodNames, solve, type MethodKey } from './numerics'

const methodOrder: MethodKey[] = ['euler', 'rk2', 'rk4']

const hOptions = [0.4, 0.2, 0.1, 0.05]

const tooltipNumber = (value: unknown) => (typeof value === 'number' ? formatNumber(value, 8) : String(value ?? ''))

const codeBlocks = {
  stepOne: `def f(x, y):
    return y - x*x + 1

def exact(x):
    return (x + 1)**2 - 0.5 * exp(x)`,
  stepTwo: `def euler_step(x, y, h):
    slope = f(x, y)
    return y + h * slope`,
  stepThree: `def rk2_step(x, y, h):
    k1 = f(x, y)
    guess = y + h * k1
    k2 = f(x + h, guess)
    return y + h * (k1 + k2) / 2`,
  stepFour: `def rk4_step(x, y, h):
    k1 = f(x, y)
    k2 = f(x + h/2, y + h*k1/2)
    k3 = f(x + h/2, y + h*k2/2)
    k4 = f(x + h, y + h*k3)
    return y + h * (k1 + 2*k2 + 2*k3 + k4) / 6`,
}

function App() {
  const [method, setMethod] = useState<MethodKey>('rk4')
  const [h, setH] = useState(0.2)

  const selectedPoints = useMemo(() => solve(method, h), [method, h])
  const comparisonPoints = useMemo(() => {
    const byMethod = methodOrder.map((key) => solve(key, h))
    return byMethod[0].map((point, index) => ({
      x: Number(point.x.toFixed(4)),
      exact: point.exact,
      euler: byMethod[0][index]?.y,
      rk2: byMethod[1][index]?.y,
      rk4: byMethod[2][index]?.y,
    }))
  }, [h])
  const convergenceRows = useMemo(() => convergenceTable(), [])
  const finalPoint = selectedPoints[selectedPoints.length - 1]
  const firstStep = selectedPoints[1]

  return (
    <main>
      <nav className="topbar" aria-label="页面导航">
        <a href="#math">数学部分</a>
        <a href="#code">编程部分</a>
        <a href="#verify">验证与部署</a>
      </nav>

      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Runge-Kutta 与 Euler 教学网站</p>
          <h1>从一条切线，走到可验证的数值算法</h1>
          <p className="lead">
            我们只研究一个问题：已知当前位置和斜率公式，怎样一步一步预报下一刻的函数值？
            页面用同一道初值问题串起欧拉法、二阶 Runge-Kutta、四阶 Runge-Kutta，以及步长如何控制误差。
          </p>
          <div className="problem-box" aria-label="本课统一例题">
            <span>统一例题</span>
            <strong>y' = y - x² + 1, y(0)=0.5, 目标区间 0 ≤ x ≤ 2</strong>
            <em>解析解：y(x) = (x + 1)² - 0.5eˣ，用来衡量数值误差。</em>
          </div>
        </div>

        <div className="lab-panel" aria-label="交互实验台">
          <div className="panel-header">
            <div>
              <p className="eyebrow">实验台</p>
              <h2>选方法、调步长、看误差</h2>
            </div>
            <Calculator aria-hidden="true" />
          </div>

          <div className="method-tabs" role="tablist" aria-label="数值方法">
            {methodOrder.map((key) => (
              <button
                key={key}
                type="button"
                aria-selected={method === key}
                className={method === key ? 'active' : ''}
                onClick={() => setMethod(key)}
              >
                {methodNames[key]}
              </button>
            ))}
          </div>

          <label className="slider-row">
            <span>步长 h = {h}</span>
            <input
              aria-label="步长"
              type="range"
              min="0"
              max={hOptions.length - 1}
              step="1"
              value={hOptions.indexOf(h)}
              onChange={(event) => setH(hOptions[Number(event.target.value)])}
            />
          </label>

          <div className="metric-grid">
            <div>
              <span>步数</span>
              <strong>{selectedPoints.length - 1}</strong>
            </div>
            <div>
              <span>x=2 近似值</span>
              <strong>{formatNumber(finalPoint.y, 9)}</strong>
            </div>
            <div>
              <span>x=2 绝对误差</span>
              <strong data-testid="final-error">{formatNumber(finalPoint.error, 6)}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="chart-band" aria-label="方法曲线比较">
        <div className="section-heading">
          <ChartNoAxesCombined aria-hidden="true" />
          <div>
            <p className="eyebrow">同一坐标系比较</p>
            <h2>欧拉法先偏离，RK2 修正，RK4 最贴近真解</h2>
          </div>
        </div>
        <div className="chart-wrap" data-testid="curve-chart">
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={comparisonPoints} margin={{ top: 20, right: 30, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="4 4" />
              <XAxis dataKey="x" />
              <YAxis domain={['auto', 'auto']} width={54} />
              <Tooltip formatter={tooltipNumber} />
              <Legend />
              <Line dataKey="exact" name="解析解" type="monotone" stroke="#111827" strokeWidth={3} dot={false} />
              <Line dataKey="euler" name="欧拉法" type="monotone" stroke="#dc2626" strokeWidth={2} />
              <Line dataKey="rk2" name="RK2" type="monotone" stroke="#2563eb" strokeWidth={2} />
              <Line dataKey="rk4" name="RK4" type="monotone" stroke="#059669" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section id="math" className="content-grid">
        <article className="lesson-card wide">
          <div className="section-heading">
            <BookOpen aria-hidden="true" />
            <div>
              <p className="eyebrow">数学部分 1</p>
              <h2>问题从哪里来：只知道速度，怎样找位置？</h2>
            </div>
          </div>
          <p>
            微分方程 y' = f(x, y) 的意思是：当横坐标是 x、函数值是 y 时，曲线此刻的斜率由 f 告诉我们。
            但它通常不直接告诉 y 的完整公式。数值法要做的事，就是把连续曲线拆成很多短路程。
          </p>
          <div className="derivation">
            <p><strong>把一步想成直线：</strong>如果一步很短，曲线在这一小段里像一条切线。</p>
            <p className="formula">y(x + h) ≈ y(x) + h · f(x, y)</p>
            <p>
              这就是欧拉法。它用“起点斜率”走完整个小区间，所以简单、直观，但一旦斜率在区间内变化明显，误差会积累。
            </p>
          </div>
        </article>

        <article className="lesson-card">
          <div className="section-heading compact">
            <Sigma aria-hidden="true" />
            <h3>二阶 Runge-Kutta：先试走，再平均</h3>
          </div>
          <p>
            RK2 不满足于只看起点。它先用欧拉法试走到终点，得到一个临时 y，再计算终点附近斜率。
            最后取起点斜率和终点斜率的平均。
          </p>
          <div className="formula-stack">
            <span>k₁ = f(xₙ, yₙ)</span>
            <span>k₂ = f(xₙ + h, yₙ + hk₁)</span>
            <span>yₙ₊₁ = yₙ + h(k₁ + k₂)/2</span>
          </div>
          <p>它相当于问两次“方向在哪里”，因此误差通常随 h² 缩小。</p>
        </article>

        <article className="lesson-card">
          <div className="section-heading compact">
            <GitBranch aria-hidden="true" />
            <h3>四阶 Runge-Kutta：看四个代表斜率</h3>
          </div>
          <p>
            RK4 在起点、中点、中点、终点各看一次斜率，并给中点更高权重。权重 1:2:2:1
            像一次精细的加权平均，既利用局部信息，又控制计算量。
          </p>
          <div className="formula-stack">
            <span>k₁ = f(xₙ, yₙ)</span>
            <span>k₂ = f(xₙ + h/2, yₙ + hk₁/2)</span>
            <span>k₃ = f(xₙ + h/2, yₙ + hk₂/2)</span>
            <span>k₄ = f(xₙ + h, yₙ + hk₃)</span>
            <span>yₙ₊₁ = yₙ + h(k₁ + 2k₂ + 2k₃ + k₄)/6</span>
          </div>
        </article>

        <article className="lesson-card wide">
          <div className="section-heading">
            <Calculator aria-hidden="true" />
            <div>
              <p className="eyebrow">第一步实算</p>
              <h2>以 {methodNames[method]}、h={h} 走出第一步</h2>
            </div>
          </div>
          <p>
            起点是 x₀=0, y₀=0.5。当前所选方法走到 x₁={formatFixed(firstStep.x, 2)}，
            得到 y₁≈{formatNumber(firstStep.y, 9)}；解析解给出 {formatNumber(firstStep.exact, 9)}，
            因而第一步误差约为 {formatNumber(firstStep.error, 6)}。
          </p>
          <p>
            注意这里的“误差”不是玄学判断，而是可以被解析解直接核对的数值差。
            当没有解析解时，我们通常用更小步长或更高阶方法作为参考解。
          </p>
        </article>
      </section>

      <section className="chart-band" aria-label="步长误差影响">
        <div className="section-heading">
          <ChartNoAxesCombined aria-hidden="true" />
          <div>
            <p className="eyebrow">步长与误差</p>
            <h2>步长减半，误差按方法阶数下降</h2>
          </div>
        </div>
        <div className="split">
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={330}>
              <BarChart data={convergenceRows} margin={{ top: 20, right: 28, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="4 4" />
                <XAxis dataKey="h" />
                <YAxis scale="log" domain={['auto', 'auto']} width={60} />
                <Tooltip formatter={tooltipNumber} />
                <Legend />
                <Bar dataKey="finalError" name="x=2 误差" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>方法</th>
                  <th>h</th>
                  <th>步数</th>
                  <th>误差</th>
                  <th>减半倍率</th>
                </tr>
              </thead>
              <tbody>
                {convergenceRows.map((row) => (
                  <tr key={`${row.method}-${row.h}`}>
                    <td>{methodNames[row.method]}</td>
                    <td>{row.h}</td>
                    <td>{row.steps}</td>
                    <td>{formatNumber(row.finalError, 5)}</td>
                    <td>{row.ratio === null ? '-' : formatNumber(row.ratio, 4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="insight">
          从表格能读出规律：欧拉法步长减半后误差大约除以 2；RK2 大约除以 4；RK4
          接近除以 16。阶数越高，同样缩短步长时收益越大，但每一步要多算斜率。
        </p>
      </section>

      <section id="code" className="content-grid">
        <article className="lesson-card wide">
          <div className="section-heading">
            <Code2 aria-hidden="true" />
            <div>
              <p className="eyebrow">编程部分</p>
              <h2>引导式 Python：先让程序会问问题，再让它会循环</h2>
            </div>
          </div>
          <p>
            计算思维不是把公式翻译成注释，而是先找最小动作：给我 x、y、h，我能不能产出下一步？
            能产出一步，就能放进循环；能循环，就能比较误差；能比较误差，就能选择方法和步长。
          </p>
        </article>

        {Object.entries(codeBlocks).map(([key, code], index) => (
          <article className="lesson-card code-card" key={key}>
            <div className="step-badge">
              <span>{index + 1}</span>
              <strong>{['定义问题', '先写欧拉一步', '把试走变成修正', '用四个斜率做平均'][index]}</strong>
            </div>
            <pre><code>{code}</code></pre>
            <p>
              {[
                '先把数学对象变成函数。f 只回答“此刻斜率是多少”，exact 只负责验证，不参与数值推进。',
                '欧拉一步是最小可运行单元。写完这一步，就可以用同一个函数重复推进很多次。',
                'RK2 的关键是先生成一个猜测，再用猜测位置的斜率纠正起点斜率的偏差。',
                'RK4 把“多问几次方向”组织成固定模板。它并不神秘，只是更会挑代表斜率。',
              ][index]}
            </p>
          </article>
        ))}
      </section>

      <section id="verify" className="deployment-section">
        <div className="section-heading">
          <Play aria-hidden="true" />
          <div>
            <p className="eyebrow">后端、Julia 与部署</p>
            <h2>本地后端可算，GitHub Pages 可发布，测试覆盖关键路径</h2>
          </div>
        </div>
        <div className="deploy-grid">
          <div>
            <Braces aria-hidden="true" />
            <h3>FastAPI 后端</h3>
            <p>提供 /api/solve 和 /api/convergence。默认 Python 计算，也可以通过 engine=julia 调用 Julia 脚本交叉验证。</p>
          </div>
          <div>
            <Sigma aria-hidden="true" />
            <h3>Julia 数值核验</h3>
            <p>julia/solver.jl 与 Python 使用同一公式和同一组方法，julia/verify.jl 检查误差阶数。</p>
          </div>
          <div>
            <GitBranch aria-hidden="true" />
            <h3>GitHub 部署</h3>
            <p>前端是静态 Vite 构建，GitHub Actions 会运行 lint、build、Python 测试、Julia 校验和 Playwright，再部署 dist。</p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
