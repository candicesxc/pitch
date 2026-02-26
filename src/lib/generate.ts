import careerData from '../data/career-docs.json';

export type GeneratedPitch = {
  companyName: string;
  roleName: string;
  tailoredAboutMe: string;
  pairs: { jdRequirement: string; myAchievement: string }[];
};

/**
 * Extract company and role from JD text (simple heuristics).
 */
function extractCompanyAndRole(jdText: string): { companyName: string; roleName: string } {
  const firstLines = jdText.slice(0, 800).split(/\n/).map((l) => l.trim()).filter(Boolean);
  let companyName = 'the company';
  let roleName = 'this position';
  for (const line of firstLines) {
    const at = line.match(/\b(at|@)\s+([A-Z][A-Za-z0-9\s&-]+?)(?:\s*[|\-]|$)/i);
    if (at?.[2]) {
      companyName = at[2].trim();
      break;
    }
    if (line.length < 80 && /[A-Z][a-z]+/.test(line) && !line.startsWith('•') && !/^\d+\./.test(line)) {
      roleName = line;
      break;
    }
  }
  return { companyName, roleName };
}

/**
 * Build a flat list of achievement strings from career data for matching.
 */
function getAchievementsList(): string[] {
  const list: string[] = [];
  for (const exp of careerData.experience) {
    for (const a of exp.achievements) {
      list.push(a);
    }
  }
  for (const p of careerData.vibeCodingProjects) {
    list.push(`${p.name}: ${p.description}`);
  }
  return list;
}

/**
 * Fallback: pick 4 requirements from JD (bullet-like or sentence-like) and match to achievements by keyword overlap.
 */
function fallbackGenerate(jdText: string, _customInstructions?: string): GeneratedPitch {
  const { companyName, roleName } = extractCompanyAndRole(jdText);
  const achievements = getAchievementsList();

  // Extract requirement-like phrases (bullets, "must have", "looking for", etc.)
  const lines = jdText
    .split(/\n/)
    .map((l) => l.replace(/^[\s•\-*]\s*/, '').trim())
    .filter((l) => l.length > 20 && l.length < 300);
  const requirements = lines.slice(0, 12).filter((l) => /(experience|ability|skill|marketing|product|analytics|AI|security|B2B|ROI|positioning|launch)/i.test(l));
  const top4: string[] = requirements.slice(0, 4);
  for (let i = top4.length; i < 4 && i < lines.length; i++) {
    const next = lines.find((l) => !top4.includes(l) && l.length > 15);
    if (next) top4.push(next);
  }
  while (top4.length < 4) {
    top4.push('Strong product marketing and cross-functional collaboration.');
  }

  const defaultAch = achievements[0] ?? 'Delivered results at the intersection of product, marketing, and technical storytelling.';
  const pairs = top4.slice(0, 4).map((req, i) => {
    const ach = achievements[i % achievements.length] ?? defaultAch;
    return { jdRequirement: req, myAchievement: ach };
  });

  const tailoredAboutMe =
    careerData.aboutMeBlurb +
    ` I'm excited about ${companyName} and the ${roleName} role because it sits at the intersection of product, marketing, and technical storytelling—where I've spent my career.`;

  return {
    companyName,
    roleName,
    tailoredAboutMe: tailoredAboutMe.slice(0, 360), // ~40-55 words max
    pairs,
  };
}

/**
 * Call OpenAI to analyze JD and generate pitch content. Uses career data as context.
 */
async function aiGenerate(jdText: string, customInstructions?: string): Promise<GeneratedPitch> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) return fallbackGenerate(jdText);

  const achievements = getAchievementsList();
  const careerContext = JSON.stringify(
    {
      education: careerData.education,
      experience: careerData.experience,
      vibeCodingProjects: careerData.vibeCodingProjects,
      aboutMeBlurb: careerData.aboutMeBlurb,
      achievementsList: achievements,
    },
    null,
    2
  );

  // Rich career data from NotebookLM
  const richCareerData = `MICROSOFT (MBA Intern - AI Security):
- Defined the GTM for Microsoft's AI Security market. Translated complex tech into the "Protect Cloud & AI" narrative for CIOs, shifting sales motion from feature-listing to business risk mitigation.
- Conducted 15 C-suite interviews and survey of 67 enterprise leaders. Discovered critical narrative gap: 80% of enterprises would deploy AI apps by 2026, yet only 1% of security leaders felt prepared.
- Strategic recommendations rated 4.4/5 for solution value, formally adopted into product roadmap. Presented to 30+ internal stakeholders, directly influencing "Protect Cloud and AI Sellers Guide."
- Led team to 2nd place in Global Intern Hackathon, built "Reformatica" AI tool for automating marketing asset repurposing.

MATERIALIZE (ABM Manager - Real-time Data):
- Built full-funnel demand system from scratch. Taught myself HubSpot lead scoring to automate lead routing based on high-intent behaviors (reading technical docs).
- Managed $50K monthly ad budget. Leveraged design skills (Adobe Premiere/Figma) to produce video/animated assets in-house, bypassing agency.
- Generated $125K revenue pipeline in first quarter, optimized lead conversion by 5%. In-house creative strategy contributed to 5x increase in leads via improved CTR.
- Challenged Head of Growth's decision to pause newsletters, built business case and executed trial that outperformed benchmarks, leading to full reinstatement.

STARBURST (ABM Manager - Data Lakehouse):
- Operationalized high-touch ABM strategy with "Content Hubs" - personalized web-based landing pages for key accounts centralizing sales collateral.
- Boosted account engagement by 4x, directly influenced $5M in enterprise deals. Content Hubs became standard sales motion.
- Built Google Data Studio dashboards for real-time visibility into account penetration. Translated technical product value into personalized buying experience.

VIBE CODING PROJECTS:
- Built ROI Calculator (HTML/CSS/JS) for Attentive that became #2 source of website conversions, still used by sales today.
- Led team to build "Reformatica" AI tool, won 2nd Place globally in Microsoft Hackathon AI Marketing category.
- Uses Cursor to build small applications (spot-the-difference game, AI emotional support tool "Listen, You Are Loved").
- Philosophy: "Builder Marketer" who removes dependencies on engineering, accelerates campaign launches, creates interactive assets generating higher-quality leads.`;

  const systemPrompt = `You are helping Candice (Xinchen) Shen create a personalized pitch page for a job application.
Use ONLY the following rich career data to fill "I delivered" sections. Do not invent facts or metrics.

RICH CAREER DATA (from NotebookLM):
${richCareerData}

BASIC CAREER DATA:
${careerContext}

Output valid JSON only, no markdown, with this exact shape:
{
  "companyName": "string (extract from JD - JUST the company name, like 'Duolingo' or 'Google' or 'Microsoft')",
  "roleName": "string (extract from JD - JUST the job title, like 'Product Marketing Manager' or 'Senior PMM')",
  "tailoredAboutMe": "string (40-55 words MAX, 1-2 short paragraphs separated by \\n\\n, tailored to role/company)",
  "pairs": [
    {
      "jdRequirement": "exact or condensed JD requirement (1 sentence)",
      "myAchievement": "1-1.5 sentences MAX from rich career data. VARY the structure: some start with metrics, some with action, some with context. Make each one feel unique and human, not templated. Be concise but punchy."
    },
    ... exactly 4 pairs
  ]
}

EXTRACTION EXAMPLES:
Example 1:
Input: "Product Marketing Manager, Promotions & Acquisition, Amazon Music\nJob ID: 3179132 | Amazon.com Services LLC"
Output: {"companyName": "Amazon", "roleName": "Product Marketing Manager"}

Example 2:
Input: "Senior Software Engineer, Infrastructure Team at Google"
Output: {"companyName": "Google", "roleName": "Senior Software Engineer"}

Example 3:
Input: "Staff Product Manager - Growth | Duolingo"
Output: {"companyName": "Duolingo", "roleName": "Staff Product Manager"}

CRITICAL RULES FOR EXTRACTION:
- companyName: Extract ONLY the company name. Look for these patterns in the JD:
  * "Job ID: XXX | [COMPANY NAME]" (e.g., "Job ID: 3179132 | Amazon.com Services LLC" → extract "Amazon")
  * Lines starting with company name followed by description
  * Common companies: Amazon, Google, Microsoft, Meta, Apple, Netflix, etc.
  * If job title is "[Role], [Team], [Product/Division]" (e.g., "PMM, Promotions, Amazon Music"), the company might be in the product name - extract the root company (Amazon, not "Amazon Music")
  * DO NOT include ".com", "Services LLC", "Inc", or legal suffixes
  * Just the brand name: "Amazon" not "Amazon.com Services LLC"

- roleName: Extract ONLY the core job title, excluding team/division names:
  * "Product Marketing Manager, Promotions & Acquisition, Amazon Music" → "Product Marketing Manager"
  * "Senior Software Engineer, Infrastructure" → "Senior Software Engineer"
  * Remove everything after the first comma if it's a team/division qualifier
  * Keep seniority levels: "Senior", "Staff", "Principal", etc.

- If you cannot find a clear company name after checking these patterns, use "the company" (NOT "Your Company")
- If you cannot find a clear role name, use "this position" (NOT "this role")

CRITICAL RULES FOR CONTENT:
1. Pick the 4 MOST CRITICAL requirements from the JD (not just any 4).

2. MATCHING IS CRITICAL - Each "You want" must have a STRONG, DIRECT connection to "I delivered":
   - Read each JD requirement carefully and identify the CORE skill/outcome it's asking for
   - Find the achievement from career data that BEST demonstrates that exact skill/outcome
   - The connection should be obvious - if someone reads "You want X" and "I delivered Y", they should immediately see how Y proves X
   - Avoid weak connections - don't force a match just to use different achievements
   - If a requirement is about "product positioning", match it to an achievement about positioning/messaging
   - If a requirement is about "GTM launches", match it to an achievement about launching products/campaigns
   - If a requirement is about "customer research", match it to an achievement about interviews/surveys/insights
   - If a requirement is about "technical translation", match it to an achievement about translating tech to business value

3. About Me: 40-55 words MAX (cut 30% from typical length). Keep it tight and impactful.

4. "I delivered": 1-1.5 sentences MAX (cut 50% from typical length). VARY the writing style dramatically:
   - Pair 1: Start with a bold metric/outcome ("Generated $125K pipeline..." or "$5M in enterprise deals...")
   - Pair 2: Start with a problem/action ("When engineering was resource-constrained..." or "I challenged the Head of Growth...")
   - Pair 3: Start with insight/discovery ("I discovered a critical gap..." or "Through 15 C-suite interviews...")
   - Pair 4: Use a completely different structure - maybe a confident direct statement, or a "what I did" format, or a results-first approach

5. Each "I delivered" must feel UNIQUE:
   - Vary sentence length (some short/punchy, some slightly longer with context)
   - Vary tone (some confident/metrics-driven, some problem-solving, some strategic/insightful)
   - Avoid starting multiple sentences the same way ("I did...", "I built...", "I generated...")
   - Mix active voice with occasional variation

6. Write like a human storyteller, not a corporate robot. Each achievement should have its own personality and rhythm.

${
  customInstructions
    ? `CUSTOM REFINEMENT INSTRUCTIONS:
The user has requested the following refinements to the pitch:
${customInstructions}

Please incorporate these refinement requests into the generated pitch while maintaining the core structure and all important details from the career data.`
    : ''
}`;

  const userPrompt = `Job description:\n\n${jdText.slice(0, 12000)}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message ?? res.statusText);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = data.choices?.[0]?.message?.content?.trim() ?? '';
  const jsonStr = raw.replace(/^```json?\s*|\s*```$/g, '');
  const parsed = JSON.parse(jsonStr) as GeneratedPitch;

  const defaultAch = achievements[0] ?? 'Delivered results at the intersection of product, marketing, and technical storytelling.';
  const normalizePairs = (list: { jdRequirement?: string; myAchievement?: string }[]): GeneratedPitch['pairs'] =>
    list.slice(0, 4).map((p, i) => ({
      jdRequirement: p.jdRequirement?.trim() ?? `Key requirement ${i + 1}`,
      myAchievement: (p.myAchievement?.trim() ?? defaultAch),
    }));

  if (!parsed.pairs || parsed.pairs.length < 4) {
    const filled = fallbackGenerate(jdText);
    return {
      companyName: parsed.companyName ?? filled.companyName,
      roleName: parsed.roleName ?? filled.roleName,
      tailoredAboutMe: parsed.tailoredAboutMe ?? filled.tailoredAboutMe,
      pairs: normalizePairs(parsed.pairs ?? filled.pairs),
    };
  }
  return {
    companyName: parsed.companyName ?? 'the company',
    roleName: parsed.roleName ?? 'this position',
    tailoredAboutMe: parsed.tailoredAboutMe ?? careerData.aboutMeBlurb,
    pairs: normalizePairs(parsed.pairs),
  };
}

/**
 * Generate pitch from JD. Uses OpenAI if VITE_OPENAI_API_KEY is set; otherwise fallback.
 */
export async function generatePitch(jdText: string, customInstructions?: string): Promise<GeneratedPitch> {
  if (!jdText.trim()) throw new Error('Please paste a job description.');
  try {
    return await aiGenerate(jdText, customInstructions);
  } catch {
    return fallbackGenerate(jdText, customInstructions);
  }
}
