import pytest
from fastapi.testclient import TestClient

from app.data import CARS, TRACKS
from app.main import app, get_repository
from app.models import Condition, Tire
from app.physics import simulate_lap
from app.repository import InMemoryRunRepository

VALID_REQUEST = {"car_id": "911-gt3", "track_id": "test-ring", "tire": "slick", "condition": "dry"}


@pytest.fixture
def client():
    # One fresh repository per test, shared by every request inside that test.
    repo = InMemoryRunRepository()
    app.dependency_overrides[get_repository] = lambda: repo
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_list_cars_returns_every_car(client):
    response = client.get("/api/cars")

    assert response.status_code == 200
    assert {car["id"] for car in response.json()} == set(CARS)


def test_cars_do_not_expose_aero_estimates(client):
    car = client.get("/api/cars").json()[0]

    assert "drag_area_m2" not in car
    assert "lift_area_m2" not in car


def test_list_tracks_includes_computed_length(client):
    tracks = client.get("/api/tracks").json()

    assert [t["id"] for t in tracks] == list(TRACKS)
    assert tracks[0]["length_m"] == TRACKS["test-ring"].length_m


def test_simulate_returns_same_result_as_physics(client):
    response = client.post("/api/simulate", json=VALID_REQUEST)

    assert response.status_code == 201
    body = response.json()
    expected = simulate_lap(CARS["911-gt3"], TRACKS["test-ring"], Tire.SLICK, Condition.DRY)
    assert body["lap_time_s"] == expected.lap_time_s
    assert body["tire"] == "slick"
    assert len(body["telemetry"]) == len(expected.telemetry)


@pytest.mark.parametrize("field, value", [("car_id", "ferrari"), ("track_id", "monza")])
def test_simulate_unknown_id_returns_404(client, field, value):
    response = client.post("/api/simulate", json={**VALID_REQUEST, field: value})

    assert response.status_code == 404
    assert value in response.json()["detail"]


@pytest.mark.parametrize("field, value", [("tire", "banana"), ("condition", "snow")])
def test_simulate_invalid_tire_or_condition_returns_422(client, field, value):
    response = client.post("/api/simulate", json={**VALID_REQUEST, field: value})

    assert response.status_code == 422


def test_simulate_missing_field_returns_422(client):
    request = {k: v for k, v in VALID_REQUEST.items() if k != "tire"}

    assert client.post("/api/simulate", json=request).status_code == 422


def test_simulated_run_can_be_fetched_by_id(client):
    created = client.post("/api/simulate", json=VALID_REQUEST).json()

    response = client.get(f"/api/runs/{created['id']}")

    assert response.status_code == 200
    assert response.json() == created


def test_run_history_is_newest_first_and_has_no_telemetry(client):
    first = client.post("/api/simulate", json=VALID_REQUEST).json()
    second = client.post("/api/simulate", json={**VALID_REQUEST, "condition": "wet"}).json()

    runs = client.get("/api/runs").json()

    assert [run["id"] for run in runs] == [second["id"], first["id"]]
    assert all("telemetry" not in run for run in runs)


def test_run_history_starts_empty(client):
    assert client.get("/api/runs").json() == []


def test_unknown_run_returns_404(client):
    assert client.get("/api/runs/does-not-exist").status_code == 404


def test_cors_allows_the_vite_dev_server(client):
    response = client.get("/api/cars", headers={"Origin": "http://localhost:5173"})

    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_cors_does_not_allow_other_sites(client):
    response = client.get("/api/cars", headers={"Origin": "https://evil.example"})

    assert "access-control-allow-origin" not in response.headers


def test_cors_preflight_allows_json_post(client):
    # Before a JSON POST, the browser first asks with OPTIONS whether it is allowed.
    response = client.options("/api/simulate", headers={
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
    })

    assert response.status_code == 200
    assert "POST" in response.headers["access-control-allow-methods"]
