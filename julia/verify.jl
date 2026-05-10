include("solver.jl")

function assert_condition(condition, message)
    condition || error(message)
end

euler_error = solve("euler"; h=0.2)[end].error
rk2_error = solve("rk2"; h=0.2)[end].error
rk4_error = solve("rk4"; h=0.2)[end].error

assert_condition(euler_error > rk2_error > rk4_error, "method order comparison failed")
assert_condition(rk4_error < 2e-4, "RK4 error is too large")

for method in ["euler", "rk2", "rk4"]
    error_h = solve(method; h=0.2)[end].error
    error_half = solve(method; h=0.1)[end].error
    ratio = error_h / error_half
    if method == "euler"
        assert_condition(1.7 < ratio < 2.3, "Euler ratio outside first-order band")
    elseif method == "rk2"
        assert_condition(3.5 < ratio < 4.5, "RK2 ratio outside second-order band")
    else
        assert_condition(12.0 < ratio < 18.0, "RK4 ratio outside fourth-order band")
    end
end

println("Julia numerical verification passed.")
