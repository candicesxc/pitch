import { generatePitch } from './src/lib/generate';
import { getPitchHtml } from './src/lib/template';
import { writeFileSync } from 'fs';

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

async function main() {
  console.log('Generating pitch for Spotify PMM role...\n');
  const pitch = await generatePitch(spotifyJD);
  console.log('Generated pitch:', JSON.stringify(pitch, null, 2));
  
  const html = getPitchHtml({
    companyName: pitch.companyName,
    roleName: pitch.roleName,
    heroTitle: pitch.heroTitle,
    tailoredAboutMe: pitch.tailoredAboutMe,
    pairs: pitch.pairs,
  });
  
  writeFileSync('./spotify-pmm-preview.html', html);
  console.log('\n✅ Preview saved to spotify-pmm-preview.html');
}

main().catch(console.error);
