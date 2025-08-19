
import { Question } from './types';

export const APP_VERSION = '1.0.0-beta';

export const LATEST_CHANGES = [
  "Welcome to the Dr. Sparkle Beta! This is our first major public release.",
  "Polished UI: We've refined every screen for a cleaner, more joyful experience.",
  "Parental Controls: Parents can now manage child accounts from a dedicated dashboard.",
  "Performance Boost: The app is now faster and more responsive thanks to a major code cleanup."
];

export const INITIAL_SURVEY_QUESTIONS: Question[] = [
  // Section 1: Daily Brushing Habits
  {
    id: 'q1_brush_frequency',
    text: 'How many times a day do you brush your teeth?',
    type: 'choice',
    options: ['None', 'Once', 'Twice', 'More than twice'],
  },
  {
    id: 'q2_brush_duration',
    text: 'How long do you usually brush your teeth for?',
    type: 'choice',
    options: ['Less than a minute', 'About 2 minutes', 'More than 2 minutes'],
  },
  {
    id: 'q3_toothbrush_type',
    text: 'What kind of toothbrush do you use?',
    type: 'choice',
    options: ['Regular (manual)', 'Electric'],
  },
  {
    id: 'q4_tongue_brushing',
    text: 'Do you also brush your tongue?',
    type: 'choice',
    options: ['Yes, every time', 'Sometimes', 'No, I forget'],
  },

  // Section 2: Flossing and Rinsing
  {
    id: 'q5_floss_frequency',
    text: 'Do you floss?',
    type: 'choice',
    options: ['Every day!', 'A few times a week', 'Sometimes', "I don't floss"],
  },
  {
    id: 'q6_gums_bleeding',
    text: 'Do your gums ever bleed when you brush or floss?',
    type: 'choice',
    options: ['Often', 'Sometimes', 'Never'],
  },
  {
    id: 'q7_mouthwash_use',
    text: 'Do you use mouthwash?',
    type: 'choice',
    options: ['Every day', 'Sometimes', 'Never'],
  },

  // Section 3: Diet and Eating Habits
  {
    id: 'q8_drinks',
    text: 'What kind of drinks do you have most often?',
    type: 'text',
    placeholder: 'e.g., water, milk, soda, juice',
  },
  {
    id: 'q9_sugary_snacks',
    text: 'How often do you eat sugary snacks (like candy or cookies)?',
    type: 'choice',
    options: ['Multiple times a day', 'Once a day', 'A few times a week', 'Rarely or never'],
  },
  {
    id: 'q10_night_routine',
    text: 'Is brushing your teeth the last thing you do before bed?',
    type: 'choice',
    options: ['Yes, always!', 'Usually', 'No, I eat/drink after'],
  },

  // Section 4: Dental Health History & Professional Care
  {
    id: 'q11_cavity_history',
    text: 'Have you ever had a cavity?',
    type: 'choice',
    options: ["I'm not sure", 'Yes', 'No'],
  },
  {
    id: 'q12_dentist_visits',
    text: 'How many times do you visit the dentist each year?',
    type: 'text',
    placeholder: 'e.g., once, twice, never',
  },
  {
    id: 'q13_dentist_feeling',
    text: 'How do you feel about visiting the dentist?',
    type: 'choice',
    options: ['I like it!', "It's okay", 'I get a little nervous', "I don't like it"],
  },

  // Section 5: Knowledge and Fun
  {
    id: 'q14_toothpaste_flavor',
    text: 'Just for fun: what flavor of toothpaste do you use?',
    type: 'text',
    placeholder: 'e.g., mint, bubblegum, strawberry',
  },
  {
    id: 'q15_improvement_goal',
    text: 'What is one thing you would like to get better at?',
    type: 'text',
    placeholder: 'e.g., flossing more, brushing longer',
  },
  {
    id: 'q16_who_taught_you',
    text: 'Who taught you how to brush your teeth?',
    type: 'text',
    placeholder: 'e.g., my mom, my dentist, a video',
  },
];


export const WEEKLY_SURVEY_QUESTIONS: Question[] = [
  {
    id: 'q1_brush_frequency',
    text: "How many times a day have you been brushing your teeth this week?",
    type: 'choice',
    options: ['None', 'Once', 'Twice', 'More than twice'],
  },
  {
    id: 'q2_brush_duration',
    text: 'Great! And how long were your brushing sessions?',
    type: 'choice',
    options: ['Less than a minute', 'About 2 minutes', 'More than 2 minutes'],
  },
  {
    id: 'q5_floss_frequency',
    text: 'How has flossing been going?',
    type: 'choice',
    options: ['Every day!', 'A few times a week', 'Sometimes', "I didn't floss"],
  },
   {
    id: 'q9_sugary_snacks',
    text: 'How about sugary snacks (like candy or cookies)?',
    type: 'choice',
    options: ['Multiple times a day', 'Once a day', 'A few times a week', 'Rarely or never'],
  },
  {
    id: 'q10_night_routine',
    text: 'Was brushing your teeth the very last thing you did before bed?',
    type: 'choice',
    options: ['Yes, always!', 'Usually', 'No, I ate/drank after'],
  },
  {
    id: 'q15_improvement_goal',
    text: "Finally, what's one thing you'd like to work on this week?",
    type: 'text',
    placeholder: 'e.g., Flossing every night',
  },
];

const allQuestions: Question[] = [...INITIAL_SURVEY_QUESTIONS, ...WEEKLY_SURVEY_QUESTIONS];
export const ALL_QUESTIONS_MAP = new Map<string, Question>();
allQuestions.forEach(q => {
    if (!ALL_QUESTIONS_MAP.has(q.id)) {
        ALL_QUESTIONS_MAP.set(q.id, q);
    }
});