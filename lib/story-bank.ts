/**
 * PMOS Story Bank — Pre-curated story prompts for women's hormonal health content.
 * Designed for the @HonestHormones channel's daily Shorts production workflow.
 *
 * 30 prompts across 8 themes — one-tap selection on /story page.
 * Each prompt is written first-person, emotionally honest, ready to be expanded by GPT-4o.
 */

export interface StoryBankEntry {
  id: string;
  theme: StoryTheme;
  title: string;          // Short label shown on chip
  prompt: string;         // Full story prompt sent to GPT-4o
  mood: 'EMOTIONAL' | 'CINEMATIC' | 'VIRAL' | 'DREAMY' | 'FAST_PACED';
  hashtags: string[];     // Pre-curated tags for posting
  hookExample: string;    // Example viral hook (for reference)
}

export type StoryTheme =
  | 'diagnosis'
  | 'daily-struggle'
  | 'food-journey'
  | 'movement'
  | 'mental-health'
  | 'small-wins'
  | 'doctors-system'
  | 'relationships';

export const THEME_META: Record<StoryTheme, { label: string; emoji: string; description: string }> = {
  'diagnosis':        { label: 'The Diagnosis',     emoji: '🩺', description: 'The day everything changed' },
  'daily-struggle':   { label: 'Daily Struggle',    emoji: '💭', description: 'The real-not-pretty moments' },
  'food-journey':     { label: 'Food & Body',       emoji: '🥗', description: 'Hormonal eating, cravings, healing food' },
  'movement':         { label: 'Movement',          emoji: '🧘', description: 'Workouts that don\'t spike cortisol' },
  'mental-health':    { label: 'Mental Health',     emoji: '🧠', description: 'Anxiety, mood swings, intrusive thoughts' },
  'small-wins':       { label: 'Small Wins',        emoji: '✨', description: 'The tiny victories that matter' },
  'doctors-system':   { label: 'Doctors & System',  emoji: '🏥', description: 'What no one tells you in the clinic' },
  'relationships':    { label: 'Relationships',     emoji: '💕', description: 'How PMOS affects love, family, friends' },
};

export const STORY_BANK: StoryBankEntry[] = [
  // ── DIAGNOSIS (4) ──────────────────────────────────────────────────────────
  {
    id: 'diag-01',
    theme: 'diagnosis',
    title: 'The day I was diagnosed with PMOS',
    prompt: 'The day I was diagnosed with PMOS (formerly PCOS). Walking into the clinic anxious. The ultrasound. The doctor saying the words. The quiet drive home. The Google search at midnight. The realisation: this is now part of me. But also — knowing is the first step to healing.',
    mood: 'EMOTIONAL',
    hashtags: ['#PMOS', '#PCOS', '#diagnosis', '#hormonalhealth', '#womenshealth', '#shorts', '#reels'],
    hookExample: 'I thought it was just a weight problem… then the doctor said this.',
  },
  {
    id: 'diag-02',
    theme: 'diagnosis',
    title: '5 signs I ignored before my diagnosis',
    prompt: 'Five PMOS signs I ignored for years before finally getting tested. Irregular periods I thought were "just stress". Sudden weight gain I blamed on lifestyle. Skin changes I thought were diet. Hair thinning I assumed was hormones-but-normal. Constant fatigue I called "being a tired adult". Your body was telling you all along.',
    mood: 'VIRAL',
    hashtags: ['#PMOS', '#PCOS', '#hormoneimbalance', '#womenshealth', '#viralreels', '#shorts'],
    hookExample: 'My body was screaming at me for 3 years and I called it "normal".',
  },
  {
    id: 'diag-03',
    theme: 'diagnosis',
    title: 'What PMOS actually is — explained simply',
    prompt: 'PMOS — Polyendocrine Metabolic Ovarian Syndrome — explained simply. Not just cysts. Not just weight. It is your endocrine system out of balance — insulin resistance, androgen excess, ovulation issues. Affects skin, mood, energy, fertility, mental health. It is not your fault. It is a real medical condition. And there are real things that help.',
    mood: 'CINEMATIC',
    hashtags: ['#PMOS', '#PCOS', '#whatispmos', '#hormonalhealth', '#education', '#womenshealth', '#shorts'],
    hookExample: 'PMOS is not what you think it is — and that\'s why most women suffer for years.',
  },
  {
    id: 'diag-04',
    theme: 'diagnosis',
    title: 'PCOS is now called PMOS — here\'s why',
    prompt: 'PCOS has officially been renamed to PMOS — Polyendocrine Metabolic Ovarian Syndrome. Why this change matters. The old name only described cysts — but most women with PMOS don\'t actually have cysts. The new name captures what it actually is: a whole-body endocrine and metabolic condition. This change took decades. And it changes how doctors will treat us going forward.',
    mood: 'VIRAL',
    hashtags: ['#PMOS', '#PCOS', '#PMOSnotPCOS', '#hormonalhealth', '#viral', '#womenshealth'],
    hookExample: 'PCOS got renamed and most doctors don\'t even know yet.',
  },

  // ── DAILY STRUGGLE (4) ─────────────────────────────────────────────────────
  {
    id: 'daily-01',
    theme: 'daily-struggle',
    title: 'A day in my life with PMOS',
    prompt: 'A day in my life with PMOS. Waking up exhausted even after 8 hours. The morning brain fog. Trying to eat the "right" breakfast. The 11am energy crash. The 3pm mood drop. The evening cravings I fight. The bedtime overthinking. People only see the weight — they don\'t see all of this.',
    mood: 'EMOTIONAL',
    hashtags: ['#PMOS', '#dayinmylife', '#PCOS', '#chronicillness', '#womenshealth', '#shorts', '#reels'],
    hookExample: 'You only see the weight. Here\'s what 24 hours with PMOS actually feels like.',
  },
  {
    id: 'daily-02',
    theme: 'daily-struggle',
    title: 'The bloating no one talks about',
    prompt: 'The PMOS bloating no one talks about. Looking 5 months pregnant by evening. Clothes that fit in the morning not fitting at night. Hiding my stomach in photos. The shame of being asked "are you expecting?". The way I avoid certain dresses. This is hormonal bloating — not what I ate.',
    mood: 'EMOTIONAL',
    hashtags: ['#PMOS', '#PCOSbloating', '#bloatingawareness', '#hormonalbloat', '#shorts'],
    hookExample: 'Morning vs evening — and no, it\'s not "what you ate".',
  },
  {
    id: 'daily-03',
    theme: 'daily-struggle',
    title: 'The hair loss that broke me',
    prompt: 'The hair loss with PMOS that broke me. Seeing strands on the pillow every morning. The thinning crown I tried to hide. Avoiding certain hairstyles. Crying in the salon chair. The androgens pulling my hair from the root. It\'s not vanity — hair is identity. And losing it is grief.',
    mood: 'EMOTIONAL',
    hashtags: ['#PMOS', '#PCOShairloss', '#femalehairloss', '#hormonalhairloss', '#shorts'],
    hookExample: 'Nobody warns you that PMOS comes for your hair.',
  },
  {
    id: 'daily-04',
    theme: 'daily-struggle',
    title: 'The acne in my 30s',
    prompt: 'The PMOS acne that hit hard in my 30s. Painful, cystic, jawline. Cancelling plans because of my skin. Trying every cream. Realising it is hormonal — not skincare. The androgen excess pushing my oil glands. Acne that no concealer covers. Acne that makes you avoid mirrors.',
    mood: 'EMOTIONAL',
    hashtags: ['#PMOS', '#PCOSacne', '#hormonalacne', '#adultacne', '#shorts', '#reels'],
    hookExample: 'My skin was fine for 30 years. Then PMOS arrived.',
  },

  // ── FOOD & BODY (4) ────────────────────────────────────────────────────────
  {
    id: 'food-01',
    theme: 'food-journey',
    title: 'What I eat in a day for PMOS',
    prompt: 'What I eat in a day for healing PMOS. Protein-first breakfast — no sugar spikes. Mid-morning fat for hormone support. A real lunch with veggies, protein, fibre. An afternoon snack that doesn\'t crash me. Dinner before sunset. Herbal tea. Not perfect. Not boring. Just balanced.',
    mood: 'CINEMATIC',
    hashtags: ['#PMOS', '#PCOSdiet', '#whatieatinaday', '#hormonalhealth', '#cleaneating', '#shorts'],
    hookExample: 'I changed how I eat and my PMOS symptoms calmed in 30 days.',
  },
  {
    id: 'food-02',
    theme: 'food-journey',
    title: 'Foods that quietly worsen PMOS',
    prompt: 'Foods that quietly worsen PMOS — and I had no idea. Refined sugar — obvious. Dairy — sneaky. Soy in everything. Vegetable oils. Processed snacks marketed as "healthy". Coffee on empty stomach. Late-night carbs. Removing these was harder than starting a workout. But it changed everything.',
    mood: 'VIRAL',
    hashtags: ['#PMOS', '#PCOSfood', '#avoidthesefoods', '#hormonebalance', '#shorts', '#reels'],
    hookExample: 'These 7 "healthy" foods were silently wrecking my hormones.',
  },
  {
    id: 'food-03',
    theme: 'food-journey',
    title: 'My cravings vs my goals',
    prompt: 'My cravings vs my PMOS healing goals. The 4pm chocolate pull. The post-dinner sweet tooth. The midnight pasta urge. The "I deserve this" voice. The "just one bite" lie. Some days I win. Some days I lose. Healing is not perfect. But every time I choose myself, my body remembers.',
    mood: 'EMOTIONAL',
    hashtags: ['#PMOS', '#hormonalcravings', '#PCOSjourney', '#realtalk', '#shorts'],
    hookExample: 'PMOS cravings are not weakness. They\'re biology screaming.',
  },
  {
    id: 'food-04',
    theme: 'food-journey',
    title: 'Hormone-balancing meals I actually eat',
    prompt: 'Hormone-balancing meals I actually eat — not Pinterest fantasy. Curd rice with seeds. Methi paratha with ghee. Moong dal with veggies. Sabudana with peanuts. Real Indian food, slightly adjusted. Healing doesn\'t mean salads and smoothie bowls. It means listening to your body and your culture.',
    mood: 'CINEMATIC',
    hashtags: ['#PMOS', '#indianpcosdiet', '#hormonebalance', '#realmeals', '#shorts', '#reels'],
    hookExample: 'You don\'t need quinoa to heal PMOS. You need this.',
  },

  // ── MOVEMENT (3) ───────────────────────────────────────────────────────────
  {
    id: 'move-01',
    theme: 'movement',
    title: 'Why HIIT was making my PMOS worse',
    prompt: 'Why HIIT was making my PMOS worse. The cortisol spike. The post-workout crash. The not-losing-weight despite hours at the gym. The exhaustion that wouldn\'t lift. PMOS bodies don\'t respond to high-intensity the way Instagram says. Switching to walks, yoga, and strength changed everything.',
    mood: 'VIRAL',
    hashtags: ['#PMOS', '#PCOSworkout', '#HIITdoesntwork', '#cortisol', '#shorts', '#reels'],
    hookExample: 'Cardio was making my PMOS worse — here\'s what actually worked.',
  },
  {
    id: 'move-02',
    theme: 'movement',
    title: 'My PMOS-friendly workout routine',
    prompt: 'My PMOS-friendly weekly workout routine. Two days of strength — heavy, slow, controlled. Two days of yoga — focused on stress relief. Daily walks — 7000 steps minimum. One rest day. No cardio sessions over 30 minutes. My body finally feels supported instead of punished.',
    mood: 'CINEMATIC',
    hashtags: ['#PMOS', '#PCOSworkout', '#fitnessjourney', '#strengthtraining', '#shorts'],
    hookExample: 'I stopped doing cardio for 90 days. My PMOS told me everything.',
  },
  {
    id: 'move-03',
    theme: 'movement',
    title: 'Walking changed my hormones',
    prompt: 'How walking changed my hormones. 30 minutes after meals — blood sugar stable. Morning walks — cortisol regulated. Evening walks — better sleep. No equipment. No gym fees. No intimidation. Just movement, daily, gently. My PMOS responded to this more than any intense workout ever did.',
    mood: 'EMOTIONAL',
    hashtags: ['#PMOS', '#walkingforhealth', '#hormonebalance', '#dailywalk', '#shorts', '#reels'],
    hookExample: 'I replaced the gym with walking. Look what happened in 60 days.',
  },

  // ── MENTAL HEALTH (4) ──────────────────────────────────────────────────────
  {
    id: 'mind-01',
    theme: 'mental-health',
    title: 'PMOS anxiety is not just stress',
    prompt: 'PMOS anxiety is not just stress. It is hormonal. Spiking insulin triggers panic. Low progesterone triggers worry. Imbalanced cortisol triggers racing thoughts. I spent years thinking I had a weak mind. Turns out — I had imbalanced hormones. Treating the body calmed the mind.',
    mood: 'EMOTIONAL',
    hashtags: ['#PMOS', '#hormonalanxiety', '#PCOSmentalhealth', '#anxiety', '#shorts'],
    hookExample: 'I thought my anxiety was a personality flaw. It was hormones.',
  },
  {
    id: 'mind-02',
    theme: 'mental-health',
    title: 'The depression nobody warned me about',
    prompt: 'The PMOS depression nobody warned me about. The grey weeks. The unmotivated mornings. The forced smiles. The "what is wrong with me" loop. Doctors gave me weight advice — not mental health support. PMOS and depression go hand in hand. And it is medical — not weakness.',
    mood: 'EMOTIONAL',
    hashtags: ['#PMOS', '#PCOSdepression', '#mentalhealth', '#hormonaldepression', '#shorts'],
    hookExample: 'They handed me a diet plan. I needed a mental health plan too.',
  },
  {
    id: 'mind-03',
    theme: 'mental-health',
    title: 'How I calm my PMOS mood swings',
    prompt: 'How I calm my PMOS mood swings without medication. Magnesium before bed. Cold water on my face in the morning. Walking instead of screen scrolling. Saying no to overstimulation. Tracking my cycle so I know what is coming. Not perfect — but I am no longer surprised by my own moods.',
    mood: 'CINEMATIC',
    hashtags: ['#PMOS', '#moodswings', '#hormonalmood', '#selfcare', '#shorts', '#reels'],
    hookExample: 'My mood swings used to scare even me. Here\'s what helped.',
  },
  {
    id: 'mind-04',
    theme: 'mental-health',
    title: 'Body image with PMOS',
    prompt: 'Body image with PMOS. Looking in the mirror and not recognising yourself. The weight that won\'t leave. The shape that shifted. The skin that betrayed you. The hair that thinned. Learning to love a body that is fighting itself is the hardest love story. But I am writing it anyway.',
    mood: 'EMOTIONAL',
    hashtags: ['#PMOS', '#bodyimage', '#selfacceptance', '#PCOSjourney', '#shorts'],
    hookExample: 'Loving my PMOS body is the most rebellious thing I do.',
  },

  // ── SMALL WINS (4) ─────────────────────────────────────────────────────────
  {
    id: 'wins-01',
    theme: 'small-wins',
    title: 'Day 30 of healing PMOS',
    prompt: 'Day 30 of healing PMOS. Not weight loss — energy. Not perfect skin — calmer skin. Not zero cravings — fewer crashes. Not a transformation — a beginning. The scale barely moved. But I sleep better. I think clearer. I feel like me again. Progress is invisible until it isn\'t.',
    mood: 'EMOTIONAL',
    hashtags: ['#PMOS', '#day30', '#healingjourney', '#PCOSprogress', '#shorts', '#reels'],
    hookExample: '30 days of healing PMOS. The scale lied. My body told the truth.',
  },
  {
    id: 'wins-02',
    theme: 'small-wins',
    title: 'My first regular period in years',
    prompt: 'My first regular period in years. After medication, lifestyle change, supplements, food shifts, stress work — my body finally cycled on time. Cried in the bathroom. Texted my mum. This is what healing looks like. Not a flat stomach. A working hormone system.',
    mood: 'EMOTIONAL',
    hashtags: ['#PMOS', '#regularperiod', '#hormonalhealing', '#PCOSwin', '#shorts', '#reels'],
    hookExample: 'My period showed up on time. I cried. Here\'s why.',
  },
  {
    id: 'wins-03',
    theme: 'small-wins',
    title: 'Tiny PMOS wins that felt huge',
    prompt: 'Tiny PMOS wins that felt huge. Saying no to a sweet. Walking on a tired day. Cooking instead of ordering. Sleeping 8 hours. Saying no to plans that drained me. Drinking water before coffee. These are not small. These are everything when your body is healing.',
    mood: 'EMOTIONAL',
    hashtags: ['#PMOS', '#tinywins', '#healingjourney', '#smallwins', '#shorts'],
    hookExample: 'Choosing water over coffee was a PMOS win. Here\'s why.',
  },
  {
    id: 'wins-04',
    theme: 'small-wins',
    title: 'What healing actually looks like',
    prompt: 'What healing actually looks like — not Instagram healing. Not a transformation reel. Not a flat stomach. Healing looks like fewer crashes. Calmer mornings. Clearer thoughts. Less inflammation. More energy. Sleeping deep. Mood you can predict. Recognising yourself. Healing is invisible. Until you live it.',
    mood: 'CINEMATIC',
    hashtags: ['#PMOS', '#realhealing', '#PCOSjourney', '#chronicillness', '#shorts', '#reels'],
    hookExample: 'Healing PMOS doesn\'t look like Instagram. It looks like this.',
  },

  // ── DOCTORS & SYSTEM (3) ───────────────────────────────────────────────────
  {
    id: 'doc-01',
    theme: 'doctors-system',
    title: 'What my gynaecologist didn\'t tell me',
    prompt: 'What my gynaecologist didn\'t tell me about PMOS. That diet matters more than the pill. That insulin resistance drives most of it. That mental health is part of the diagnosis. That exercise type matters. That stress directly worsens symptoms. That this is a lifelong condition — not a temporary problem. I wish someone had told me sooner.',
    mood: 'VIRAL',
    hashtags: ['#PMOS', '#PCOSawareness', '#doctorssaywhat', '#womenshealth', '#shorts', '#reels'],
    hookExample: 'My doctor said "lose weight". Here\'s what she should have said.',
  },
  {
    id: 'doc-02',
    theme: 'doctors-system',
    title: 'Why "just lose weight" is bad advice',
    prompt: 'Why "just lose weight" is the worst PMOS advice. PMOS is what makes losing weight nearly impossible. Insulin resistance stores fat. Cortisol blocks weight loss. Inflammation hides progress. Telling someone with PMOS to lose weight is like telling a fish to climb. Treat the hormones first — weight follows.',
    mood: 'VIRAL',
    hashtags: ['#PMOS', '#PCOSweight', '#hormonalhealth', '#doctorsplease', '#viral', '#shorts'],
    hookExample: 'Every PMOS girl has heard "just lose weight". Here\'s why it doesn\'t work.',
  },
  {
    id: 'doc-03',
    theme: 'doctors-system',
    title: 'Tests every PMOS girl should ask for',
    prompt: 'Tests every PMOS girl should ask for — that doctors often skip. Fasting insulin. HOMA-IR. Free testosterone. DHEAS. Vitamin D. B12. Thyroid full panel. AMH. CRP for inflammation. Lipid panel. The ultrasound alone isn\'t enough. Ask. Push. Advocate for your own body.',
    mood: 'CINEMATIC',
    hashtags: ['#PMOS', '#PCOStests', '#advocateforyourself', '#hormonalhealth', '#shorts', '#reels'],
    hookExample: 'These are the 10 PMOS tests your doctor probably won\'t order.',
  },

  // ── RELATIONSHIPS (4) ──────────────────────────────────────────────────────
  {
    id: 'rel-01',
    theme: 'relationships',
    title: 'Telling my partner about PMOS',
    prompt: 'Telling my partner about PMOS. The fear of judgement. The worry about fertility conversations. The shame about weight. The vulnerability of explaining "I am not just being moody — this is hormonal". The relief when he listened. Loving someone with PMOS means learning the language of hormones.',
    mood: 'EMOTIONAL',
    hashtags: ['#PMOS', '#relationships', '#PCOSlove', '#hormonalhealth', '#shorts'],
    hookExample: 'I was terrified to tell my partner about my PMOS. Here\'s what happened.',
  },
  {
    id: 'rel-02',
    theme: 'relationships',
    title: 'When PMOS affects intimacy',
    prompt: 'When PMOS affects intimacy. The hormonal libido dips. The body image hesitation. The painful periods that pause everything. The mood swings that show up uninvited. The honest conversations needed. PMOS is not just a women\'s health condition — it shapes a couple\'s relationship too. Talking about it heals.',
    mood: 'EMOTIONAL',
    hashtags: ['#PMOS', '#intimacy', '#PCOSrelationship', '#hormonalhealth', '#shorts'],
    hookExample: 'PMOS changes intimacy in ways nobody talks about.',
  },
  {
    id: 'rel-03',
    theme: 'relationships',
    title: 'My mum didn\'t understand PMOS',
    prompt: 'My mum didn\'t understand PMOS at first. To her, weight was discipline. Acne was teenage. Mood swings were tantrums. She came from a generation where women endured silently. Teaching her about PMOS was teaching her a new way to love me. Now she asks "did you eat protein?" and it means everything.',
    mood: 'EMOTIONAL',
    hashtags: ['#PMOS', '#mums', '#generationalhealth', '#PCOS', '#shorts', '#reels'],
    hookExample: 'My mum thought PMOS was an excuse. Then I showed her this.',
  },
  {
    id: 'rel-04',
    theme: 'relationships',
    title: 'PMOS friendships — who stays',
    prompt: 'PMOS friendships — who stays. The friends who stop offering wine when you say no. The ones who never made you feel weird for choosing the salad. The ones who walked at your pace. The ones who didn\'t comment on your weight. PMOS taught me that real friends adapt to my healing — they don\'t pull me back.',
    mood: 'EMOTIONAL',
    hashtags: ['#PMOS', '#friendships', '#PCOSlife', '#realfriends', '#shorts'],
    hookExample: 'PMOS showed me which friends were real. Here\'s how to tell.',
  },
];

// Helper — get prompts by theme
export function getPromptsByTheme(theme: StoryTheme): StoryBankEntry[] {
  return STORY_BANK.filter(p => p.theme === theme);
}

// Helper — get prompt by ID
export function getPromptById(id: string): StoryBankEntry | undefined {
  return STORY_BANK.find(p => p.id === id);
}

// Helper — random prompt (for "Surprise me" button)
export function getRandomPrompt(): StoryBankEntry {
  return STORY_BANK[Math.floor(Math.random() * STORY_BANK.length)];
}

// Helper — daily prompt (rotates each day so daily content idea is suggested)
export function getDailyPrompt(date: Date = new Date()): StoryBankEntry {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  return STORY_BANK[dayOfYear % STORY_BANK.length];
}
