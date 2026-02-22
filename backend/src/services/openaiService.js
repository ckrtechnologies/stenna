import OpenAI from "openai";
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

class OpenAiService {
    /**
     * Recommends wallpaper parameters based on quiz answers.
     * @param {Object} answers - User's quiz response.
     */
    async recommendWallpaper(answers) {
        try {
            if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
                console.warn("OpenAI API Key is missing. Falling back to local rules.");
                return this.getFallbackRecommendation(answers);
            }

            const prompt = `You are a professional interior designer and wallpaper expert. 
            A customer provided these preferences:
            - Room: ${answers.roomType}
            - Mood: ${answers.mood}
            - Desired Aesthetic: ${answers.style}
            - Preferred Colors: ${answers.colors}
            - Room Lighting: ${answers.lighting}

            Analyze their "vibe" and return a JSON object with:
            1. "tags": A list of 4-6 specific design keywords in lowercase (e.g. "warm", "textured", "classic", "minimalist").
            2. "category": One main category name that fits best (e.g. "Modern", "Classic", "Nature").
            3. "summary": A brief, premium 1-sentence headline for the recommended look.
            4. "description": A 2-3 sentence professional interior design explanation of why this specific vibe resonates with their room type, lighting, and preferred aesthetic.
            5. "roomTypeMatch": The lowercase version of their room preference (${answers.roomType.toLowerCase()}) to filter the "ideal_for" column.

            Return ONLY valid JSON. No markdown formatting.`;

            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are a professional interior design AI assistant that returns JSON." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
            });

            const content = response.choices[0].message.content;
            console.log("this is th outpu", content);
            return JSON.parse(content);

        } catch (error) {
            console.error("OpenAI Recommendation Error:", error.message);
            return this.getFallbackRecommendation(answers);
        }
    }


    /**
     * Rule-based fallback if AI fails or key is missing.
     */
    getFallbackRecommendation(answers) {
        let tags = [answers.mood.toLowerCase(), answers.style.toLowerCase()];
        if (answers.style === 'Modern Minimalist') tags = ['clean', 'simple', 'minimal', 'geometric'];
        if (answers.style === 'Classic Elegance') tags = ['floral', 'intricate', 'vintage', 'luxury'];

        return {
            tags: tags,
            summary: `Looking for a ${answers.mood.toLowerCase()} and ${answers.style.toLowerCase()} touch for your ${answers.roomType.toLowerCase()}.`
        };
    }
}

export default new OpenAiService();
