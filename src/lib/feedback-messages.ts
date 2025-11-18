/**
 * Feedback Message System
 *
 * Generates context-aware, encouraging feedback messages for students
 * based on their performance, streak, speed, and difficulty level.
 */

export interface FeedbackContext {
  isCorrect: boolean
  streak: number
  timeSpent: number
  difficulty: 'basic' | 'intermediate' | 'advanced'
  attempts: number // How many times student has seen this problem
  problemsCompleted: number
  multiplicand: number
  multiplier: number
}

const CORRECT_MESSAGES = {
  default: [
    "Awesome! 🎉",
    "Perfect! ⭐",
    "You got it! 🎯",
    "Excellent! 💫",
    "Brilliant! 💡",
    "Fantastic! 🌟",
    "You're amazing! 🚀",
    "Outstanding! 🏆",
    "Spectacular! ✨",
    "Incredible! 🌈"
  ],
  streak: {
    3: "Three in a row! You're on fire! 🔥",
    5: "FIVE STRAIGHT! You're unstoppable! 🔥🔥",
    7: "SEVEN! Are you a multiplication wizard?! 🧙‍♂️",
    10: "TEN IN A ROW!! This is LEGENDARY! 👑✨🎉"
  } as Record<number, string>,
  fast: [
    "Lightning fast! ⚡ How did you do that so quick?",
    "WOW! Speed demon! 🏃‍♂️💨",
    "Blink and you might miss it! So fast! ⚡⚡"
  ],
  difficulty: {
    advanced: [
      "WOW! That was a tough one and you CRUSHED it! 🎯",
      "Advanced problem? No problem for you! 💪",
      "You're ready for the hard stuff! Impressive! 🌟"
    ]
  },
  milestone: {
    5: "You've completed 5 problems! You're doing great! 🎉",
    10: "10 down! You're on a roll! Keep going! 💪",
    15: "15 problems! You're more than halfway! 🌟",
    20: "20 problems! You're a multiplication machine! 🤖"
  } as Record<number, string>
}

const INCORRECT_MESSAGES = {
  encouraging: [
    "Not quite, but that's okay! Learning happens through trying!",
    "Close! Don't worry, everyone makes mistakes while learning!",
    "That's a tricky one! Let's look at it together.",
    "Not this time, but you're getting better with each try!"
  ],
  supportive: [
    "Great effort! Let's try another one.",
    "You're learning! That's what counts! 💪",
    "Keep going! You're doing great!",
    "Nice try! Let's keep practicing!"
  ]
}

export interface FeedbackResult {
  title: string
  message: string
  encouragement?: string
  showHint?: boolean
}

/**
 * Generate context-aware feedback based on student performance
 */
export function generateFeedback(context: FeedbackContext): FeedbackResult {
  if (context.isCorrect) {
    return generateCorrectFeedback(context)
  } else {
    return generateIncorrectFeedback(context)
  }
}

function generateCorrectFeedback(context: FeedbackContext): FeedbackResult {
  // Priority order: milestone > streak > fast > difficulty > default

  // Check milestones
  if (context.problemsCompleted in CORRECT_MESSAGES.milestone) {
    return {
      title: CORRECT_MESSAGES.milestone[context.problemsCompleted],
      message: "You're making amazing progress!",
    }
  }

  // Check streaks (only for significant streaks)
  if (context.streak >= 3 && context.streak in CORRECT_MESSAGES.streak) {
    return {
      title: CORRECT_MESSAGES.streak[context.streak],
      message: "Keep this momentum going!",
    }
  }

  // Check speed (< 3 seconds is fast)
  if (context.timeSpent < 3 && context.timeSpent > 0) {
    const fastMessage = CORRECT_MESSAGES.fast[
      Math.floor(Math.random() * CORRECT_MESSAGES.fast.length)
    ]
    return {
      title: fastMessage,
      message: "Speed and accuracy - the perfect combo!",
    }
  }

  // Check difficulty
  if (context.difficulty === 'advanced') {
    const diffMessage = CORRECT_MESSAGES.difficulty.advanced[
      Math.floor(Math.random() * CORRECT_MESSAGES.difficulty.advanced.length)
    ]
    return {
      title: diffMessage,
      message: "You're ready for bigger challenges!",
    }
  }

  // Default random message
  const defaultMessage = CORRECT_MESSAGES.default[
    Math.floor(Math.random() * CORRECT_MESSAGES.default.length)
  ]
  return {
    title: defaultMessage,
    message: "",
  }
}

function generateIncorrectFeedback(context: FeedbackContext): FeedbackResult {
  const encouraging = INCORRECT_MESSAGES.encouraging[
    Math.floor(Math.random() * INCORRECT_MESSAGES.encouraging.length)
  ]

  const supportive = INCORRECT_MESSAGES.supportive[
    Math.floor(Math.random() * INCORRECT_MESSAGES.supportive.length)
  ]

  // Show hint if this is a repeated attempt
  const showHint = context.attempts > 1

  return {
    title: encouraging,
    message: "",
    encouragement: supportive,
    showHint
  }
}

/**
 * Get a helpful hint for a specific multiplication problem
 */
export function getHint(multiplicand: number, multiplier: number): string {
  const product = multiplicand * multiplier

  // Specific hints for commonly tricky problems
  const hints: Record<string, string> = {
    '7x8': '7 × 8 is like 7 groups of 8. Think: 8 + 8 + 8 + 8 + 8 + 8 + 8 = 56!',
    '8x7': '8 × 7 is like 8 groups of 7. That equals 56!',
    '6x7': '6 × 7 is the same as 7 × 6! Think of 6 groups of 7 = 42.',
    '7x6': '7 × 6 = 42. Try counting by 7s: 7, 14, 21, 28, 35, 42!',
    '9x6': '9s trick: 9 × 6 = 54. The digits 5 and 4 add up to 9!',
    '6x9': '9s trick: 6 × 9 = 54. The digits 5 + 4 = 9!',
    '8x8': '8 × 8 = 64. Double trouble makes 64!',
    '7x7': '7 × 7 = 49. Lucky number 7 times lucky number 7!',
    '9x7': '9 × 7 = 63. Think: 9 × 6 = 54, plus one more 9 = 63!',
    '7x9': '7 × 9 = 63. That\'s one less than 8 × 9 = 72!',
    '8x9': '8 × 9 = 72. Think of 8 groups of 9!',
    '9x8': '9 × 8 = 72. Almost at 9 × 9 = 81!'
  }

  const key = `${multiplicand}x${multiplier}`
  const reverseKey = `${multiplier}x${multiplicand}`

  // Return specific hint if available, otherwise general hint
  return hints[key] || hints[reverseKey] ||
         `${multiplicand} × ${multiplier} = ${product}. Try thinking of it as ${multiplicand} groups of ${multiplier}!`
}

/**
 * Format time in a friendly way
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  if (mins === 0) {
    return `${secs}s`
  }

  return `${mins}:${secs.toString().padStart(2, '0')}`
}
