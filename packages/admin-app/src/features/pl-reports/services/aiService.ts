import axios from "axios";
import type { ChatMessage } from "../types";

const OLLAMA_API_URL =
  import.meta.env.VITE_OLLAMA_API_URL || "http://localhost:11434/api";
const MODEL_NAME = "llama3.1:8b";

class AIService {
  /**
   * Generate AI summary for a P&L report
   */
  async generateSummary(reportData: {
    revenue: number;
    expenses: number;
    grossProfit: number;
    netProfit: number;
    profitMargin: number;
    period: string;
    storeName: string;
  }): Promise<{
    overview: string;
    insights: string[];
    recommendations: string[];
  }> {
    const prompt = `Analyze this P&L report and provide:

Store: ${reportData.storeName}
Period: ${reportData.period}
Revenue: $${reportData.revenue.toLocaleString()}
Total Expenses: $${reportData.expenses.toLocaleString()}
Gross Profit: $${reportData.grossProfit.toLocaleString()}
Net Profit: $${reportData.netProfit.toLocaleString()}
Profit Margin: ${reportData.profitMargin.toFixed(1)}%

Provide a structured analysis with:
1. OVERVIEW: One paragraph summarizing overall financial health
2. KEY INSIGHTS: 3-5 bullet points on strengths, concerns, or notable trends
3. RECOMMENDATIONS: 3-5 specific actionable recommendations

Format strictly as:
OVERVIEW:
[your overview paragraph]

KEY INSIGHTS:
- [insight 1]
- [insight 2]
...

RECOMMENDATIONS:
- [recommendation 1]
- [recommendation 2]
...`;

    try {
      const response = await axios.post(`${OLLAMA_API_URL}/generate`, {
        model: MODEL_NAME,
        prompt,
        stream: false,
      });

      const content = response.data.response;

      // Parse the structured response
      const overviewMatch = content.match(
        /OVERVIEW:\s*([\s\S]*?)(?=KEY INSIGHTS:|$)/i
      );
      const insightsMatch = content.match(
        /KEY INSIGHTS:\s*([\s\S]*?)(?=RECOMMENDATIONS:|$)/i
      );
      const recommendationsMatch = content.match(
        /RECOMMENDATIONS:\s*([\s\S]*?)$/i
      );

      const parseBulletPoints = (text: string): string[] => {
        return text
          .split("\n")
          .map((line) => line.replace(/^[-•*]\s*/, "").trim())
          .filter((line) => line.length > 0);
      };

      return {
        overview: overviewMatch
          ? overviewMatch[1].trim()
          : content.substring(0, 200),
        insights: insightsMatch
          ? parseBulletPoints(insightsMatch[1])
          : ["Analysis in progress"],
        recommendations: recommendationsMatch
          ? parseBulletPoints(recommendationsMatch[1])
          : ["Recommendations pending"],
      };
    } catch (error) {
      console.error("AI summary generation failed:", error);
      throw new Error("Failed to generate AI summary");
    }
  }

  /**
   * Chat with AI about the P&L report
   */
  async chat(
    userMessage: string,
    reportContext: {
      revenue: number;
      expenses: number;
      netProfit: number;
      profitMargin: number;
      period: string;
    },
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    const contextPrompt = `You are a financial analyst helping with P&L report analysis.

Report Context:
- Period: ${reportContext.period}
- Revenue: $${reportContext.revenue.toLocaleString()}
- Expenses: $${reportContext.expenses.toLocaleString()}
- Net Profit: $${reportContext.netProfit.toLocaleString()}
- Profit Margin: ${reportContext.profitMargin.toFixed(1)}%

Previous conversation:
${conversationHistory.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}

User question: ${userMessage}

Provide a helpful, specific answer based on the financial data.`;

    try {
      const response = await axios.post(`${OLLAMA_API_URL}/generate`, {
        model: MODEL_NAME,
        prompt: contextPrompt,
        stream: false,
      });

      return response.data.response;
    } catch (error) {
      console.error("AI chat failed:", error);
      throw new Error("Failed to get AI response");
    }
  }

  /**
   * Stream chat response (if streaming is needed)
   */
  async *chatStream(
    userMessage: string,
    reportContext: any
  ): AsyncGenerator<string> {
    const contextPrompt = `You are a financial analyst helping with P&L report analysis.

Report Context:
- Period: ${reportContext.period}
- Revenue: $${reportContext.revenue.toLocaleString()}
- Expenses: $${reportContext.expenses.toLocaleString()}
- Net Profit: $${reportContext.netProfit.toLocaleString()}
- Profit Margin: ${reportContext.profitMargin.toFixed(1)}%

User question: ${userMessage}`;

    try {
      const response = await fetch(`${OLLAMA_API_URL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          prompt: contextPrompt,
          stream: true,
        }),
      });

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.response) {
              yield json.response;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    } catch (error) {
      console.error("Streaming failed:", error);
      throw new Error("Failed to stream AI response");
    }
  }
}

export const aiService = new AIService();
