export const ENCOURAGING_QUOTES = [
  "You're doing wonderfully today. \u2728",
  "Small steps, big magic. Keep that momentum going!",
  "A moment of reflection is never wasted.",
  "Be gentle with yourself \u2014 you're growing.",
  "Today is a fresh page. What will you write on it?",
  "Even the slowest progress is still progress.",
  "You've got this. One cozy moment at a time.",
  "Notice the small wins. They add up.",
]

export const JOURNAL_PROMPTS = [
  "What made you smile today?",
  "What are you grateful for, however small?",
  "What's one thing you learned today?",
  "What did your body need today, and did you give it?",
  "Who made today feel a little brighter?",
  "What's something you're looking forward to?",
  "What's a tiny win from today?",
  "How did you take care of yourself today?",
]

export function pickQuoteFromDate(): string {
  const day = new Date().getDate()
  return ENCOURAGING_QUOTES[day % ENCOURAGING_QUOTES.length] ?? ENCOURAGING_QUOTES[0]!
}

export function pickJournalPromptFromDate(): string {
  const day = new Date().getDate()
  return JOURNAL_PROMPTS[day % JOURNAL_PROMPTS.length] ?? JOURNAL_PROMPTS[0]!
}

export function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 5) return 'Still up'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Cozy night'
}
