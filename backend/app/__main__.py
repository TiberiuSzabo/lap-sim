from .data import CARS, TRACKS
from .models import Condition, Tire
from .physics import simulate_lap


def format_time(seconds: float) -> str:
    minutes, rest = divmod(seconds, 60)
    return f"{int(minutes)}:{rest:06.3f}"


def main() -> None:
    track = TRACKS["test-ring"]
    print(f"{track.name} - {track.length_m:.0f} m\n")
    for condition in Condition:
        print(f"== {condition.value.upper()} ==")
        for car in CARS.values():
            times = [
                f"{tire.value}: {format_time(simulate_lap(car, track, tire, condition).lap_time_s)}"
                for tire in Tire
            ]
            print(f"  {car.name:<20} " + "  ".join(times))
        print()


if __name__ == "__main__":
    main()
