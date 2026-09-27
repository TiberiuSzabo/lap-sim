# API shapes, kept separate from the domain dataclasses so the physics never depends on the HTTP layer.
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from .models import Condition, Tire


class CarOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    mass_kg: float
    power_kw: float
    top_speed_kmh: float


class TrackOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    length_m: float


class SimulateRequest(BaseModel):
    car_id: str
    track_id: str
    tire: Tire
    condition: Condition


class TelemetryPointOut(BaseModel):
    distance_m: float
    speed_kmh: float


class RunSummary(BaseModel):
    id: str
    created_at: datetime
    car_id: str
    track_id: str
    tire: Tire
    condition: Condition
    lap_time_s: float
    top_speed_kmh: float
    min_speed_kmh: float


class RunOut(RunSummary):
    telemetry: list[TelemetryPointOut]
