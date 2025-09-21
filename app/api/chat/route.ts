import { NextResponse } from "next/server";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { getEmbedding, getOrCreateCollection } from '@/lib/chroma';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { prisma } from '@/lib/prisma';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

console.log("Using Gemini API Key:", process.env.GEMINI_API_KEY);

import {
  NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const chatSessions = await prisma.chatSession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(chatSessions);
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    return NextResponse.json({ error: "Failed to fetch chat sessions." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    // const user = await currentUser();

    // if (!userId || !user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }
      if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    // Check if user exists in the database, if not create them
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      const user = await clerkClient.users.getUser(userId);  // <-- this line is needed

      const email = user.emailAddresses[0]?.emailAddress;
      if (!email) {
        return NextResponse.json({ error: "User email not found" }, { status: 400 });
      }
      dbUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email: email,
          name: user.firstName || '',
        },
      });
    }

    const body = await req.json();
    const { message, saveToDb, emotionAnalysis, sessionId } = body; // sessionId can be null

    if (!message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    let chatSession;

    if (sessionId) {
      // Continue an existing session
      chatSession = await prisma.chatSession.findUnique({
        where: { id: sessionId, userId: dbUser.id }, // Ensure user owns the session
      });
      if (!chatSession) {
        return NextResponse.json({ error: "Chat session not found or access denied" }, { status: 404 });
      }
    } else {
      // Create a new session
      chatSession = await prisma.chatSession.create({
        data: {
          userId: dbUser.id,
          // Use the first message as the title, truncated to a reasonable length
          title: message.substring(0, 40) + (message.length > 40 ? "..." : ""),
        },
      });
    }

    // Save user message
    await prisma.message.create({
      data: {
        sessionId: chatSession.id,
        userId: dbUser.id,
        content: message,
        role: 'user',
      },
    });

    const safeEmotionAnalysis = emotionAnalysis && typeof emotionAnalysis === 'object'
      ? emotionAnalysis
      : {
          dominantEmotion: "Neutral",
          justification: "No emotion analysis provided for this message.",
          suggestedResponse: "How are you feeling about that?"
        };

    const collection = await getOrCreateCollection(userId);
    const userMessageEmbedding = await getEmbedding(message);

    const results = await collection.query({
      queryEmbeddings: [userMessageEmbedding],
      nResults: 5,
    });

    let conversationContext = "Previous conversation (for context):\n";
    if (results.documents && results.documents.length > 0 && results.documents[0].length > 0) {
        conversationContext += (results.documents[0] as string[]).join("\n");
    } else {
        conversationContext += "No relevant past conversations found.";
    }

    // Fetch the user's last logged mood
    const lastMood = await prisma.moodEntry.findFirst({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
    });

    const finalPrompt = `
      **Persona**: You are a compassionate and conversational friend to the user.
      **User's Last Logged Mood**: ${lastMood ? lastMood.mood : "Not available."}
      **Emotion Analysis**:
        - Dominant Emotion: ${safeEmotionAnalysis.dominantEmotion}
        - Justification: ${safeEmotionAnalysis.justification}
        - Suggested Response: ${safeEmotionAnalysis.suggestedResponse}

      **Conversation Context**:
        ${conversationContext}

      **User's new message**: "${message}"

      **Instructions**:
      - Respond in a warm, empathetic tone, acknowledging the user's emotional state based on the analysis and their last logged mood.
      - Acknowledge the user's last logged mood empathetically without directly quoting them word-for-word.
      - Paraphrase or gently summarize their feelings before guiding the conversation forward. 
      - Respond based on both the user’s current emotional state and their last logged mood.
       - If there is a difference, gently check in to see if things have improved or changed.
      - Use the conversation history to provide a contextually relevant and coherent response.
      - Guide the conversation forward with open-ended, non-leading questions.
      - Do not simply repeat or rephrase what the user has said.
      - Keep your answers to 2-3 short sentences.
      - Avoid lengthy explanations or long paragraphs unless necessary.
      - Use simple language that is easy to read.
      - Encourage the user to share more by asking gentle, open-ended questions.
      - The response should be catered to present day youth, so understand and react appropriately to their concerns and language.

      Example response:
"I'm sorry you're feeling low today. Do you think your friend's post might be affecting you? Or is something else going on? I'm here whenever you want to talk."
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(finalPrompt);
    const geminiResponse = result.response.text();

    // Save model response
    
    await prisma.message.create({
      data: {
        sessionId: chatSession.id,
        userId: dbUser.id,
        content: geminiResponse,
        role: 'assistant',
      },
    });

    if (saveToDb) {
      const conversationText = `User: ${message}\nModel: ${geminiResponse}`;
      const conversationEmbedding = await getEmbedding(conversationText);

      await collection.add({
        documents: [conversationText],
        embeddings: [conversationEmbedding],
        ids: [`msg-${Date.now()}`],
      });
    }

    return NextResponse.json({ result: geminiResponse, sessionId: chatSession.id }, { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ error: "Failed to process chat request." }, { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
