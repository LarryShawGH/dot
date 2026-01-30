<<<<<<< HEAD
# Architecture Review Automation POC

A Next.js 14 demo for automated architecture reviews: submit a product, run a rules engine, view results and a generated Technical Architecture Document (TAD).

## Features

- **Dashboard** — Start a new review, view workflow and recent reviews
- **New Review** — Submit product details (name, data classification, cloud, internet facing, uses AI)
- **Review Results** — Run review via API; see passed/failed controls, risk score, Mermaid flow
- **TAD** — View generated Technical Architecture Document (executive summary, Mermaid diagram, security controls, tech stack, cost estimate)
- **Approvals** — Role-based approval workflow
- **Provisioning** — Mock provisioning steps after approval
- **Audit Log** — Review-scoped audit entries

## Tech Stack

- Next.js 14, React 18, TypeScript
- Tailwind CSS, shadcn/ui, Mermaid
- File-based persistence for reviews and TADs (`data/reviews/`, `data/tads/`)

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use **Dashboard → Start New Architecture Review** to run the demo flow.

## Demo Flow

1. **Dashboard** → "Start New Architecture Review"
2. **New Review** → Set Data Classification = Confidential, Uses AI = Yes, Internet Facing = Yes (or any values), submit
3. **Review Results** → See risk score, passed/failed controls; click "View Generated Architecture Document"
4. **TAD** → Executive summary, architecture diagram (Mermaid), security mapping, tech stack, cost estimate

## Reset Demo Data

As **Admin** (role switcher in top bar), use "Reset Demo Data" to clear reviews, TADs, approvals, and audit log. Clear localStorage and reload to complete.

## Project Structure

- `app/` — Routes and API (`/api/review/run`, `/api/tad/[reviewId]`, etc.)
- `components/` — Layout, UI, Mermaid diagrams
- `lib/` — Types, rules engine (`runReview`), TAD generator (`generateTAD`), storage (`reviewStore`), API data

## Deploy / Share via Git

The repo is initialized in this folder. To push to GitHub (or another host):

1. **Create a new repository** on GitHub (or GitLab, etc.) — do *not* initialize with a README if you want to push this code.

2. **Add the remote and push** (replace `YOUR_USERNAME` and `YOUR_REPO` with your repo URL):

   ```bash
   cd arch-review-poc
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   ```

   Or with SSH:

   ```bash
   git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   ```

3. **If the remote already exists** (e.g. you cloned first), just push:

   ```bash
   git push -u origin main
   ```

## License

Use as needed for demos and internal sharing.
