# Local Run Guide

This project has two parts:

- Backend: Ruby on Rails API
- Frontend: React + Vite

## Quick Start (Windows)

If you want the easiest option, just double-click this file from the project root:

```text
start-project.bat
```

This will start both the backend and frontend in separate windows at the same time.

The script reads local PostgreSQL values from environment variables instead of hardcoding them, so it is safer to use and easier to adapt for your own machine.

## 1) Prerequisites

Install these on your machine before starting:

- Ruby 3.4.x
- Bundler
- Node.js 20+
- npm
- PostgreSQL 17 or 18
- Git

Make sure PostgreSQL is running locally and accessible on port 5432.

## 2) Start the backend

Open a terminal in the backend folder:

```bash
cd backend
bundle install
```

Set the database environment variables for your local PostgreSQL installation:

```bash
$env:PGPASSWORD = "postgres"
$env:POSTGRES_HOST = "127.0.0.1"
$env:POSTGRES_USER = "postgres"
```

Then initialize the database:

```bash
bundle exec rails db:prepare
```

Now start the Rails API:

```bash
bundle exec rails server -b 0.0.0.0 -p 3000
```

The API should be available at:

```text
http://localhost:3000
```

## 3) Start the frontend

Open a second terminal in the frontend folder:

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

The app should open at:

```text
http://localhost:5173
```

## 4) Default login

After the app starts, you can sign in with:

```text
Username: admin
Password: password
```

This is the default seeded admin account for local testing.

## 5) If the backend says a server is already running

This can happen if the Rails server was left running from a previous session.

Stop the stale process or delete the PID file:

```bash
cd backend
Remove-Item -Force tmp/pids/server.pid -ErrorAction SilentlyContinue
```

Then restart Rails:

```bash
bundle exec rails server -b 0.0.0.0 -p 3000
```

## 6) Useful commands

Backend:

```bash
cd backend
bundle exec rails console
bundle exec rails routes
```

Frontend:

```bash
cd frontend
npm run build
```

## 7) Troubleshooting

- If Rails cannot connect to PostgreSQL, confirm PostgreSQL is running and the env vars are set correctly.
- If the frontend does not load, ensure the Vite dev server is running and port 5173 is free.
- If you get database errors, run:

```bash
cd backend
bundle exec rails db:drop db:create db:migrate
```

## 8) Summary

Run these in two terminals:

Terminal 1:

```bash
cd backend
bundle install
bundle exec rails db:prepare
bundle exec rails server -b 0.0.0.0 -p 3000
```

Terminal 2:

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

Then open:

```text
http://localhost:5173
```
