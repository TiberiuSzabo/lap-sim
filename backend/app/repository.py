from typing import Protocol
from uuid import uuid4

from bson import ObjectId
from bson.errors import InvalidId
from pymongo import DESCENDING, MongoClient


class RunRepository(Protocol):
    def add(self, run: dict) -> str: ...

    def list_latest(self, limit: int) -> list[dict]:
        """Newest first, without telemetry (it is the heavy part of a run)."""
        ...

    def get(self, run_id: str) -> dict | None: ...


class InMemoryRunRepository:
    def __init__(self) -> None:
        self._runs: dict[str, dict] = {}

    def add(self, run: dict) -> str:
        run_id = uuid4().hex
        self._runs[run_id] = {**run, "id": run_id}
        return run_id

    def list_latest(self, limit: int) -> list[dict]:
        # Dicts keep insertion order, so reversing gives newest first without relying on
        # timestamps (two runs can share the same timestamp on Windows).
        newest_first = list(reversed(self._runs.values()))[:limit]
        return [{k: v for k, v in run.items() if k != "telemetry"} for run in newest_first]

    def get(self, run_id: str) -> dict | None:
        return self._runs.get(run_id)


class MongoRunRepository:
    def __init__(self, url: str, db_name: str = "lapsim") -> None:
        # tz_aware: otherwise pymongo returns created_at without its UTC timezone.
        # Short timeout: fail in 3 s with a clear error instead of hanging 30 s if Mongo is down.
        client = MongoClient(url, tz_aware=True, serverSelectionTimeoutMS=3000)
        self._runs = client[db_name]["runs"]

    def add(self, run: dict) -> str:
        # Copy, because insert_one adds an "_id" key to the dict it receives.
        result = self._runs.insert_one(dict(run))
        return str(result.inserted_id)

    def list_latest(self, limit: int) -> list[dict]:
        # ObjectIds grow over time, so sorting by _id gives newest first, even for equal timestamps.
        cursor = self._runs.find({}, {"telemetry": 0}).sort("_id", DESCENDING).limit(limit)
        return [_from_document(doc) for doc in cursor]

    def get(self, run_id: str) -> dict | None:
        try:
            object_id = ObjectId(run_id)
        except InvalidId:
            return None
        document = self._runs.find_one({"_id": object_id})
        return _from_document(document) if document else None


def _from_document(document: dict) -> dict:
    document["id"] = str(document.pop("_id"))
    return document
