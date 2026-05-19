import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper to set a date relative to today, at a specified hour
function daysFromNow(days: number, hour = 9, minute = 0): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, minute, 0, 0)
  return d
}

function dateAtMidnight(daysAgo: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(0, 0, 0, 0)
  return d
}

async function main() {
  // ---------- TASKS (seeded demo data, ownerId = null) ----------
  const taskData = [
    // Home Renovation
    { title: 'Pick paint colors for living room', project: 'Home Renovation', priority: 'medium', completed: false, dueDate: daysFromNow(2) },
    { title: 'Schedule electrician visit', project: 'Home Renovation', priority: 'high', completed: false, dueDate: daysFromNow(1) },
    { title: 'Order new kitchen cabinets', project: 'Home Renovation', priority: 'high', completed: true, dueDate: daysFromNow(-3) },
    { title: 'Research flooring options', project: 'Home Renovation', priority: 'low', completed: true, dueDate: daysFromNow(-5) },
    { title: 'Install new light fixtures', project: 'Home Renovation', priority: 'medium', completed: false, dueDate: daysFromNow(7) },

    // Work Projects
    { title: 'Finalize Q4 marketing strategy deck', project: 'Work Projects', priority: 'high', completed: false, dueDate: daysFromNow(0, 17, 0) },
    { title: 'Review pull requests from team', project: 'Work Projects', priority: 'medium', completed: false, dueDate: daysFromNow(0, 15, 30) },
    { title: 'Submit expense report', project: 'Work Projects', priority: 'low', completed: true, dueDate: daysFromNow(-2) },
    { title: 'Prepare for Monday client meeting', project: 'Work Projects', priority: 'high', completed: false, dueDate: daysFromNow(3, 10, 0) },
    { title: 'Update project documentation', project: 'Work Projects', priority: 'medium', completed: false, dueDate: daysFromNow(5) },

    // Personal Growth
    { title: 'Finish reading "Atomic Habits"', project: 'Personal Growth', priority: 'low', completed: false, dueDate: daysFromNow(10) },
    { title: 'Practice Spanish on Duolingo (30 min)', project: 'Personal Growth', priority: 'medium', completed: true, dueDate: daysFromNow(0, 20, 0) },
    { title: 'Sign up for pottery class', project: 'Personal Growth', priority: 'low', completed: false, dueDate: daysFromNow(4) },
    { title: 'Plan weekend hike with friends', project: 'Personal Growth', priority: 'medium', completed: false, dueDate: daysFromNow(2, 18, 0) },
    { title: 'Update LinkedIn profile', project: 'Personal Growth', priority: 'low', completed: true, dueDate: daysFromNow(-7) },
  ]

  for (const t of taskData) {
    const existing = await prisma.task.findFirst({ where: { title: t.title, ownerId: null } })
    if (!existing) {
      await prisma.task.create({ data: { ...t, ownerId: null } })
    }
  }

  // ---------- EVENTS ----------
  const eventData = [
    { title: 'Team standup', startTime: daysFromNow(0, 9, 30), endTime: daysFromNow(0, 10, 0), category: 'work', location: 'Zoom' },
    { title: 'Coffee with Sarah', startTime: daysFromNow(0, 14, 0), endTime: daysFromNow(0, 15, 0), category: 'social', location: 'Java House' },
    { title: 'Yoga class', startTime: daysFromNow(1, 7, 0), endTime: daysFromNow(1, 8, 0), category: 'health', location: 'Mindful Studio' },
    { title: 'Doctor appointment', startTime: daysFromNow(2, 11, 0), endTime: daysFromNow(2, 12, 0), category: 'health', location: 'Wellness Clinic' },
    { title: 'Client presentation', startTime: daysFromNow(3, 10, 0), endTime: daysFromNow(3, 11, 30), category: 'work', location: 'Conference Room A' },
    { title: 'Dinner with Mom', startTime: daysFromNow(3, 19, 0), endTime: daysFromNow(3, 21, 0), category: 'personal', location: 'Bella\'s Trattoria' },
    { title: 'Book club: "The Midnight Library"', startTime: daysFromNow(4, 18, 30), endTime: daysFromNow(4, 20, 30), category: 'social', location: 'Riverside Library' },
    { title: 'Weekend hike', startTime: daysFromNow(5, 8, 0), endTime: daysFromNow(5, 12, 0), category: 'health', location: 'Cedar Park Trail' },
    { title: 'Brunch with the gang', startTime: daysFromNow(6, 11, 0), endTime: daysFromNow(6, 13, 0), category: 'social', location: 'Sunny Side Up' },
    { title: 'Quarterly review', startTime: daysFromNow(7, 14, 0), endTime: daysFromNow(7, 16, 0), category: 'work', location: 'Office' },
    { title: 'Pottery class trial', startTime: daysFromNow(8, 18, 0), endTime: daysFromNow(8, 20, 0), category: 'personal', location: 'Clay & Co. Studio' },
    { title: 'Annual physical', startTime: daysFromNow(11, 9, 0), endTime: daysFromNow(11, 10, 0), category: 'health', location: 'Dr. Patel\'s Office' },
  ]

  for (const e of eventData) {
    const existing = await prisma.event.findFirst({ where: { title: e.title, ownerId: null } })
    if (!existing) {
      await prisma.event.create({ data: { ...e, ownerId: null } })
    }
  }

  // ---------- GOALS ----------
  const goalData = [
    { title: 'Run a half marathon', description: 'Train consistently and complete a 13.1 mile race this year.', category: 'health', progress: 45, targetDate: daysFromNow(120) },
    { title: 'Read 24 books this year', description: 'Two books per month — a mix of fiction and non-fiction.', category: 'personal', progress: 67, targetDate: daysFromNow(240) },
    { title: 'Learn conversational Spanish', description: 'Hold a 10-minute conversation entirely in Spanish.', category: 'personal', progress: 30, targetDate: daysFromNow(180) },
    { title: 'Save $10,000 emergency fund', description: 'Build a safety net for peace of mind.', category: 'financial', progress: 80, targetDate: daysFromNow(90) },
  ]

  for (const g of goalData) {
    const existing = await prisma.goal.findFirst({ where: { title: g.title, ownerId: null } })
    if (!existing) {
      await prisma.goal.create({ data: { ...g, ownerId: null } })
    }
  }

  // ---------- HABITS ----------
  const habitDefs = [
    { name: 'Meditate', icon: 'sparkles', color: '#8FAE7E', completionPattern: (d: number) => d % 3 !== 2 }, // most days
    { name: 'Exercise', icon: 'dumbbell', color: '#C67B5C', completionPattern: (d: number) => d < 6 ? d % 2 === 0 : d % 2 === 1 }, // every other day
    { name: 'Read 30 minutes', icon: 'book-open', color: '#D4A843', completionPattern: (d: number) => d !== 4 && d !== 11 }, // mostly
    { name: 'Drink 8 glasses of water', icon: 'droplet', color: '#60B5FF', completionPattern: (d: number) => d % 5 !== 0 }, // most
    { name: 'Journal', icon: 'pen-tool', color: '#A19AD3', completionPattern: (d: number) => [0, 1, 3, 5, 7, 9, 12].includes(d) }, // mixed
  ]

  for (const h of habitDefs) {
    let habit = await prisma.habit.findFirst({ where: { name: h.name, ownerId: null } })
    if (!habit) {
      habit = await prisma.habit.create({ data: { name: h.name, icon: h.icon, color: h.color, ownerId: null } })
    }

    // 30 days of history
    for (let d = 0; d < 30; d++) {
      const date = dateAtMidnight(d)
      const completed = h.completionPattern(d)
      if (completed) {
        await prisma.habitLog.upsert({
          where: { habitId_date: { habitId: habit.id, date } },
          update: { completed: true },
          create: { habitId: habit.id, date, completed: true, ownerId: null },
        })
      }
    }
  }

  // ---------- JOURNAL ENTRIES ----------
  const journalData = [
    {
      title: 'A quiet morning',
      content: "Woke up early today and made coffee in the slow, deliberate way I love. Watched the sunrise from the kitchen window — soft pinks and oranges spilling over the rooftops. I forget how grounding these small rituals are. Promised myself I'd do this more often.",
      mood: 'calm',
      daysAgo: 0,
    },
    {
      title: 'Small wins matter',
      content: "Finally tackled the inbox today. Went from 247 to zero. It sounds silly but it felt like lifting a weight off my chest. The to-do list is shrinking, and I'm starting to feel like myself again. One small win at a time.",
      mood: 'happy',
      daysAgo: 1,
    },
    {
      title: 'A tough conversation',
      content: "Had a hard talk with M. today. We've been dancing around things for weeks, and finally just laid it all out. Tense, but honest. I think we both feel a little lighter for it. Honesty really is a kindness, even when it stings.",
      mood: 'frustrated',
      daysAgo: 3,
    },
    {
      title: 'Gratitude list',
      content: "Three things I'm grateful for today: 1) The way the dog sighs when she settles down for the night. 2) Strawberries from the farmers market. 3) That my best friend remembered to text me 'thinking of you.' Little things — but they add up.",
      mood: 'happy',
      daysAgo: 5,
    },
    {
      title: 'Rainy Sunday',
      content: "Spent the day inside listening to rain on the windows. Read three chapters of my novel, made a pot of soup, called Mom. There's something so cozy about a slow day with no obligations. Feeling reset.",
      mood: 'calm',
      daysAgo: 7,
    },
  ]

  for (const j of journalData) {
    const created = new Date()
    created.setDate(created.getDate() - j.daysAgo)
    created.setHours(20, 30, 0, 0)

    const existing = await prisma.journalEntry.findFirst({ where: { title: j.title, ownerId: null } })
    if (!existing) {
      await prisma.journalEntry.create({
        data: {
          title: j.title,
          content: j.content,
          mood: j.mood,
          ownerId: null,
          createdAt: created,
          updatedAt: created,
        },
      })
    }
  }

  // ---------- MOOD ENTRIES (last 7 days) ----------
  const moodHistory = ['calm', 'happy', 'happy', 'neutral', 'frustrated', 'happy', 'calm']
  for (let d = 0; d < 7; d++) {
    const date = dateAtMidnight(d)
    const existing = await prisma.moodEntry.findFirst({ where: { date, ownerId: null } })
    if (!existing) {
      await prisma.moodEntry.create({
        data: { mood: moodHistory[d] ?? 'neutral', date, ownerId: null },
      })
    }
  }

  console.log('✅ Seed complete: hearth life-planner is cozy and ready.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
