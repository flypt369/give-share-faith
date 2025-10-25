import { NeedCategory, GiftCategory, GiverType } from '../types/database';

const needKeywords: Record<NeedCategory, string[]> = {
  food: ['food', 'hungry', 'meal', 'groceries', 'pantry', 'eat', 'comida', 'manje', '食物', 'bread', 'dinner', 'lunch', 'breakfast'],
  shelter: ['shelter', 'housing', 'home', 'homeless', 'rent', 'eviction', 'place to stay', 'refugio', 'abri', '住所', 'roof', 'apartment'],
  employment: ['job', 'work', 'employment', 'hire', 'career', 'resume', 'empleo', 'travay', '就业', 'income', 'training'],
  spiritual: ['pray', 'prayer', 'faith', 'church', 'god', 'jesus', 'spiritual', 'hope', 'peace', 'lapriyè', '祈祷', 'soul', 'worship'],
  other: ['help', 'need', 'assist', 'support', 'ayuda', 'ede', '帮助'],
};

const giftKeywords: Record<GiftCategory, string[]> = {
  food: ['food', 'meal', 'groceries', 'pantry', 'donate food', 'comida', 'manje', '食物', 'cook', 'feed'],
  shelter: ['shelter', 'housing', 'room', 'space', 'place', 'refugio', 'abri', '住所', 'bed', 'apartment'],
  employment: ['job', 'hire', 'position', 'work', 'empleo', 'travay', '就业', 'training', 'mentor'],
  spiritual: ['pray', 'prayer', 'counsel', 'church', 'spiritual', 'lapriyè', '祈祷', 'minister', 'support'],
  financial: ['money', 'donate', 'fund', 'grant', 'sponsor', 'cash', 'donation', 'finansye', '财务', 'contribute'],
  volunteer: ['volunteer', 'time', 'help', 'serve', 'volontè', '志愿者', 'assist', 'service'],
  other: ['help', 'give', 'share', 'ayuda', 'bay', '帮助', 'support'],
};

const institutionalKeywords = [
  'grant', 'sponsor', 'foundation', 'corporate', 'csr', 'business', 'company',
  'llc', 'inc', 'corporation', 'organization', 'charity', 'nonprofit',
  'inventory', 'bulk', 'wholesale', 'institutional'
];

export function classifyNeed(text: string): NeedCategory {
  const lowerText = text.toLowerCase();
  const scores: Record<NeedCategory, number> = {
    food: 0,
    shelter: 0,
    employment: 0,
    spiritual: 0,
    other: 0,
  };

  Object.entries(needKeywords).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        scores[category as NeedCategory] += 1;
      }
    });
  });

  const maxCategory = Object.entries(scores).reduce((max, [cat, score]) =>
    score > max[1] ? [cat, score] : max
  , ['other', 0]);

  return maxCategory[1] > 0 ? maxCategory[0] as NeedCategory : 'other';
}

export function classifyGift(text: string): GiftCategory {
  const lowerText = text.toLowerCase();
  const scores: Record<GiftCategory, number> = {
    food: 0,
    shelter: 0,
    employment: 0,
    spiritual: 0,
    financial: 0,
    volunteer: 0,
    other: 0,
  };

  Object.entries(giftKeywords).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        scores[category as GiftCategory] += 1;
      }
    });
  });

  const maxCategory = Object.entries(scores).reduce((max, [cat, score]) =>
    score > max[1] ? [cat, score] : max
  , ['other', 0]);

  return maxCategory[1] > 0 ? maxCategory[0] as GiftCategory : 'other';
}

export function detectGiverType(text: string): GiverType {
  const lowerText = text.toLowerCase();

  for (const keyword of institutionalKeywords) {
    if (lowerText.includes(keyword)) {
      if (lowerText.includes('church')) return 'church';
      if (lowerText.includes('foundation')) return 'foundation';
      if (lowerText.includes('corporate') || lowerText.includes('corporation')) return 'corporation';
      return 'business';
    }
  }

  return 'individual';
}

export function generatePrayer(requestText: string, language: string = 'en'): string {
  const prayers: Record<string, string[]> = {
    en: [
      `Lord, we lift up this need to You with faith and trust. ${requestText}. May Your peace surround this situation, and may Your provision meet every need. We pray for strength, hope, and Your loving presence. In Your name, Amen.`,
      `Heavenly Father, we come before You with hearts open to Your grace. We pray for ${requestText}. Let Your compassion flow through this community, and guide us to be vessels of Your love and support. Amen.`,
      `Gracious God, we ask for Your blessing upon ${requestText}. May hope be renewed, burdens be lifted, and may neighbors come together in Your spirit of generosity and care. Amen.`,
    ],
    es: [
      `Señor, elevamos esta necesidad a Ti con fe y confianza. ${requestText}. Que Tu paz rodee esta situación, y que Tu provisión satisfaga cada necesidad. Oramos por fuerza, esperanza y Tu amorosa presencia. En Tu nombre, Amén.`,
      `Padre Celestial, venimos ante Ti con corazones abiertos a Tu gracia. Oramos por ${requestText}. Que Tu compasión fluya a través de esta comunidad, y guíanos para ser vasijas de Tu amor y apoyo. Amén.`,
    ],
    ht: [
      `Senyè, nou leve bezwen sa a bay Ou avèk lafwa ak konfyans. ${requestText}. Kite lapè Ou antoure sitiyasyon sa a, epi kite pwovizyon Ou satisfè tout bezwen. Nou priye pou fòs, espwa ak prezans lanmou Ou. Nan non Ou, Amèn.`,
    ],
    zh: [
      `主啊，我们怀着信心和信任将这个需要带到您面前。${requestText}。愿您的平安环绕这个情况，愿您的供应满足每一个需要。我们祈求力量、希望和您慈爱的同在。奉您的名，阿们。`,
    ],
  };

  const languagePrayers = prayers[language] || prayers.en;
  return languagePrayers[Math.floor(Math.random() * languagePrayers.length)];
}
