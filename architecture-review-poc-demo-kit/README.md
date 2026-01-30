# Arch Review POC

Next.js 14 app with App Router, TypeScript, Tailwind CSS, and shadcn/ui.

## Setup

```bash
cd arch-review-poc
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

- **Next.js 14** – App Router
- **TypeScript**
- **Tailwind CSS** – utility-first CSS
- **shadcn/ui** – components (Button installed; add more with `npx shadcn@latest add <component>`)

## Folder structure

- `/app` – App Router (layout, page, globals.css)
- `/components/ui` – shadcn components
- `/lib` – utils (e.g. `cn` for Tailwind)

No authentication is configured.

## Reset Demo Data (admin-only)

To replay the demo from a clean state:

1. Switch role to **Admin** in the top-right dropdown.
2. Click **Reset Demo Data** in the top bar.
3. Confirm in the dialog. The app clears:
   - **Local storage:** latest review, approvals state
   - **Server data:** `data/reviews.json`, `data/approvals.json`, `data/provisioning.json`, `data/audit.log`
4. The page reloads to the dashboard. You can replay the full flow: New Review → Approvals → Provisioning → Audit.
