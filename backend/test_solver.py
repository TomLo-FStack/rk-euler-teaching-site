from __future__ import annotations

from backend.solver import convergence_table, solve


def test_reference_errors_decrease_with_method_order() -> None:
    h = 0.2
    euler_error = solve("euler", h=h)[-1].error
    rk2_error = solve("rk2", h=h)[-1].error
    rk4_error = solve("rk4", h=h)[-1].error

    assert euler_error > rk2_error > rk4_error
    assert rk4_error < 2e-4


def test_halving_step_reveals_expected_error_orders() -> None:
    rows = convergence_table([0.2, 0.1])
    ratio_by_method = {row["method"]: row["ratio"] for row in rows if row["ratio"] is not None}

    assert 1.7 < ratio_by_method["euler"] < 2.3
    assert 3.5 < ratio_by_method["rk2"] < 4.5
    assert 12.0 < ratio_by_method["rk4"] < 18.0


def test_solver_hits_requested_end_point_with_partial_last_step() -> None:
    points = solve("rk4", h=0.3, x_end=2.0)
    assert abs(points[-1].x - 2.0) < 1e-12
    assert points[-1].error < 7e-4
