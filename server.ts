import { GoogleGenAI } from "@google/genai";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === "production";

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Server-side Gemini client
const getAi = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// 1. Multi-turn Character Roleplay Chat
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, systemInstruction, model } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getAi();
    // Use gemini-3.8-flash for responsive and expressive character chat
    const modelToUse = model || "gemini-3.8-flash";

    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: formattedContents,
      config: {
        systemInstruction:
          systemInstruction ||
          "You are an engaging, immersive character roleplayer. Respond in character with emotional depth, dialogue, and gentle asterisks for actions (*smiles softly*).",
      },
    });

    return res.json({
      reply: response.text || "",
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to generate character response.",
    });
  }
});

// 2. Story, Plot & Character Intelligence (gemini-4-argon / gemini-3.8-flash / gemini-3.1-flash-lite)
app.post("/api/intelligence", async (req, res) => {
  try {
    const { taskType, name, tags, description, plot, customPrompt, tone, model } = req.body;
    const ai = getAi();

    // Default to gemini-3.8-flash or gemini-4-argon for deep plotting
    const modelToUse = model || (taskType === "complex_plot" ? "gemini-4-argon" : "gemini-3.8-flash");

    let prompt = "";
    let systemInstruction = "You are a master creative writer, light novel author, and character archivist. Your tone is artistic, thoughtful, evocative, and tailored to the Pink Pearl aesthetic universe.";

    if (taskType === "generate_plot") {
      prompt = `Create a rich, emotionally compelling plot outline and story premise for a character named "${name}".
Tags: ${Array.isArray(tags) ? tags.join(", ") : tags || "Fiction"}
Current Description: ${description || "None provided"}
Existing Plot Notes: ${plot || "None"}
Tone: ${tone || "Soft romantic, slow-burn mystery, gentle angst"}

Please provide:
1. ✦ Core Premise & World Setting
2. ✧ Central Conflict & Hidden Secrets
3. ♡ Key Story Milestones / Chapters (Beginning, Turning Point, Climax)
4. ୨୧ Notable Relationships & Dynamics
5. ✦ Roleplay Starter Scenario (First scene prompt to engage the reader)`;
    } else if (taskType === "polish_bio") {
      prompt = `Rewrite and polish the following character profile description to make it deeply atmospheric, charming, and compelling.
Character Name: ${name}
Current Description: ${description}
Tags: ${Array.isArray(tags) ? tags.join(", ") : tags}
Desired Vibe: ${tone || "Poetic, delicate pastel aesthetic with subtle emotional depth"}

Provide:
1. An evocative 2-3 sentence teaser/intro.
2. A detailed 1-2 paragraph character biography highlighting their habits, flaws, and hidden tenderness.
3. 3-5 recommended aesthetic tags.`;
    } else if (taskType === "roleplay_prompt") {
      prompt = `Generate a complete character roleplay instruction card and greeting message for:
Name: ${name}
Tags: ${Array.isArray(tags) ? tags.join(", ") : tags}
Description: ${description}

Include:
1. System Roleplay Definition (Personality traits, speech pattern, quirks, dislikes, boundaries).
2. Opening Greeting Message (Atmospheric scene establishing setting, action, and dialogue inviting the user to respond).
3. 3 Suggested User Reply Prompts.`;
    } else if (taskType === "analyze_character") {
      prompt = `Analyze this character concept and provide insightful creative commentary:
Name: ${name}
Tags: ${Array.isArray(tags) ? tags.join(", ") : tags}
Description: ${description}
Plot: ${plot || "None"}

Please evaluate:
1. Trope Breakdown & Character Archetypes
2. Strengths of the Concept
3. Potential Plot Hooks & Drama Opportunities
4. Ideal Matching Companion / Rival Archetypes
5. 3 Aesthetic Color / Vibe Symbols`;
    } else {
      prompt = customPrompt || `Provide creative insights for character "${name}": ${description}`;
    }

    try {
      const response = await ai.models.generateContent({
        model: modelToUse,
        contents: prompt,
        config: { systemInstruction },
      });
      return res.json({ result: response.text || "" });
    } catch (modelErr: any) {
      // Graceful fallback to gemini-3.8-flash if gemini-4-argon requires paid key or is restricted
      if (modelToUse !== "gemini-3.8-flash") {
        console.warn(`Falling back from ${modelToUse} to gemini-3.8-flash...`);
        const fallbackResponse = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: { systemInstruction },
        });
        return res.json({ result: fallbackResponse.text || "" });
      }
      throw modelErr;
    }
  } catch (error: any) {
    console.error("Intelligence error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to process character intelligence task.",
    });
  }
});

// 3. Search Grounding with Google Search (gemini-3.8-flash)
app.post("/api/search-grounding", async (req, res) => {
  try {
    const { query, characterContext } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Search query is required." });
    }

    const ai = getAi();
    const prompt = `You are a creative researcher and worldbuilding consultant.
Research the following topic, setting, cultural lore, fashion era, or character concept using Google Search:
"${query}"
${characterContext ? `Character / Universe Context: ${characterContext}` : ""}

Provide accurate, grounded, evocative details that writers and creators can directly use:
- Historical / folklore / real-world grounding facts
- Sensorial details (clothing, scents, lighting, architectural elements)
- 3 story tropes or scene inspirations
Keep it organized and beautifully formatted with bullet points.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    return res.json({
      result: response.text || "",
      groundingMetadata: groundingMetadata || null,
    });
  } catch (error: any) {
    console.error("Search grounding error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to execute grounded search.",
    });
  }
});

// 4. Image Generation with Configurable Resolution (1K, 2K, 4K) & Aspect Ratios
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, size = "1K", aspectRatio = "1:1", modelChoice } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Image prompt is required." });
    }

    const ai = getAi();
    // Support gemini-nano-banana-2.1 or gemini-3-pro-image or gemini-3.1-flash-lite-image
    const preferredModel = modelChoice || "gemini-nano-banana-2.1";

    let candidateModels = [preferredModel, "gemini-3-pro-image", "gemini-3.1-flash-lite-image"];
    // Remove duplicates while preserving order
    candidateModels = Array.from(new Set(candidateModels));

    let imageBase64: string | null = null;
    let mimeType = "image/png";
    let textInfo = "";
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const isNanoOrPro = model === "gemini-nano-banana-2.1" || model === "gemini-3-pro-image";
        const config: any = {
          imageConfig: {
            aspectRatio: aspectRatio || "1:1",
            ...(isNanoOrPro && size ? { imageSize: size } : {}),
          },
        };

        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [{ text: prompt }],
          },
          config,
        });

        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            imageBase64 = part.inlineData.data;
            mimeType = part.inlineData.mimeType || "image/png";
            break;
          } else if (part.text) {
            textInfo += part.text + " ";
          }
        }

        if (imageBase64) {
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${model} failed, trying next candidate:`, err.message);
        lastError = err;
      }
    }

    if (!imageBase64) {
      return res.status(500).json({
        error: lastError?.message || "Could not generate character portrait. Please try again or refine the prompt.",
      });
    }

    return res.json({
      imageUrl: `data:${mimeType};base64,${imageBase64}`,
      text: textInfo.trim(),
    });
  } catch (error: any) {
    console.error("Image generation error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to generate character image.",
    });
  }
});

// 5. Image Editing with Text Prompts
app.post("/api/edit-image", async (req, res) => {
  try {
    const { prompt, imageBase64, mimeType = "image/png", modelChoice } = req.body;
    if (!prompt || !imageBase64) {
      return res.status(400).json({ error: "Prompt and image are required." });
    }

    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, "");
    const ai = getAi();
    const candidateModels = [modelChoice || "gemini-nano-banana-2.1", "gemini-3.1-flash-lite-image"];

    let editedBase64: string | null = null;
    let outMime = mimeType;
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        });

        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            editedBase64 = part.inlineData.data;
            outMime = part.inlineData.mimeType || mimeType;
            break;
          }
        }

        if (editedBase64) break;
      } catch (err: any) {
        console.warn(`Edit failed with ${model}:`, err.message);
        lastError = err;
      }
    }

    if (!editedBase64) {
      return res.status(500).json({
        error: lastError?.message || "Failed to edit image. Try another prompt.",
      });
    }

    return res.json({
      imageUrl: `data:${outMime};base64,${editedBase64}`,
    });
  } catch (error: any) {
    console.error("Image edit error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to edit character image.",
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProduction) {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🌸 Siasiailu Character Archive server running on http://localhost:${PORT}`);
  });
}

startServer();
