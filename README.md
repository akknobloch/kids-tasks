# Kids Tasks (React + Vite)

Kid-friendly task board with drag-and-drop, emoji rewards, and a simple password gate.

## Local setup
```bash
npm install
npm run dev
```
Set a password in `.env.local`:
```
VITE_APP_PASSWORD=your-password
```

## Deploy to Vercel
1) Push the repo to GitHub.
2) In Vercel, import the project. Build command: `npm run build`. Output: `dist`.
3) Add env var in Vercel: `VITE_APP_PASSWORD=your-password`.
4) Deploy. The included `vercel.json` handles SPA routing.
5) Add your custom subdomain in Vercel Domains and point DNS (CNAME) to Vercel.
