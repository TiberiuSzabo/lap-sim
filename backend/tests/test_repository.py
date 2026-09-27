import os
from datetime import datetime, timezone

import pytest
from pymongo import MongoClient

from app.repository import InMemoryRunRepository, MongoRunRepository

MONGO_URL = os.environ.get("MONGO_URL")
TEST_DB = "lapsim_test"


# The same tests run against every implementation: that is what makes them interchangeable.
@pytest.fixture(params=["memory", "mongo"])
def repo(request):
    if request.param == "memory":
        return InMemoryRunRepository()
    if not MONGO_URL:
        pytest.skip("MONGO_URL not set")
    MongoClient(MONGO_URL).drop_database(TEST_DB)
    return MongoRunRepository(MONGO_URL, db_name=TEST_DB)


def make_run(lap_time_s: float = 70.0) -> dict:
    return {
        "lap_time_s": lap_time_s,
        "created_at": datetime(2026, 9, 27, 12, 0, tzinfo=timezone.utc),
        "telemetry": [{"distance_m": 0.0, "speed_kmh": 100.0}],
    }


def test_added_run_can_be_fetched_with_telemetry(repo):
    run_id = repo.add(make_run(68.4))

    run = repo.get(run_id)

    assert run["id"] == run_id
    assert run["lap_time_s"] == 68.4
    assert run["telemetry"] == [{"distance_m": 0.0, "speed_kmh": 100.0}]


def test_created_at_keeps_its_timezone(repo):
    run = repo.get(repo.add(make_run()))

    assert run["created_at"] == datetime(2026, 9, 27, 12, 0, tzinfo=timezone.utc)


def test_list_latest_respects_limit_and_order(repo):
    ids = [repo.add(make_run(t)) for t in (70.0, 71.0, 72.0)]

    latest = repo.list_latest(limit=2)

    assert [run["id"] for run in latest] == [ids[2], ids[1]]


def test_list_latest_has_no_telemetry(repo):
    repo.add(make_run())

    assert "telemetry" not in repo.list_latest(limit=20)[0]


def test_list_latest_does_not_modify_stored_run(repo):
    run_id = repo.add(make_run())

    repo.list_latest(limit=20)

    assert repo.get(run_id)["telemetry"] == [{"distance_m": 0.0, "speed_kmh": 100.0}]


@pytest.mark.parametrize("run_id", ["does-not-exist", "0123456789abcdef01234567"])
def test_unknown_id_returns_none(repo, run_id):
    assert repo.get(run_id) is None


def test_add_does_not_modify_the_given_run(repo):
    run = make_run()

    repo.add(run)

    assert set(run) == {"lap_time_s", "created_at", "telemetry"}
