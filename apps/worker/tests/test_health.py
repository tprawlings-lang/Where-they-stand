from where_they_stand_worker.main import health, main

def test_health() -> None:
    assert health() == {"service": "where-they-stand-worker", "status": "ok"}

def test_health_command(capsys: object) -> None:
    assert main(["health"]) == 0
