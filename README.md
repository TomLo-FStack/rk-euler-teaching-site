# Runge-Kutta 与 Euler 教学网站

一个面向初学者的数值分析教学网站，围绕初值问题 `y' = y - x^2 + 1, y(0)=0.5`，从欧拉法讲到二阶与四阶 Runge-Kutta，并用误差表说明步长变化的影响。

## 技术结构

- 前端：Vite + React + TypeScript + Recharts + lucide-react
- 后端：FastAPI，提供 `/api/solve` 与 `/api/convergence`
- 数值核心：Python 与 Julia 两套实现，使用同一方程和同一误差校验
- 验证：TypeScript 构建、ESLint、pytest、Julia verify、Playwright
- 部署：GitHub Actions 构建 `dist` 并发布到 GitHub Pages

## 本地运行

```bash
npm install
python -m pip install -r backend/requirements.txt
npm run dev
```

另开一个终端运行后端：

```bash
npm run api
```

后端地址：

- `http://127.0.0.1:8000/api/solve?method=rk4&h=0.2`
- `http://127.0.0.1:8000/api/solve?method=rk4&h=0.2&engine=julia`
- `http://127.0.0.1:8000/api/convergence`

## 验证命令

```bash
npm run lint
npm run build
npm run test:python
npm run test:julia
npx playwright install chromium
npm run test:e2e
```

## GitHub Pages 部署

1. 把项目推送到 GitHub 仓库的 `main` 分支。
2. 在仓库设置里启用 Pages，并选择 GitHub Actions 作为部署来源。
3. `.github/workflows/deploy.yml` 会先执行 lint、构建、Python/Julia 数值校验和 Playwright 浏览器测试，再发布 `dist`。

## 教学内容覆盖

- 数学部分：问题引入、欧拉法推导、RK2 推导、RK4 推导、第一步实算、误差阶解释
- 编程部分：以 Python 为主线，用“先定义问题、再写一步、再循环比较误差”的方式培养计算思维
- 比较实验：同一图表展示解析解、欧拉法、RK2、RK4；误差表展示步长减半时误差变化
- 双语言验证：`backend/solver.py` 和 `julia/solver.jl` 保持同一算法，分别由 `pytest` 与 `julia/verify.jl` 检查
