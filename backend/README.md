# FindIt Backend

Spring Boot application providing REST APIs for the FindIt project.

## Features
- H2 in-memory database (no setup required)
- Endpoints for user registration/login, item reporting, and simple stats
- Basic in-memory security disabled for ease of use

## Building & Running

Make sure you have Java 17+ and Maven installed.

```bash
cd backend
mvn clean package
java -jar target/findit-backend-0.0.1-SNAPSHOT.jar
```

The application will start on `http://localhost:8080`.

H2 console is available at `http://localhost:8080/h2-console` with JDBC URL `jdbc:h2:mem:testdb`.

## API Endpoints

- `POST /api/auth/register` - register new user (body: `User` JSON)
- `POST /api/auth/login` - login with `username` and `password` (simple plaintext auth)
- `GET /api/items` - list items, optional `owner` or `type` query param
- `POST /api/items` - submit item (JSON payload matching `Item` entity)
- `GET /api/items/{id}` - fetch item by id
- `PUT /api/items/{id}/status` - update status with `{ "status": "VALUE" }` payload
- `GET /api/admin/stats/summary` - simple counts
- `GET /api/admin/stats/category` - counts per category

## Notes

This is a minimal demo suitable for integration with the existing Angular frontend.  Passwords are stored in plain text; do **not** use as-is in production.
