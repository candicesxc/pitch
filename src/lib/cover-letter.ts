/**
 * Generates traditional cover letter text from pitch data.
 * Converts the 4 "you want / I delivered" pairs into prose paragraphs.
 */

export interface CoverLetterData {
  companyName: string;
  roleName: string;
  tailoredAboutMe: string;
  pairs: { jdRequirement: string; myAchievement: string }[];
  pitchUrl: string;
}

/**
 * Paragraph templates for varied storytelling.
 * Each template creates a different narrative structure.
 */
const PARAGRAPH_TEMPLATES = {
  0: {
    pattern: (req: string, ach: string) =>
      `In your job description, you emphasize ${req}. ${ach}`,
    connector: ''
  },
  1: {
    pattern: (req: string, ach: string) =>
      `${ach} This directly addresses your requirement for ${req}.`,
    connector: 'Building on that foundation, '
  },
  2: {
    pattern: (req: string, ach: string) =>
      `${ach} This experience aligns with your need for ${req}.`,
    connector: 'Looking at the bigger picture, '
  },
  3: {
    pattern: (req: string, ach: string) =>
      `${ach} Your search for ${req} resonates with this approach.`,
    connector: 'Most recently, '
  }
} as const;

/**
 * Formats a single body paragraph using varied templates.
 */
function formatBodyParagraph(
  pair: { jdRequirement: string; myAchievement: string },
  index: 0 | 1 | 2 | 3
): string {
  const formattedReq = formatRequirement(pair.jdRequirement);
  const template = PARAGRAPH_TEMPLATES[index];
  return template.connector + template.pattern(formattedReq, pair.myAchievement);
}

export function getCoverLetterText(data: CoverLetterData): {
  header: string;
  date: string;
  salutation: string;
  opening: string;
  bodyParagraphs: string[];
  closing: string;
  signature: string;
  footer: string;
} {
  const { companyName, roleName, tailoredAboutMe, pairs, pitchUrl } = data;

  // Format current date
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Header info
  const header = `Candice (Xinchen) Shen
candice.shen@yale.edu
linkedin.com/in/candiceshen`;

  // Salutation
  const salutation = `Dear Hiring Team at ${companyName},`;

  // Opening paragraph - expand the tailored about me
  const opening = `I'm excited to apply for the ${roleName} position at ${companyName}. ${tailoredAboutMe}`;

  // Body paragraphs - use varied templates for storytelling
  const bodyParagraphs = pairs.map((pair, index) => {
    return formatBodyParagraph(pair, index as 0 | 1 | 2 | 3);
  });

  // Closing paragraph with prominent URL callout
  const closing = `I'd welcome the opportunity to discuss how I can contribute to ${companyName}'s mission. Thank you for your consideration.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 VIEW MY INTERACTIVE PITCH
${pitchUrl}

This personalized pitch demonstrates how my experience aligns with ${companyName}'s specific needs, with deeper context and portfolio samples.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  // Signature
  const signature = `Sincerely,
Candice Shen`;

  // Footer (simplified - pitch URL is now prominent in closing)
  const footer = `LinkedIn: linkedin.com/in/candiceshen
Portfolio: candiceshen.com`;

  return {
    header,
    date: dateStr,
    salutation,
    opening,
    bodyParagraphs,
    closing,
    signature,
    footer,
  };
}

/**
 * Helper to format JD requirement text for prose.
 * Removes quotes and makes it flow naturally in a sentence.
 */
function formatRequirement(req: string): string {
  // Remove quotes if present
  let formatted = req.replace(/^["']|["']$/g, '');

  // If it starts with a capital and ends with period, remove period
  if (formatted.endsWith('.')) {
    formatted = formatted.slice(0, -1);
  }

  // Lowercase first letter if it's part of a sentence continuation
  if (formatted.length > 0) {
    formatted = formatted.charAt(0).toLowerCase() + formatted.slice(1);
  }

  return formatted;
}
