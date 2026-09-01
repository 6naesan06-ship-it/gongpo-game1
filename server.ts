import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// System prompt for Game Master
const GM_SYSTEM_PROMPT = `
당신은 1990년대 후반 폭우가 쏟아지는 자정의 한국 고등학교 복도에 갇힌 심리 공포 텍스트 어드벤처 게임의 '게임 마스터(GM)'입니다.
분위기: 축축한 곰팡이 냄새, 비릿한 분필 가루, 깜빡이는 형광등 불빛, 낡은 나무 복도 바닥, 유리창을 때리는 거센 빗소리. 8번 출구(The 8th Exit) 룰 기반.

[규칙]
1. 루프 목표: 10회 돌파 시 탈출 성공.
2. 매 턴 40% 확률로 '이상 현상(Anomaly)'이 발생하거나 정상 복도가 주어집니다.
3. 이상 현상 예시: 거꾸로 걸린 액자, 13반 명패, 거꾸로 도는 괘종시계, 사물함 틈의 머리카락, 바닥의 젖은 맨발자국, 창문 밖 공중에 뜬 얼굴, 반대 방향 그림자, 안내문의 뒤집힌 글자 등.
4. 반드시 요청된 정형화된 출력 포맷을 엄격하게 준수해야 합니다.
`;

// AI Game Master scene generation endpoint
app.post("/api/game/generate-scene", async (req, res) => {
  try {
    const { loopCount, sanity, inventory, hasAnomaly, anomalyCategory, previousAction } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(200).json({
        fallback: true,
        message: "Gemini API key not configured, using local deterministic procedural engine.",
      });
    }

    const inventoryStr = Array.isArray(inventory) ? inventory.join(", ") : (inventory || "낡은 손전등, 학생증");
    const prompt = `
현재 상황:
- 현재 루프: ${loopCount} / 10
- 정신력(SAN): ${sanity} / 100
- 소지품: ${inventoryStr}
- 이번 구역 이상 현상 여부: ${hasAnomaly ? `[이상 현상 발생 - 유형: ${anomalyCategory || "시각/공간 왜곡"}]` : "[정상 복도 - 이상 현상 없음]"}
- 이전 플레이어 행동: ${previousAction || "복도 진입"}

반드시 다음 형식(Output Format)을 정확히 지켜서 한국어로 작성해주세요.
형식:

[Status Panel]
---
[현재 루프: ${loopCount} / 10] | [정신력(SAN): ${sanity}/100] | [소지품: ${inventoryStr}]
---

2. [Environment Description]
(3~4문장으로 복도의 감각적 묘사 - 빛, 소리, 냄새, 온도, 그림자. ${hasAnomaly ? "기이하고 섬뜩한 이상 현상을 미묘하게 묘사하세요." : "을씨년스럽지만 규칙을 위반하는 이상 현상은 없는 정상적인 복도를 묘사하세요."})

3. [Choices]
1. 앞으로 계속 걸어간다.
2. 뒤로 돌아서 이전 문으로 나간다.
3. [주변의 특정 사물 하나(예: 낡은 게시판, 4반 교실 문, 괘종시계, 창문 등)를 자세히 조사한다]

추가로 JSON 형식이나 별도 안내문 없이 위 구조 그대로 출력해주세요.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: GM_SYSTEM_PROMPT,
        temperature: 0.8,
      },
    });

    const generatedText = response.text || "";
    return res.json({ text: generatedText, fallback: false });
  } catch (error) {
    console.error("Gemini API error in generate-scene:", error);
    return res.status(200).json({
      fallback: true,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// AI Investigation detail endpoint
app.post("/api/game/generate-investigation", async (req, res) => {
  try {
    const { targetObject, hasAnomaly, anomalyDescription, loopCount, sanity } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(200).json({ fallback: true });
    }

    const prompt = `
플레이어가 현재 복도의 [${targetObject}]를 숨죽이고 가까이 다가가 자세히 조사했습니다.
- 현재 루프: ${loopCount}/10, SAN: ${sanity}/100
- 이상 현상 유무: ${hasAnomaly ? `[있음: ${anomalyDescription}]` : "[없음 - 일반적인 1990년대 학교 물품]"}

플레이어에게 전달할 2~3문장의 생생하고 서늘한 조사 결과 묘사를 작성하세요.
${hasAnomaly ? "이 사물이나 그 주변에서 명백하거나 섬뜩한 단서가 발견됩니다." : "낡고 음산하지만 비정상적인 괴이는 발견되지 않고 평범한 흔적뿐입니다."}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: GM_SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    return res.json({ result: response.text, fallback: false });
  } catch (error) {
    console.error("Gemini API error in generate-investigation:", error);
    return res.status(200).json({ fallback: true });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", geminiConfigured: !!process.env.GEMINI_API_KEY });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Psychological horror text adventure server running on port ${PORT}`);
  });
}

startServer();
