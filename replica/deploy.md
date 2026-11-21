# Vercel Deployment Guide: ClickUp Internal Team Clone

## Can it be deployed on Vercel as fully functional?

**Yes, absolutely.** The frontend and backend API are built natively with **Next.js 14 App Router**, which is the core framework maintained by Vercel.

---

### The One Detail About Serverless (Vercel) vs Local SQLite

| Environment | Database Behavior | Solution |
| --- | --- | --- |
| **Local / Docker / VPS** | Uses local `file:clickup.db` directly on disk. | Works out of the box with zero setup. |
| **Vercel Serverless** | Vercel's serverless functions are stateless and ephemeral (disk files are erased on cold start). | Connect a free cloud SQLite (**Turso**) or **Supabase** via 2 environment variables. |

---

### Recommended Deployment Path on Vercel (100% Free & Zero-Maintenance)

We configured `@libsql/client` to support **Turso** (Serverless cloud SQLite built on the exact same engine).

1. **Push your repository** to GitHub or GitLab.
2. **Create a Free Turso SQLite Database** (Free plan includes 500 databases, 9GB storage, unlimited queries):
   - Sign up at [turso.tech](https://turso.tech)
   - Click "Create Database" -> Name it `clickup-clone`
   - Copy the database URL (`libsql://...`) and create an Auth Token.
3. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
   - Select your GitHub repository.
   - In **Environment Variables**, add:
     - `TURSO_DATABASE_URL`: `libsql://your-db-org.turso.io`
     - `TURSO_AUTH_TOKEN`: `your-turso-auth-token`
   - Click **Deploy**.
4. **Result**: Your ClickUp clone will be live with high availability, global edge caching, and permanent SQLite database persistence across all team members.

---

### Alternative: Deploy on Railway or Render (Local File SQLite)
If you want to keep the local `clickup.db` file without signing up for Turso, you can deploy to **Railway** or **Render** using a persistent disk volume.
