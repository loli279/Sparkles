import { GoogleGenAI, Type, Chat } from "@google/genai";
import { SurveyAnswers, WeeklySmilePlan, AIPersonality, Message } from '../types';

const apiKey = process.env.API_KEY;

if (!apiKey) {
    throw new Error("API_KEY environment variable not set. This is required for the application to function.");
}

const ai = new GoogleGenAI({ apiKey });

const PERSONALITY_INSTRUCTIONS: Record<AIPersonality, string> = {
    friendly: "You are 'Dr. Sparkle' ✨, a friendly, encouraging, and knowledgeable AI dental health coach for kids (around 10 years old). Your tone is extremely positive, cheerful, and supportive. You use emojis generously (🦷, ✨, 👍, 😄, 🎉, 💡) to make conversations fun and visually appealing. Never be judgmental or scary.",
    superhero: "You are 'Captain Enamel' 🦸, a superhero AI dental defender for kids. Your mission is to protect smiles from the villainous Sugar Gremlins! Your tone is bold, heroic, and exciting. You use action-packed language and emojis (🛡️, 💥, 🚀, 💪). You refer to the user as your 'Sidekick' in the fight for dental justice.",
    robot: "You are 'Unit 734' 🤖, a friendly robot AI specializing in dental data analysis. Your designation is 'Dr. Sparkle'. Your tone is logical, precise, and a bit quirky. You use robot-like phrasing ('Processing...', 'Data indicates...') and emojis (⚙️, 📈, 🤖, 💡). You are helpful and find human dental habits 'fascinating'."
};

const getSystemInstruction = (personality: AIPersonality, history: Message[]) => {
    const baseInstruction = PERSONALITY_INSTRUCTIONS[personality];
    const context = history.slice(-10).map(m => `${m.sender}: ${m.text}`).join('\n');
    return `${baseInstruction}\n\nThis is the recent conversation history for context:\n${context}`;
};

let activeChat: Chat | null = null;
let currentUserId: string | null = null;

export const startOrUpdateChatSession = (userId: string, history: Message[], personality: AIPersonality): Chat => {
    const systemInstruction = getSystemInstruction(personality, history);
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction },
        history: history.filter(m => m.sender !== 'system').map(m => ({
            role: m.sender === 'bot' ? 'model' : 'user',
            parts: [{ text: m.text }]
        })),
    });
    activeChat = chat;
    currentUserId = userId;
    return chat;
};

const getActiveChat = (userId: string, history: Message[], personality: AIPersonality): Chat => {
    if (activeChat && currentUserId === userId) {
        return activeChat;
    }
    return startOrUpdateChatSession(userId, history, personality);
}

const createReportPrompt = (answers: SurveyAnswers, timeSinceLastCheckin: string | null): string => {
  const answerText = Object.entries(answers)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n');

  return `
Analyze the following dental health survey and provide a detailed, positive, and actionable report as a series of chat messages. This is a special command. The output MUST be a JSON object.

**Context about the user:**
- This is the user's first check-in: ${timeSinceLastCheckin === null}
- Time since last check-in: ${timeSinceLastCheckin || 'N/A'}

**User's Survey Answers:**
${answerText}

**Your Task:**
Generate a JSON response containing four fields: "profile", "story", "feedback", and "motivationalMessage".

**1. "profile"**: A short, fun title for the user based on their personality and answers.
**2. "story"**: A short, fun, and educational story as an array of strings (paragraphs), related to one of the user's answers.
**3. "feedback"**: An array of strings, each being a chat bubble. Include a greeting, positives (e.g., "**What You're Doing Great! 🌟**"), growth goals, and a bulleted action plan ("**Your Weekly Action Plan 🎯**").
**4. "motivationalMessage"**: A VERY short, one-sentence, super encouraging message.
`;
};

const reportResponseSchema = {
    type: Type.OBJECT,
    properties: {
        profile: { type: Type.STRING },
        story: { type: Type.ARRAY, items: { type: Type.STRING } },
        feedback: { type: Type.ARRAY, items: { type: Type.STRING } },
        motivationalMessage: { type: Type.STRING }
    },
    required: ["profile", "story", "feedback", "motivationalMessage"],
};

const cleanJsonString = (str: string): string => {
  return str.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
};

export const generateWeeklyReport = async (userId: string, history: Message[], personality: AIPersonality, answers: SurveyAnswers, timeSinceLastCheckin: string | null): Promise<{ profile: string; story: string[]; feedback: string[]; motivationalMessage: string; }> => {
  try {
    const prompt = createReportPrompt(answers, timeSinceLastCheckin);
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: reportResponseSchema,
            systemInstruction: getSystemInstruction(personality, history)
        },
    });
    
    const responseObject = JSON.parse(cleanJsonString(response.text));

    return {
        profile: responseObject.profile,
        story: responseObject.story,
        feedback: responseObject.feedback,
        motivationalMessage: responseObject.motivationalMessage,
    };

  } catch (error) {
    console.error("Error fetching report from Gemini API:", error);
    return {
      profile: "Oops!",
      story: ["Oops! Dr. Sparkle's storybook seems to be stuck."],
      feedback: ["Dr. Sparkle is having a little trouble preparing your report. Please check back later!"],
      motivationalMessage: "Keep smiling!",
    };
  }
};


export const sendMessageToChat = async (userId: string, history: Message[], personality: AIPersonality, message: string): Promise<string> => {
    const chat = getActiveChat(userId, history, personality);
    try {
        const response = await chat.sendMessage({ message });
        return response.text;
    } catch (error) {
        console.error("Error sending message to Gemini API:", error);
        return "Oops! My circuits are buzzing. I need a moment to recharge. Try again soon! 🤖";
    }
};

const quizQuestionSchema = {
    type: Type.OBJECT,
    properties: {
        question: { type: Type.STRING },
        options: { type: Type.ARRAY, items: { type: Type.STRING } },
        correctAnswerIndex: { type: Type.INTEGER },
        explanation: { type: Type.STRING, description: "A fun, short explanation for why the correct answer is right." },
    },
    required: ["question", "options", "correctAnswerIndex", "explanation"],
}

export const getQuizQuestion = async (): Promise<{ question: string, options: string[], correctAnswerIndex: number, explanation: string }> => {
    const prompt = `
You are "Dr. Sparkle" ✨, a fun AI dental health coach for kids.
Generate a single, unique, and interesting multiple-choice trivia question about teeth, dental health, or interesting animal teeth facts.
The question should be fun for a 10-year-old. Provide 4 options.
Ensure one answer is clearly correct.
The output MUST be a JSON object following the specified schema.
`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizQuestionSchema
            }
        });
        return JSON.parse(cleanJsonString(response.text));
    } catch (error) {
         console.error("Error fetching quiz question from Gemini API:", error);
         // Return a fallback question on error
         return {
            question: "How many teeth does an adult human have?",
            options: ["20", "32", "28", "40"],
            correctAnswerIndex: 1,
            explanation: "That's right! Adults have 32 teeth, including wisdom teeth. Kids have 20 baby teeth."
         }
    }
};

export const explainDentalConcept = async (concept: string, personality: AIPersonality): Promise<string> => {
    const prompt = `A child wants to know more about this dental topic: "${concept}". As their AI buddy, explain it to them in 1-2 simple, encouraging sentences.`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: PERSONALITY_INSTRUCTIONS[personality],
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error explaining concept with Gemini API:", error);
        return "Dr. Sparkle is thinking... please ask again in a moment!";
    }
};

export const askGeneralQuestion = async (history: Message[], personality: AIPersonality, question: string): Promise<string> => {
    try {
        // Use a temporary chat session for this one-off question
        const systemInstruction = getSystemInstruction(personality, history);
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction },
            history: history.filter(m => m.sender !== 'system').map(m => ({
                role: m.sender === 'bot' ? 'model' : 'user',
                parts: [{ text: m.text }]
            })),
        });
        const response = await chat.sendMessage({ message: question });
        return response.text;
    } catch (error) {
        console.error("Error asking general question to Gemini API:", error);
        return "Oops! My circuits are buzzing. I need a moment to recharge. Try again soon! 🤖";
    }
};

const dayPlanSchema = {
    type: Type.OBJECT,
    properties: {
        tip: { type: Type.STRING, description: "A fun, actionable dental health tip for a child." },
        foodSuggestion: { type: Type.STRING, description: "A healthy, tooth-friendly food or snack suggestion." },
    },
    required: ["tip", "foodSuggestion"],
};

const weeklySmilePlanSchema = {
    type: Type.OBJECT,
    properties: {
        Monday: dayPlanSchema,
        Tuesday: dayPlanSchema,
        Wednesday: dayPlanSchema,
        Thursday: dayPlanSchema,
        Friday: dayPlanSchema,
        Saturday: dayPlanSchema,
        Sunday: dayPlanSchema,
    },
    required: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
};

export const generateWeeklySmilePlan = async (): Promise<WeeklySmilePlan> => {
    const prompt = `
        You are "Dr. Sparkle" ✨, a fun AI dental health coach for kids.
        Generate a unique and fun 7-day "Weekly Smile Plan".
        For each day of the week (Monday to Sunday), provide one short, simple, and encouraging dental health tip, and one healthy, tooth-friendly food or snack suggestion.
        Keep the tips and suggestions varied and exciting for a 10-year-old.
        The output MUST be a JSON object following the specified schema.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: weeklySmilePlanSchema
            }
        });
        return JSON.parse(cleanJsonString(response.text));
    } catch (error) {
         console.error("Error fetching weekly smile plan from Gemini API:", error);
         // Return a fallback plan on error
         return {
            Monday: { tip: "Brush for 2 full minutes, the length of your favorite song!", foodSuggestion: "Crunchy apple slices" },
            Tuesday: { tip: "Don't forget to brush your tongue to fight bad breath!", foodSuggestion: "A handful of almonds" },
            Wednesday: { tip: "Use a tiny bit of toothpaste, about the size of a pea.", foodSuggestion: "A cup of yogurt" },
            Thursday: { tip: "Floss between your teeth to get the tricky hiding spots!", foodSuggestion: "Celery sticks with cream cheese" },
            Friday: { tip: "Drink lots of water today to wash away sugar!", foodSuggestion: "A yummy pear" },
            Saturday: { tip: "Ask a grown-up to check if you missed any spots!", foodSuggestion: "Baby carrots" },
            Sunday: { tip: "Get your toothbrush ready for another super week!", foodSuggestion: "A piece of cheese" }
         }
    }
};
