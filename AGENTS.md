# Repository working instructions

This is the source repository for https://xiaoqiuyi.me/.

- The current application is `server.py` and `public/`. `dist/` and `site/` are legacy static sources.
- The owner has authorized uploading website code changes to `QuinnFreeze/Freeze-s-life` and keeping subsequent production code changes synchronized automatically. After relevant changes, run the appropriate checks and commit/push the authorized code without asking again.
- The production source of truth is `/opt/freeze-nest/releases/<release>/`, selected by the running `freeze-nest-nest-1` container image `freeze-nest:<release>`. The dedicated checkout `/opt/freeze-nest/source-repository` is maintained by `freeze-nest-github-sync.timer`. Make changes in a development checkout and deploy a matching release; the timer then uploads that release. Direct edits to mirrored files in the synchronization checkout may be replaced by the production source.
- Do not put production databases, private keys, account credentials, environment files, uploaded media, backup archives, or deployment records into this public repository.
- Keep tests isolated from production data. Do not use `deploy/production_smoke.py` as a read-only check: it writes authenticated test content.
- Uploading source is separate from deployment. This task does not authorize unrelated changes to the running site, Caddy, Komari, or DNS.
- See `docs/github-sync.md` for sync operation and troubleshooting.
