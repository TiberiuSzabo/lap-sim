from dataclasses import dataclass
from enum import Enum
import math


class Tire(str, Enum):
    SLICK = "slick"
    INTERMEDIATE = "intermediate"
    WET = "wet"


class Condition(str, Enum):
    DRY = "dry"
    DAMP = "damp"
    WET = "wet"


@dataclass(frozen=True)
class Car:
    id: str
    name: str
    mass_kg: float
    power_kw: float
    drag_area_m2: float  # Cd * frontal area
    lift_area_m2: float  # Cl * frontal area (downforce)
    top_speed_kmh: float

    @property
    def power_w(self) -> float:
        return self.power_kw * 1000

    @property
    def top_speed_ms(self) -> float:
        return self.top_speed_kmh / 3.6


@dataclass(frozen=True)
class Segment:
    length_m: float
    radius_m: float | None = None  # None = straight

    @classmethod
    def straight(cls, length_m: float) -> "Segment":
        return cls(length_m=length_m)

    @classmethod
    def corner(cls, radius_m: float, angle_deg: float) -> "Segment":
        return cls(length_m=radius_m * math.radians(angle_deg), radius_m=radius_m)


@dataclass(frozen=True)
class Track:
    id: str
    name: str
    segments: tuple[Segment, ...]

    @property
    def length_m(self) -> float:
        return sum(s.length_m for s in self.segments)
