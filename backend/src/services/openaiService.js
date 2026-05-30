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
            A customer provided these preferences for their space:
            - Room Type: ${answers.roomType}
            - Natural Light: ${answers.lighting}
            - Existing Decor/Furniture Color: ${answers.furnitureColor}
            - Desired Vibe: ${answers.vibe}
            - Color Adventurousness: ${answers.adventureLevel}

            Analyze their selections and return a JSON object with:
            1. "tags": A list of 4-6 specific design keywords in lowercase (e.g. "warm", "textured", "classic", "minimalist").
            2. "category": One main category name that fits best (e.g. "Modern", "Classic", "Nature").
            3. "summary": A brief, premium 1-sentence headline for the recommended look.
            4. "description": A 2-3 sentence professional interior design explanation of why this specific vibe resonates with their room type, lighting, furniture colors, and color risk level.
            5. "roomTypeMatch": The lowercase version of their room preference to filter the "ideal_for" column.
            6. "avoidanceTags": A list of 2-3 lowercase keywords representing what style they want to avoid based on their selections (e.g. if safe, avoid "bold" or "vibrant").

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
        let tags = [
            (answers.vibe || '').toLowerCase(),
            (answers.roomType || '').toLowerCase()
        ].filter(Boolean);

        return {
            tags: tags,
            category: "Modern",
            summary: `Tailored wallpapers matching your ${answers.vibe || 'stylish'} vibes.`,
            description: `We curated a selection of designs that fit a ${answers.roomType || 'room'} with a ${answers.vibe || 'classic'} aesthetic, matching your preferences.`,
            roomTypeMatch: (answers.roomType || '').toLowerCase(),
            avoidanceTags: []
        };
    }
}

export default new OpenAiService();
