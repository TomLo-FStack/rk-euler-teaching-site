using Printf

const MethodName = String

derivative(x, y) = y - x^2 + 1.0
exact_solution(x) = (x + 1.0)^2 - 0.5 * exp(x)

function euler_step(f, x, y, h)
    y + h * f(x, y)
end

function rk2_step(f, x, y, h)
    k1 = f(x, y)
    k2 = f(x + h, y + h * k1)
    y + h * (k1 + k2) / 2.0
end

function rk4_step(f, x, y, h)
    k1 = f(x, y)
    k2 = f(x + h / 2.0, y + h * k1 / 2.0)
    k3 = f(x + h / 2.0, y + h * k2 / 2.0)
    k4 = f(x + h, y + h * k3)
    y + h * (k1 + 2.0 * k2 + 2.0 * k3 + k4) / 6.0
end

function step_for(method::MethodName)
    if method == "euler"
        return euler_step
    elseif method == "rk2"
        return rk2_step
    elseif method == "rk4"
        return rk4_step
    end
    error("unknown method: $method")
end

function solve(method::MethodName; h=0.2, x0=0.0, y0=0.5, x_end=2.0)
    h > 0 || error("h must be positive")
    x_end > x0 || error("x_end must be greater than x0")

    step = step_for(method)
    x = x0
    y = y0
    points = Vector{NamedTuple}()
    push!(points, (n=0, x=x, y=y, exact=exact_solution(x), error=abs(y - exact_solution(x))))
    n = 0
    while x < x_end - 1e-12
        step_h = min(h, x_end - x)
        y = step(derivative, x, y, step_h)
        x += step_h
        n += 1
        exact = exact_solution(x)
        push!(points, (n=n, x=x, y=y, exact=exact, error=abs(y - exact)))
    end
    points
end

function convergence_table(h_values=[0.4, 0.2, 0.1, 0.05, 0.025], methods=["euler", "rk2", "rk4"])
    rows = Vector{NamedTuple}()
    for method in methods
        previous_error = nothing
        for h in h_values
            points = solve(method; h=h)
            final_error = points[end].error
            ratio = previous_error === nothing ? nothing : previous_error / final_error
            push!(rows, (method=method, h=h, steps=length(points)-1, finalError=final_error, ratio=ratio))
            previous_error = final_error
        end
    end
    rows
end

function json_number(value)
    @sprintf("%.15g", value)
end

function point_json(point)
    "{\"n\":$(point.n),\"x\":$(json_number(point.x)),\"y\":$(json_number(point.y)),\"exact\":$(json_number(point.exact)),\"error\":$(json_number(point.error))}"
end

function solve_json(method, h, x_end)
    points = solve(method; h=h, x_end=x_end)
    points_json = join(point_json.(points), ",")
    "{\"engine\":\"julia\",\"method\":\"$method\",\"h\":$(json_number(h)),\"x_end\":$(json_number(x_end)),\"points\":[$points_json]}"
end

if abspath(PROGRAM_FILE) == @__FILE__
    method = length(ARGS) >= 1 ? ARGS[1] : "rk4"
    h = length(ARGS) >= 2 ? parse(Float64, ARGS[2]) : 0.2
    x_end = length(ARGS) >= 3 ? parse(Float64, ARGS[3]) : 2.0
    println(solve_json(method, h, x_end))
end
