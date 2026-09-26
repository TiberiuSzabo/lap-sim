"""Point-mass lap simulation.

The car is treated as a single point on the racing line. For every metre of track we compute
the fastest speed allowed by grip, power and braking, then integrate time = distance / speed.
"""
from dataclasses import dataclass
import math

from .data import grip_coefficient
from .models import Car, Condition, Tire, Track

G = 9.81             # m/s^2
AIR_DENSITY = 1.225  # kg/m^3
STEP_M = 1.0         # track resolution
TELEMETRY_EVERY_M = 10


@dataclass(frozen=True)
class TelemetryPoint:
    distance_m: float
    speed_kmh: float


@dataclass(frozen=True)
class LapResult:
    lap_time_s: float
    top_speed_kmh: float
    min_speed_kmh: float
    telemetry: list[TelemetryPoint]


def drag_force(car: Car, v: float) -> float:
    return 0.5 * AIR_DENSITY * car.drag_area_m2 * v**2


def grip_force(car: Car, mu: float, v: float) -> float:
    # Downforce pushes the tires into the road, so it adds to the weight they can use.
    downforce = 0.5 * AIR_DENSITY * car.lift_area_m2 * v**2
    return mu * (car.mass_kg * G + downforce)


def max_corner_speed(car: Car, mu: float, radius_m: float) -> float:
    # Grip must provide the centripetal force: m*v^2/r = mu*(m*g + 0.5*rho*ClA*v^2).
    # Solving for v^2 gives the formula below.
    denominator = 1 - mu * AIR_DENSITY * car.lift_area_m2 * radius_m / (2 * car.mass_kg)
    if denominator <= 0:
        # Downforce grows as fast as the grip needed: the corner is flat-out.
        return car.top_speed_ms
    return min(math.sqrt(mu * G * radius_m / denominator), car.top_speed_ms)


def acceleration(car: Car, mu: float, v: float) -> float:
    # Power limits force at high speed (F = P / v); grip limits it at low speed (wheelspin).
    engine_force = car.power_w / max(v, 1.0)
    drive_force = min(engine_force, grip_force(car, mu, v))
    return (drive_force - drag_force(car, v)) / car.mass_kg


def deceleration(car: Car, mu: float, v: float) -> float:
    # Braking uses all the grip, and drag helps slow the car down.
    return (grip_force(car, mu, v) + drag_force(car, v)) / car.mass_kg


def speed_limits(car: Car, track: Track, mu: float) -> list[float]:
    limits: list[float] = []
    for segment in track.segments:
        points = max(1, round(segment.length_m / STEP_M))
        if segment.radius_m is None:
            limit = car.top_speed_ms
        else:
            limit = max_corner_speed(car, mu, segment.radius_m)
        limits.extend([limit] * points)
    return limits


def simulate_lap(car: Car, track: Track, tire: Tire, condition: Condition) -> LapResult:
    mu = grip_coefficient(tire, condition)
    v = speed_limits(car, track, mu)
    n = len(v)

    # Forward pass: how fast can we be here, accelerating out of the previous point?
    # Two laps, so the start line "knows" the speed carried from the end of the lap.
    for _ in range(2):
        for i in range(n):
            j = (i + 1) % n
            reachable = math.sqrt(max(v[i] ** 2 + 2 * acceleration(car, mu, v[i]) * STEP_M, 0))
            v[j] = min(v[j], reachable)

    # Backward pass: how fast can we be here and still brake in time for the next point?
    for _ in range(2):
        for i in reversed(range(n)):
            j = (i + 1) % n
            brakeable = math.sqrt(v[j] ** 2 + 2 * deceleration(car, mu, v[j]) * STEP_M)
            v[i] = min(v[i], brakeable)

    lap_time = sum(STEP_M / ((v[i] + v[(i + 1) % n]) / 2) for i in range(n))

    telemetry = [
        TelemetryPoint(distance_m=i * STEP_M, speed_kmh=round(v[i] * 3.6, 1))
        for i in range(0, n, round(TELEMETRY_EVERY_M / STEP_M))
    ]

    return LapResult(
        lap_time_s=round(lap_time, 3),
        top_speed_kmh=round(max(v) * 3.6, 1),
        min_speed_kmh=round(min(v) * 3.6, 1),
        telemetry=telemetry,
    )
