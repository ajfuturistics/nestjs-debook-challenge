# Debook Social Content Interaction

A scalable, high-performance API for social interactions (likes) and asynchronous notifications, built with NestJS, PostgreSQL, and BullMQ.

## Features

- **High-Performance Counters**: Uses denormalized counters on posts for O(1) read performance.
- **Idempotency**: Prevents duplicate likes using unique database constraints and idempotent API design.
- **Async Notifications**: Decoupled notification system using BullMQ (Redis) and Event Emitters.
- **Clean Architecture**: Strict separation of concerns (Controller -> Service -> Repository).
- **Dockerized**: Complete environments for development and production.

## Prerequisites

- Node.js 18+
- Docker & Docker Compose

## Quick Start (Docker)

The easiest way to run the application is using Docker.

1.  **Start Services**:
    ```bash
    # Windows (Git Bash / PowerShell)
    bash start-docker.sh
    # OR
    ./start-docker.ps1
    ```
    This script will start the containers and run the database migrations automatically.

2.  **Verify**:
    The API will be running at `http://localhost:3000`.
    Swagger documentation available at `http://localhost:3000/api`.

## Local Development (Manual Setup)

If you prefer to run Node.js locally:

1.  **Start Database & Redis**:
    ```bash
    docker compose up -d postgres redis
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run Migrations**:
    ```bash
    npm run db:create    # Ensure DB exists
    npm run migration:run
    ```

4.  **Start App**:
    ```bash
    npm run start:dev
    ```

## API Endpoints

Authentication is simulated via the `x-user-id` header.
Use the following seed user IDs for testing:
- Alice: `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`
- Bob: `b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/posts` | Create a new post |
| `GET` | `/v1/posts/:id` | Get post with `likesCount` |
| `POST` | `/v1/posts/:id/like` | Like a post |
| `DELETE` | `/v1/posts/:id/like` | Unlike a post |
| `GET` | `/v1/notifications` | Get user notifications |

## Testing

**Integration Test (Recommended)**
Runs a full scenario (Create Post -> Like -> Verify Counter -> Verify Notification):
```bash
node test/api-test.js
```

**Unit Tests**:
```bash
npm run test
```

**E2E Tests**:
```bash
npm run test:e2e
```

## Architecture Decisions

- **Denormalized Counters**: Chosen to meet the "efficient queries" requirement. Avoids joining the `likes` table on every read.
- **TypeORM**: Used for robust migration support and entity management.
- **BullMQ**: Chosen for reliable, persistent background job processing (Notifications) that survives app restarts.
