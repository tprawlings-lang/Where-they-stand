"""Minimal worker entry point. No collection is started by this command."""
import argparse
import json
from collections.abc import Sequence


def health() -> dict[str, str]:
    return {"service": "where-they-stand-worker", "status": "ok"}


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=["health"])
    args = parser.parse_args(argv)
    if args.command == "health":
        print(json.dumps(health(), sort_keys=True))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
