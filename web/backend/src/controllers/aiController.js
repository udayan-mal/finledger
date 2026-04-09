import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { fail, ok } from "../utils/response.js";
import { GoogleGenAI } from "@google/genai";

let genai = null;
if (env.geminiApiKey) {
  genai = new GoogleGenAI({ apiKey: env.geminiApiKey });
}

export const getInsights = async (req, res, next) => {
  try {
    const items = await prisma.aiInsight.findMany({ 
      where: { userId: req.user.sub }, 
      orderBy: { generatedAt: "desc" }, 
      take: 20 
    });
    return ok(res, items);
  } catch (error) {
    return next(error);
  }
};

export const chatAdvisor = async (req, res) => {
  try {
    if (!genai) {
      return fail(res, "Gemini API Key missing in backend environment.", 503);
    }

    const { prompt, history = [] } = req.body;
    
    if (!prompt) {
      return fail(res, "Prompt is required", 400);
    }

    // 1. Context Compiler: Inject the user's financial sandbox natively
    // We limit to the newest 50 transactions to prevent token overflow.
    const [accounts, recentTransactions, activeBudgets] = await Promise.all([
      prisma.account.findMany({ where: { userId: req.user.sub } }),
      prisma.transaction.findMany({ 
        where: { userId: req.user.sub }, 
        orderBy: { date: "desc" }, 
        take: 50,
        include: { category: true }
      }),
      prisma.budget.findMany({ 
        where: { userId: req.user.sub },
        include: { category: true }
      })
    ]);

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balancePaise, 0) / 100;
    
    const contextSnapshot = {
      timestamp: new Date().toISOString(),
      baseCurrency: "INR",
      totalLiquidity: totalBalance,
      accountsList: accounts.map(a => ({ name: a.name, type: a.type, balance: a.balancePaise / 100 })),
      recentTransactions: recentTransactions.map(t => ({
        date: t.date.toISOString().split("T")[0],
        description: t.description,
        type: t.type,
        amount: t.amountPaise / 100,
        category: t.category?.name || "Uncategorized"
      })),
      activeBudgets: activeBudgets.map(b => ({
        category: b.category?.name,
        limit: b.amountPaise / 100,
        period: b.period
      }))
    };

    const systemInstruction = `
      You are the FinLedger AI Advisor, an elite, mathematical private wealth management engine.
      You are speaking directly to your VIP client. You have strict read-only access to their real-time financial ledger natively injected below.
      Never mention that you are an AI model. Speak with institutional authority, conciseness, and extreme accuracy. Use bullet points for readability. DO NOT output markdown codeblocks. 
      Refuse to answer ANY question that is not directly related to personal finance, markets, or the user's data.

      === SECURE CLIENT LEDGER SNAPSHOT ===
      ${JSON.stringify(contextSnapshot, null, 2)}
      ===================================
    `;

    // 2. Map history properly for Gemini
    const mappedHistory = history.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    // Start a chat session
    const chat = await genai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2 // Keep math and reasoning strictly deterministic
      }
    });

    // Replay history if any (this is a simplified approach, usually we should pass history during chat creation)
    let aiResponseText = "";
    
    // We send the single message directly to generating content using generateContent
    // Since we want to pass the full history array natively, we'll construct the contents array manually
    
    const contentsArr = [...mappedHistory, { role: "user", parts: [{ text: prompt }] }];
    
    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contentsArr,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2
      }
    });

    aiResponseText = response.text;

    return ok(res, { answer: aiResponseText });
  } catch (error) {
    console.error("AI Error:", error);
    return fail(res, "The Advisor Engine experienced a mathematical crash.", 500);
  }
};
