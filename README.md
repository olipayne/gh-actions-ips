# Cloudflare Worker + D1: Collecting IP Addresses

This project demonstrates:
1. A Cloudflare Worker that stores incoming request IPs in a D1 database.
2. A scheduled GitHub Action that pings the Worker every 5 minutes.

## How It Works

1. **Worker Endpoint**  
   - When visited at `?secret=xyz123` (or your own secret), it:
     - Grabs the caller’s IP.
     - Inserts/updates IP info in D1 (count and last_seen).
   - A `GET /results` path returns all records from the D1 table.

2. **GitHub Action**  
   - Runs on a cron schedule (every 5 minutes).
   - Pings the Worker using a secret stored in GitHub Secrets.

## Setup

1. **Create D1 Database**  
   - In your Cloudflare dashboard, create a D1 database (e.g., `github_actions_ips`).
   - Define a table named `requests`:
     ```sql
     CREATE TABLE IF NOT EXISTS requests (
       ip TEXT PRIMARY KEY,
       count INTEGER NOT NULL DEFAULT 0,
       last_seen TEXT
     );
     ```
   - (Optional) Store migrations in `migrations/` and run `wrangler d1 migrations apply`.

