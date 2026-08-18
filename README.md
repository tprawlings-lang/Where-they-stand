# Where They Stand

Where They Stand is a nonpartisan platform that documents where federal candidates stand on specific legislative proposals.

The platform does not endorse candidates, parties, or policy positions.

Every candidate position must be supported by traceable public evidence.

Party affiliation must never be used to infer a candidate's position.

## Developer Setup

```bash
git clone https://github.com/tprawlings-lang/Where-they-stand.git
cd Where-they-stand
corepack enable
corepack prepare pnpm@10.15.1 --activate
pnpm install
docker compose -f infra/docker/docker-compose.yml up -d
cp .env.example .env
pnpm dev
```

Run the worker health check in a second terminal:

```bash
cd apps/worker
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -e '.[dev]'
wts-worker health
```

Use `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` for the TypeScript workspace. From `apps/worker`, use `ruff check .`, `mypy src tests`, and `pytest` for the Python stack.
