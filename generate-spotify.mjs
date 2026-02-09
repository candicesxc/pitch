import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars
const envContent = readFileSync(join(__dirname, '.env'), 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

// Load career data
const careerData = JSON.parse(readFileSync(join(__dirname, 'src/data/career-docs.json'), 'utf-8'));

const spotifyJD = `Product Marketing Manager, Targeting & Brand Safety 
New York, NY · 3 days ago · Over 100 people clicked apply
Promoted by hirer · Responses managed off LinkedIn

$91.5K/yr - $130.8K/yr

 Full-time
Matches your job preferences, job type is Full-time.

About the job
We are seeking a Product Marketing Manager to join the Global Monetization Product Marketing team, with a dedicated focus on advertising targeting and brand safety solutions. The Monetization Product Marketing team partners closely with Spotify's R&D teams to build innovative ad products by defining market requirements and developing go-to-market strategies that drive adoption and revenue growth.

In this role, you will play a critical part in shaping Spotify's approach to how advertisers reach the right audiences in the right environments. You'll help define and bring to market targeting capabilities and brand safety solutions that give advertisers confidence in where and how their messages appear on Spotify.

You will thrive in a fast-paced, highly cross-functional environment, working closely with product, engineering, sales, partnerships, policy, and operations. You'll serve as the voice of the market back to product, and the voice of the product to customers—translating complex, technical capabilities into clear, compelling value for advertisers.

What You'll Do

Drive product and feature development for Spotify's audience targeting and brand safety solutions, using market insights to help R&D teams prioritize the most impactful work.
Develop a deep understanding of advertiser needs, customer segments, and industry trends related to targeting, suitability, and brand protection.
Own product positioning and messaging that clearly articulates Spotify's value in targeting and brand-safe advertising environments, and differentiates us in the market.
Lead global go-to-market launches in partnership with product, engineering, sales, marketing, PR, partnerships, and operations.
Support product adoption and growth through sales enablement, market expansion strategies, and thought leadership.
Gather and synthesize customer feedback to inform product roadmaps, messaging, and marketing strategy.
Act as a subject-matter expert internally on targeting and brand safety, enabling teams across the business to confidently represent Spotify's solutions.

Who You Are

You have 5+ years of experience in the digital advertising industry, with strong expertise in targeting, audience solutions, brand safety, and suitability. Product marketing experience preferred.
You have a BA/BS degree or equivalent; master's degree a plus.
You have a strong experience leading cross-functional teams and a track record of influencing senior stakeholders in product/engineering, partnerships, operations and sales.
You have experience with customer research and are proficient using data/insights to inform product/GTM strategy
You have strong opinions about what we should build and why, balancing quantitative and qualitative points to influence strategic decisions. 
You have experience working globally and are empathetic to customer needs
You have experience launching cross-functional go-to-market launches 
You have a track record of collaborating with a variety of cross-functional stakeholders in a fast-paced environment
You can explain the value of highly technical concepts in human, relatable, and compelling language. 
You have experience presenting to large industry groups and meeting with senior external stakeholders. 

Where You'll Be

We offer you the flexibility to work where you work best! For this role, you can be within the North America region as long as we have a work location.
This team operates within the EST time zone for collaboration.

Spotify transformed music listening forever when we launched in 2008. Our mission is to unlock the potential of human creativity by giving a million creative artists the opportunity to live off their art and billions of fans the chance to enjoy and be passionate about these creators. Everything we do is driven by our love for music and podcasting. Today, we are the world's most popular audio streaming subscription service.`;

async function generatePitch(jdText) {
  const apiKey = envVars.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_OPENAI_API_KEY not found in .env');
  }

  const achievements = [];
  for (const exp of careerData.experience) {
    for (const a of exp.achievements) {
      achievements.push(a);
    }
  }
  for (const p of careerData.vibeCodingProjects) {
    achievements.push(`${p.name}: ${p.description}`);
  }

  const careerContext = JSON.stringify({
    education: careerData.education,
    experience: careerData.experience,
    vibeCodingProjects: careerData.vibeCodingProjects,
    aboutMeBlurb: careerData.aboutMeBlurb,
    achievementsList: achievements,
  }, null, 2);

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
  "companyName": "Spotify",
  "roleName": "Product Marketing Manager, Targeting & Brand Safety",
  "tailoredAboutMe": "string (40-55 words MAX, 1-2 short paragraphs separated by \\n\\n, tailored to role/company)",
  "pairs": [
    { 
      "jdRequirement": "exact or condensed JD requirement (1 sentence)", 
      "myAchievement": "1-1.5 sentences MAX from rich career data. VARY the structure: some start with metrics, some with action, some with context. Make each one feel unique and human, not templated. Be concise but punchy."
    },
    ... exactly 4 pairs
  ]
}

CRITICAL RULES:
1. Pick the 4 MOST CRITICAL requirements from the JD (not just any 4).
2. About Me: 40-55 words MAX (cut 30% from typical length). Keep it tight and impactful.
3. "I delivered": 1-1.5 sentences MAX (cut 50% from typical length). VARY the writing style dramatically:
   - Pair 1: Start with a bold metric/outcome ("Generated $125K pipeline..." or "$5M in enterprise deals...")
   - Pair 2: Start with a problem/action ("When engineering was resource-constrained..." or "I challenged the Head of Growth...")
   - Pair 3: Start with insight/discovery ("I discovered a critical gap..." or "Through 15 C-suite interviews...")
   - Pair 4: Use a completely different structure - maybe a confident direct statement, or a "what I did" format, or a results-first approach
4. Each "I delivered" must feel UNIQUE:
   - Vary sentence length (some short/punchy, some slightly longer with context)
   - Vary tone (some confident/metrics-driven, some problem-solving, some strategic/insightful)
   - Avoid starting multiple sentences the same way ("I did...", "I built...", "I generated...")
   - Mix active voice with occasional variation
5. Match each JD requirement to the BEST matching achievement from the rich career data.
6. Write like a human storyteller, not a corporate robot. Each achievement should have its own personality and rhythm.`;

  const userPrompt = `Job description:\n\n${jdText.slice(0, 12000)}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
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
    throw new Error(err.error?.message ?? res.statusText);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content?.trim() ?? '';
  const jsonStr = raw.replace(/^```json?\s*|\s*```$/g, '');
  return JSON.parse(jsonStr);
}

function getPitchHtml(values) {
  const { companyName, roleName, tailoredAboutMe, pairs } = values;
  const companyLower = companyName.toLowerCase();
  const BRAND_COLOR = '#000';
  
  function escapeHtml(s) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const pairBlocks = pairs
    .map(
      (p) => `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div class="jd-quote">
                        <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">You want</p>
                        <p class="text-lg font-medium text-gray-700 italic leading-relaxed">"${escapeHtml(p.jdRequirement)}"</p>
                    </div>
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-widest text-black mb-2">I delivered</p>
                        <p class="text-gray-600 leading-relaxed">${escapeHtml(p.myAchievement)}</p>
                    </div>
                </div>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Candice Shen | Pitch for ${escapeHtml(companyName)}</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #FFFFFF; color: #1A1A1A; scroll-behavior: smooth; }
        .notion-bg { background-color: #F7F7F5; }
        .glass-nav { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(12px); border-bottom: 1px solid ${BRAND_COLOR}; }
        .jd-quote { border-left: 3px solid #000; padding-left: 1.5rem; }
        .timeline-bar { height: 14px; background: #EEEEEE; border-radius: 7px; position: relative; overflow: hidden; }
        .timeline-fill { height: 100%; background: #000; border-radius: 7px; width: 0%; transition: width 1.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .btn-outline { border: 1px solid #E5E5E5; transition: all 0.2s ease; }
    </style>
</head>
<body class="antialiased">
    <nav class="fixed top-0 w-full z-50 glass-nav">
        <div class="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <span class="font-bold tracking-tight text-lg">candice shen ❤️ ${escapeHtml(companyName)}</span>
            </div>
            <a href="mailto:candice.shen@yale.edu" class="bg-black text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm">Message Me</a>
        </div>
    </nav>

    <section class="pt-40 pb-24 px-6">
        <div class="max-w-4xl mx-auto">
            <p class="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-8 text-center md:text-left">To the hiring team at ${escapeHtml(companyName)}</p>
            <h1 class="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight mb-10 text-center md:text-left">
                Nobody cares about cover letters, neither do I
            </h1>
            <p class="text-2xl md:text-3xl text-gray-500 font-medium leading-snug text-center md:text-left">
                So I built this pitch to show you why I'm the perfect fit for <span class="text-black underline decoration-2 underline-offset-4 font-bold italic">${escapeHtml(roleName)}</span> at <span class="text-black font-bold">${escapeHtml(companyName)}</span>
            </p>
        </div>
    </section>

    <section class="py-24 notion-bg border-y border-gray-100">
        <div class="max-w-4xl mx-auto px-6">
            <div class="mb-24">
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">About Me</p>
                <div class="text-xl md:text-2xl text-gray-800 leading-relaxed font-medium">
                    ${tailoredAboutMe.split('\\n\\n').map(p => `<p class="mb-4">${escapeHtml(p)}</p>`).join('')}
                </div>
            </div>
            <h2 class="text-4xl font-extrabold tracking-tighter mb-16">How I can deliver what ${escapeHtml(companyName)} asked for</h2>
            <div class="space-y-20">
${pairBlocks}
            </div>
        </div>
    </section>

    <section id="runway" class="py-24 px-6">
        <div class="max-w-4xl mx-auto">
            <h2 class="text-4xl font-extrabold tracking-tighter mb-16 leading-tight">The "sponsorship" question</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div class="space-y-10">
                    <div class="flex items-start space-x-4">
                        <span class="text-2xl">🛡️</span>
                        <div><h4 class="font-bold text-lg mb-1">Risk-Free Stability</h4><p class="text-gray-500 text-sm">Low-cost cap-exempt H1B transfer & STEM OPT. Zero lottery risk, 5.5 years guaranteed runway.</p></div>
                    </div>
                    <div class="flex items-start space-x-4"><span class="text-2xl">🚀</span><div><h4 class="font-bold text-lg mb-1">Full time starting May</h4><p class="text-gray-500 text-sm">Available May 2026.</p></div></div>
                </div>
                <div class="bg-gray-50 p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <div class="flex justify-between items-end mb-2"><span class="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Guaranteed Runway</span><span class="text-2xl font-black">5.5 Years</span></div>
                    <div class="timeline-bar"><div class="timeline-fill" style="width: 100%;"></div></div>
                </div>
            </div>
        </div>
    </section>

    <!-- COPYRIGHT FOOTER -->
    <footer class="py-8 px-6 border-t border-gray-200 bg-white text-center">
        <div class="max-w-4xl mx-auto">
            <p class="text-gray-500 text-sm mb-2">© 2026 Candice Shen. All rights reserved.</p>
            <p class="text-gray-400 text-xs">Built with AI while backed by 100% true info</p>
        </div>
    </footer>
</body>
</html>`;
}

async function main() {
  console.log('🎯 Generating pitch for Spotify PMM role...\n');
  try {
    const pitch = await generatePitch(spotifyJD);
    console.log('✅ Generated pitch:\n');
    console.log(`Company: ${pitch.companyName}`);
    console.log(`Role: ${pitch.roleName}`);
    console.log(`About Me (${pitch.tailoredAboutMe.split(' ').length} words):\n${pitch.tailoredAboutMe}\n`);
    console.log('4 "You Want / I Delivered" pairs:');
    pitch.pairs.forEach((p, i) => {
      console.log(`\n${i + 1}. You want: "${p.jdRequirement}"`);
      console.log(`   I delivered: ${p.myAchievement}`);
    });

    const html = getPitchHtml(pitch);
    writeFileSync(join(__dirname, 'spotify-pmm-preview.html'), html);
    console.log('\n✅ Preview saved to spotify-pmm-preview.html');
    console.log('   Open it in your browser to see the full pitch page!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
