# Personal Pitch Generator

React/Vite app that generates personalized, high-conversion pitch pages from a Job Description (JD). Uses **Candice (Xinchen) Shen**’s career data as the source of truth.

## Features

- **Single input:** Paste the full Job Description.
- **Logic:** Analyzes the JD → picks top 4 requirements → matches each to an achievement from your career data (NotebookLM / `src/data/career-docs.json`).
- **Output:** Punchy hero H1, tailored “About Me” (~80–100 words), and 4 “You want / I delivered” pairs.
- **Template:** Injects into the fixed HTML/Tailwind template (no change to structure or Sponsorship section).
- **Deploy:** Pushes generated `index.html` to `candicesxc/pitch` as `[company]-[role]/index.html` (e.g. `notion-pmm/index.html`).

## Setup

```bash
npm install
cp .env.example .env
# Edit .env: add VITE_GITHUB_TOKEN (required for Deploy), optionally VITE_OPENAI_API_KEY
npm run dev
```

- **VITE_GITHUB_TOKEN:** GitHub Fine-Grained Token with write access to `candicesxc/pitch`. Required for “Deploy to GitHub”.
- **VITE_OPENAI_API_KEY:** Optional. If set, the app uses GPT to analyze the JD and generate hero, about me, and pairs. If not set, a keyword-matching fallback is used.

## Refreshing career data (NotebookLM)

Career data lives in `src/data/career-docs.json`. To refresh from your **Career Docs** notebook in NotebookLM:

1. From the NotebookLM skill directory:
   ```bash
   cd ~/.claude/skills/notebooklm
   python scripts/run.py ask_question.py --question "List all relevant professional data for Candice (Xinchen) Shen: MBA at Yale, PMM internship at Microsoft (AI Security), tech marketing at Materialize/Starburst, and vibe coding projects (Sales Coach AI, ROI calculators). Format as structured bullets or short paragraphs suitable for 'I Delivered' sections." --notebook-url "https://notebooklm.google.com/notebook/YOUR_NOTEBOOK_ID"
   ```
2. Update `src/data/career-docs.json` with the structure: `education`, `experience` (role, company, achievements), `vibeCodingProjects`, `aboutMeBlurb`.

## Usage

1. Paste the full JD in the text area.
2. Click **Generate pitch**. (Uses OpenAI if `VITE_OPENAI_API_KEY` is set; otherwise fallback.)
3. Click **Open preview in new tab** to review the generated page.
4. Click **Deploy to GitHub** to push to `candicesxc/pitch`. Success message will show the live URL (e.g. `candiceshen.com/pitch/company-role`).

## Tech

- **React 18 + TypeScript + Vite**
- **Tailwind CSS**
- **Template:** `src/lib/template.ts` (HTML with placeholders; Sponsorship section unchanged)
- **Deploy:** `src/lib/deploy.ts` (GitHub Contents API, path `[company]-[role]/index.html`)
