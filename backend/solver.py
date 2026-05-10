from __future__ import annotations

from dataclasses import dataclass
from math import exp
from typing import Callable, Literal

MethodName = Literal["euler", "rk2", "rk4"]


def derivative(x: float, y: float) -> float:
    return y - x * x + 1.0


def exact_solution(x: float) -> float:
    return (x + 1.0) ** 2 - 0.5 * exp(x)


def euler_step(f: Callable[[float, float], float], x: float, y: float, h: float) -> float:
    return y + h * f(x, y)


def rk2_step(f: Callable[[float, float], float], x: float, y: float, h: float) -> float:
    k1 = f(x, y)
    k2 = f(x + h, y + h * k1)
    return y + h * (k1 + k2) / 2.0


def rk4_step(f: Callable[[float, float], float], x: float, y: float, h: float) -> float:
    k1 = f(x, y)
    k2 = f(x + h / 2.0, y + h * k1 / 2.0)
    k3 = f(x + h / 2.0, y + h * k2 / 2.0)
    k4 = f(x + h, y + h * k3)
    return y + h * (k1 + 2.0 * k2 + 2.0 * k3 + k4) / 6.0


STEP_FUNCTIONS: dict[MethodName, Callable[[Callable[[float, float], float], float, float, float], float]] = {
    "euler": euler_step,
    "rk2": rk2_step,
    "rk4": rk4_step,
}


@dataclass(frozen=True)
class StepPoint:
    n: int
    x: float
    y: float
    exact: float
    error: float


def solve(method: MethodName, h: float = 0.2, x0: float = 0.0, y0: float = 0.5, x_end: float = 2.0) -> list[StepPoint]:
    if method not in STEP_FUNCTIONS:
        raise ValueError(f"unknown method: {method}")
    if h <= 0:
        raise ValueError("h must be positive")
    if x_end <= x0:
        raise ValueError("x_end must be greater than x0")

    step = STEP_FUNCTIONS[method]
    x = x0
    y = y0
    points = [StepPoint(0, x, y, exact_solution(x), abs(y - exact_solution(x)))]
    n = 0
    while x < x_end - 1e-12:
        step_h = min(h, x_end - x)
        y = step(derivative, x, y, step_h)
        x += step_h
        n += 1
        exact = exact_solution(x)
        points.append(StepPoint(n, x, y, exact, abs(y - exact)))
    return points


def convergence_table(
    h_values: list[float] | None = None,
    methods: tuple[MethodName, ...] = ("euler", "rk2", "rk4"),
) -> list[dict[str, float | str | None]]:
    if h_values is None:
        h_values = [0.4, 0.2, 0.1, 0.05, 0.025]

    rows: list[dict[str, float | str | None]] = []
    for method in methods:
        previous_error: float | None = None
        for h in h_values:
            points = solve(method, h=h)
            final_error = points[-1].error
            ratio = None if previous_error is None else previous_error / final_error
            rows.append(
                {
                    "method": method,
                    "h": h,
                    "steps": len(points) - 1,
                    "finalError": final_error,
                    "ratio": ratio,
                }
            )
            previous_error = final_error
    return rows


def as_dicts(points: list[StepPoint]) -> list[dict[str, float | int]]:
    return [
        {
            "n": point.n,
            "x": point.x,
            "y": point.y,
            "exact": point.exact,
            "error": point.error,
        }
        for point in points
    ]


if __name__ == "__main__":
    for row in convergence_table():
        print(row)
