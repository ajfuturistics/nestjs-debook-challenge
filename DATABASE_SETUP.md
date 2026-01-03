# Debook Challenge - Database Setup

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ installed

## Quick Start

### 1. Start Database Services

```bash
# Start PostgreSQL and Redis containers
docker-compose up -d

# Verify containers are running
docker ps
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

The `.env.example` file is already configured for local development. The database name is `debookchallengedb`.

### 4. Build the Project

```bash
npm run build
```

### 5. Run Migrations

```bash
# Run all pending migrations (creates database schema)
npm run migration:run
```

This will:
- Create the `debookchallengedb` database if it doesn't exist
- Create all tables (users, posts, likes, notifications)
- Add all indexes and constraints
- Insert seed users (user-1, user-2, user-3) for testing

### 6. Start the Application

```bash
# Development mode with hot reload
npm run start:dev
```

The API will be available at `http://localhost:3000`

## Database Schema

### Tables

- **users**: User accounts (id, username, email)
- **posts**: User posts with denormalized counters (id, user_id, content, likes_count, comments_count)
- **likes**: Post likes with duplicate prevention (id, user_id, post_id) - unique constraint on (user_id, post_id)
- **notifications**: Async notifications (id, user_id, type, data, read)

### Key Features

- **Denormalized Counters**: `likes_count` and `comments_count` stored on posts for O(1) reads
- **Unique Constraints**: Prevents duplicate likes via database constraint
- **Optimistic Locking**: Version column on posts for concurrent update safety
- **Indexes**: Strategic indexes on foreign keys, timestamps, and composite queries

## Migration Commands

```bash
# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Generate new migration (after entity changes)
npm run migration:generate -- src/database/migrations/MigrationName
```

## Seed Users

Three test users are automatically created:
- `user-1` (alice@debook.com)
- `user-2` (bob@debook.com)
- `user-3` (charlie@debook.com)

Use these IDs in the `x-user-id` header for testing.

## Stopping Services

```bash
# Stop containers but keep data
docker-compose stop

# Stop and remove containers (keeps volumes)
docker-compose down

# Remove everything including data
docker-compose down -v
```
