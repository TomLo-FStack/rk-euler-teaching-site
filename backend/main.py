from __future__ import annotations

import json
import subprocess
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.solver import MethodName, as_dicts, convergence_table, solve

ROOT = Path(__file__).resolve().parents[1]
JULIA_SOLVER = ROOT / "julia" / "solver.jl"

app = FastAPI(
    title="Runge-Kutta 与 Euler 教学 API",
    version="1.0.0",
    description="为前端教学网站提供欧拉法、二阶 Runge-Kutta 与四阶 Runge-Kutta 的可验证数值结果。",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class SolveResponse(BaseModel):
    engine: Literal["python", "julia"]
    method: MethodName
    h: float = Field(gt=0)
    x_end: float
    points: list[dict[str, float | int]]


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/solve", response_model=SolveResponse)
def solve_api(
    method: MethodName = Query("rk4"),
    h: float = Query(0.2, gt=0, le=1.0),
    x_end: float = Query(2.0, gt=0, le=5.0),
    engine: Literal["python", "julia"] = Query("python"),
) -> SolveResponse:
    if engine == "python":
        return SolveResponse(engine=engine, method=method, h=h, x_end=x_end, points=as_dicts(solve(method, h=h, x_end=x_end)))

    completed = subprocess.run(
        ["julia", str(JULIA_SOLVER), method, str(h), str(x_end)],
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
        timeout=30,
    )
    if completed.returncode != 0:
        raise HTTPException(status_code=502, detail=completed.stderr.strip() or completed.stdout.strip())
    payload = json.loads(completed.stdout)
    return SolveResponse(**payload)


@app.get("/api/convergence")
def convergence_api() -> dict[str, list[dict[str, float | str | None]]]:
    return {"rows": convergence_table()}
