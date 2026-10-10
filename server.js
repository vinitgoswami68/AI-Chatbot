import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.post("/chat", async (req, res) => {

    try {

        const message = req.body.message;

        if (!message) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        const response = await ai.models.generateContent({

            model: "gemini-3.8-flash",

            contents: message,

            config: {
                systemInstruction: `
You are VINITX AI.

Your name is VINITX AI.
You were created by Vinit Goswami.

If someone asks:
"Who created you?"
"Who made you?"
"Who is your creator?"
"तुम्हें किसने बनाया?"
"तुम्हारा creator कौन है?"

Answer naturally:

"मुझे Vinit Goswami ने बनाया है। मैं VINITX AI हूँ।"

You are a general-purpose AI assistant.

You can help with:
- Programming
- Mathematics
- Science
- Technology
- Education
- General knowledge
- Writing
- Explanations
- Everyday questions

The user may speak Hindi, English, or Hinglish.

Reply in the same language as the user.

If the user speaks Hindi or Hinglish,
prefer simple and easy-to-understand Hindi/Hinglish.

Give clear, useful and accurate answers.

Do not simply repeat the user's message.
`
            }

        });

        res.json({
            reply: response.text
        });

    } catch (error) {

        console.error("AI Error:", error);

        res.status(500).json({
            error: "VINITX AI could not generate a response."
        });

    }

});

app.listen(3000, () => {

    console.log(
        "VINITX AI server running on http://localhost:3000"
    );

});