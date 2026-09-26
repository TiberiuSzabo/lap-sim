import math

import pytest

from app.data import CARS, TRACKS
from app.models import Car, Condition, Segment, Tire, Track
from app.physics import G, max_corner_speed, simulate_lap

TRACK = TRACKS["test-ring"]
GT3 = CARS["911-gt3"]


def make_car(**overrides) -> Car:
    base = dict(id="test", name="Test", mass_kg=1400, power_kw=300,
                drag_area_m2=0.7, lift_area_m2=0.0, top_speed_kmh=300)
    return Car(**{**base, **overrides})


def lap_time(car: Car, tire: Tire, condition: Condition) -> float:
    return simulate_lap(car, TRACK, tire, condition).lap_time_s


@pytest.mark.parametrize("condition, best_tire", [
    (Condition.DRY, Tire.SLICK),
    (Condition.DAMP, Tire.INTERMEDIATE),
    (Condition.WET, Tire.WET),
])
@pytest.mark.parametrize("car", CARS.values(), ids=lambda c: c.id)
def test_right_tire_is_fastest_for_each_condition(car, condition, best_tire):
    times = {tire: lap_time(car, tire, condition) for tire in Tire}
    assert min(times, key=times.get) == best_tire


def test_corner_speed_without_downforce_matches_hand_calculation():
    car = make_car(lift_area_m2=0.0)
    # v = sqrt(mu * g * r) = sqrt(1.0 * 9.81 * 50)
    assert max_corner_speed(car, mu=1.0, radius_m=50) == pytest.approx(math.sqrt(G * 50))


def test_downforce_increases_corner_speed():
    no_wing = make_car(lift_area_m2=0.0)
    wing = make_car(lift_area_m2=1.0)
    assert max_corner_speed(wing, 1.5, 100) > max_corner_speed(no_wing, 1.5, 100)


def test_mass_does_not_change_corner_speed_without_downforce():
    light = make_car(mass_kg=1200)
    heavy = make_car(mass_kg=2200)
    assert max_corner_speed(light, 1.5, 80) == pytest.approx(max_corner_speed(heavy, 1.5, 80))


def test_heavier_car_is_slower_over_a_lap():
    light = make_car(mass_kg=1200)
    heavy = make_car(mass_kg=2200)
    assert lap_time(heavy, Tire.SLICK, Condition.DRY) > lap_time(light, Tire.SLICK, Condition.DRY)


def test_more_power_is_faster_over_a_lap():
    weak = make_car(power_kw=200)
    strong = make_car(power_kw=400)
    assert lap_time(strong, Tire.SLICK, Condition.DRY) < lap_time(weak, Tire.SLICK, Condition.DRY)


def test_speed_never_exceeds_top_speed():
    result = simulate_lap(GT3, TRACK, Tire.SLICK, Condition.DRY)
    assert result.top_speed_kmh <= GT3.top_speed_kmh


def test_constant_radius_circle_is_driven_at_corner_speed():
    circle = Track("circle", "Circle", (Segment.corner(radius_m=50, angle_deg=360),))
    car = make_car()
    result = simulate_lap(car, circle, Tire.SLICK, Condition.DRY)

    expected_speed = max_corner_speed(car, mu=1.6, radius_m=50)
    assert result.lap_time_s == pytest.approx(circle.length_m / expected_speed, rel=1e-3)


def test_telemetry_covers_whole_lap():
    result = simulate_lap(GT3, TRACK, Tire.SLICK, Condition.DRY)
    assert result.telemetry[0].distance_m == 0
    assert result.telemetry[-1].distance_m > TRACK.length_m - 20
    assert all(p.speed_kmh > 0 for p in result.telemetry)
