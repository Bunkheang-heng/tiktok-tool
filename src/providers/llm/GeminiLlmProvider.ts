import { ContentGenerationInput, LlmProvider } from './LlmProvider';
import { GeneratedContentData, GeneratedContentSchema } from '../../core/types/content';

export class GeminiLlmProvider implements LlmProvider {
  public readonly id = 'gemini';
  public readonly name = 'Google Gemini 2.0 Flash';

  constructor(
    private apiKey: string,
    private model: string = 'gemini-2.0-flash',
    private timeoutMs: number = 45000
  ) {}

  private getSystemInstruction(): string {
    return `You are Ben10 FX's chief Khmer trading educator and viral TikTok content creator.
Your job is to generate educational, engaging, beginner-friendly trading education video content in the KHMER language.
Content Requirements:
1. Target length: 45 to 75 seconds of spoken Khmer narration.
2. Focus on clear, educational concepts (Forex, Gold trading, Risk Management, Market Structure).
3. Do NOT make profit guarantees, deceptive claims, or "get rich quick" promises.
4. Naturally emphasize risk management and discipline.
5. Provide a captivating hook in Khmer that grabs attention in the first 3 seconds.
6. Provide an English video-generation prompt tailored for 9:16 vertical financial visual footage (trading desk, charts, modern financial animations).
7. Provide a catchy Khmer TikTok title, informative description, and 3-6 relevant hashtags.
8. Output MUST be valid JSON adhering strictly to the required schema.`;
  }

  private buildPrompt(input: ContentGenerationInput): string {
    return `Create a high-performing Khmer trading education video script for the following topic:
Topic: "${input.topic}"
Topic in Khmer: "${input.topicKhmer || ''}"
Category: "${input.category || 'Beginner'}"

Output strictly a JSON object with these keys:
{
  "topic": string (English topic name),
  "topicKhmer": string (Khmer translation of topic),
  "hook": string (Khmer hook for the first 3 seconds),
  "scriptKhmer": string (complete spoken Khmer narration script, beginner-friendly, 45-75 seconds),
  "videoPrompt": string (detailed English prompt for 9:16 vertical video visual generator),
  "titleKhmer": string (catchy TikTok video title in Khmer),
  "descriptionKhmer": string (informative TikTok description in Khmer),
  "hashtags": string[] (array of 3-6 hashtags including #Ben10FX, #TradingKhmer, #ForexKhmer)
}`;
  }

  public async generateContent(input: ContentGenerationInput): Promise<GeneratedContentData> {
    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const userPrompt = this.buildPrompt(input);

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ],
      systemInstruction: {
        parts: [{ text: this.getSystemInstruction() }]
      },
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7
      }
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }

      const data = (await response.json()) as {
        candidates?: Array<{
          content?: {
            parts?: Array<{ text?: string }>;
          };
        }>;
      };

      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('Empty response received from Gemini API');
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(rawText);
      } catch (e) {
        // Attempt repair
        parsed = await this.repairJson(rawText, (e as Error).message);
      }

      const validation = GeneratedContentSchema.safeParse(parsed);
      if (!validation.success) {
        throw new Error(`Gemini response failed schema validation: ${validation.error.message}`);
      }

      return validation.data;
    } finally {
      clearTimeout(timer);
    }
  }

  private async repairJson(invalidJson: string, reason: string): Promise<unknown> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const repairPrompt = `The following JSON output could not be parsed:
${invalidJson}
Error reason: ${reason}
Please repair it and return ONLY the valid JSON object.`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: repairPrompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Repair attempt failed');
    return JSON.parse(text);
  }
}
