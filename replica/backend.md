# Backend & Database Architecture: ClickUp Clone

## 1. Database Engine: SQLite (`clickup.db`)

- **Primary Engine**: **SQLite** via `@libsql/client` (stored directly on disk as `clickup.db`).
- **Why SQLite**:
  - **Zero configuration**: Requires no external Docker containers, cloud accounts, or connection poolers.
  - **Self-contained & Private**: Ideal for private internal team deployment behind your own local network or internal VM.
  - **Fast Embedded Operations**: Zero-latency queries running directly in Node.js.
- **Supabase / PostgreSQL Compatibility**:
  - The complete relational schema is also defined in [replica/schema.sql](file:///d:/New%20folder/Code/click-up-clone/replica/schema.sql) with PostgreSQL types and Row-Level Security (RLS).
  - If you wish to migrate to Supabase or hosted Postgres in the future, the table structure and column types map 1:1.

## 2. Authentication System (ID & Password)

- **Authentication Endpoints**:
  - `POST /api/auth/login`: Authenticates with User ID (or Email) and Password.
  - `POST /api/auth/register`: Creates new team member accounts with ID, Email, Full Name, Password, and Role.
  - `POST /api/auth/logout`: Clears the session cookie.
  - `GET /api/auth/me`: Validates session cookie and returns current user details.
- **Password Security**:
  - Encrypted with `bcryptjs` using 10 salt rounds before storage.
  - Plaintext passwords are never saved or returned in API responses.
- **Pre-Seeded Team Accounts**:
  - `alex` (`alex.chen@team.internal`): **Owner** (Password: `password123`)
  - `maya` (`maya.patel@team.internal`): **Admin** (Password: `password123`)
  - `jordan` (`jordan.lee@team.internal`): **Member** (Password: `password123`)
  - `liam` (`liam.smith@team.internal`): **Member** (Password: `password123`)
  - `sam` (`sam.taylor@team.internal`): **Viewer** (Password: `password123`)

## 3. Security Checklist

- [x] Input validation on authentication endpoints
- [x] Password hashing with bcrypt
- [x] Passwords never exposed in client payloads
- [x] Role-Based Access Control (Owner, Admin, Member, Viewer)
- [x] Local disk persistence in `clickup.db`
- [x] Sign Out and session clearing
