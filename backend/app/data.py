# Mock data. Car figures are approximate public specs, rounded; aero values are estimates.
from .models import Car, Condition, Segment, Tire, Track

CARS: dict[str, Car] = {
    car.id: car
    for car in (
        Car("911-gt3", "911 GT3 (992)", mass_kg=1435, power_kw=375,
            drag_area_m2=0.74, lift_area_m2=0.80, top_speed_kmh=318),
        Car("cayman-gt4rs", "718 Cayman GT4 RS", mass_kg=1415, power_kw=368,
            drag_area_m2=0.72, lift_area_m2=0.60, top_speed_kmh=315),
        Car("taycan-turbo-gt", "Taycan Turbo GT", mass_kg=2295, power_kw=580,
            drag_area_m2=0.52, lift_area_m2=0.30, top_speed_kmh=290),
    )
}

# Friction coefficient (mu) per tire and track condition.
# Picked so each tire wins in "its" condition: slick on dry, inter on damp, wet on wet.
GRIP: dict[tuple[Tire, Condition], float] = {
    (Tire.SLICK, Condition.DRY): 1.60,
    (Tire.SLICK, Condition.DAMP): 1.00,
    (Tire.SLICK, Condition.WET): 0.50,
    (Tire.INTERMEDIATE, Condition.DRY): 1.30,
    (Tire.INTERMEDIATE, Condition.DAMP): 1.15,
    (Tire.INTERMEDIATE, Condition.WET): 0.85,
    (Tire.WET, Condition.DRY): 1.10,
    (Tire.WET, Condition.DAMP): 1.05,
    (Tire.WET, Condition.WET): 0.95,
}


def grip_coefficient(tire: Tire, condition: Condition) -> float:
    return GRIP[(tire, condition)]


TRACKS: dict[str, Track] = {
    "test-ring": Track(
        id="test-ring",
        name="Cluj Test Ring",
        segments=(
            Segment.straight(800),
            Segment.corner(radius_m=20, angle_deg=150),   # hairpin
            Segment.straight(300),
            Segment.corner(radius_m=60, angle_deg=90),
            Segment.straight(200),
            Segment.corner(radius_m=150, angle_deg=60),   # fast corner
            Segment.straight(500),
            Segment.corner(radius_m=35, angle_deg=100),
            Segment.straight(250),
            Segment.corner(radius_m=300, angle_deg=45),   # sweeper
            Segment.straight(400),
            Segment.corner(radius_m=45, angle_deg=120),
            Segment.straight(150),
        ),
    ),
}
