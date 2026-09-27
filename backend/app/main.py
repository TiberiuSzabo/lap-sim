import os
from dataclasses import asdict
from datetime import datetime, timezone
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .data import CARS, TRACKS
from .physics import simulate_lap
from .repository import InMemoryRunRepository, MongoRunRepository, RunRepository
from .schemas import CarOut, RunOut, RunSummary, SimulateRequest, TrackOut

app = FastAPI(title="Lap Sim API")

# The React dev server (Vite) runs on another port, so the browser only lets it call us
# if we list its origin here.
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


def create_repository() -> RunRepository:
    # Without MONGO_URL the app still runs (e.g. a quick local try), but runs vanish on restart.
    mongo_url = os.environ.get("MONGO_URL")
    if mongo_url:
        return MongoRunRepository(mongo_url)
    return InMemoryRunRepository()


_repository = create_repository()


def get_repository() -> RunRepository:
    return _repository


Repository = Annotated[RunRepository, Depends(get_repository)]


@app.get("/api/cars")
def list_cars() -> list[CarOut]:
    return [CarOut.model_validate(car) for car in CARS.values()]


@app.get("/api/tracks")
def list_tracks() -> list[TrackOut]:
    return [TrackOut.model_validate(track) for track in TRACKS.values()]


@app.post("/api/simulate", status_code=201)
def simulate(request: SimulateRequest, repo: Repository) -> RunOut:
    car = CARS.get(request.car_id)
    if car is None:
        raise HTTPException(status_code=404, detail=f"Unknown car: {request.car_id}")
    track = TRACKS.get(request.track_id)
    if track is None:
        raise HTTPException(status_code=404, detail=f"Unknown track: {request.track_id}")

    result = simulate_lap(car, track, request.tire, request.condition)
    # mode="json" turns the enums into plain strings, which is what the database should store.
    run = {
        **request.model_dump(mode="json"),
        **asdict(result),
        "created_at": datetime.now(timezone.utc),
    }
    run_id = repo.add(run)
    return RunOut(id=run_id, **run)


@app.get("/api/runs")
def list_runs(repo: Repository) -> list[RunSummary]:
    return [RunSummary.model_validate(run) for run in repo.list_latest(limit=20)]


@app.get("/api/runs/{run_id}")
def get_run(run_id: str, repo: Repository) -> RunOut:
    run = repo.get(run_id)
    if run is None:
        raise HTTPException(status_code=404, detail=f"Unknown run: {run_id}")
    return RunOut.model_validate(run)
