import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from '@/lib/prisma';
import { NextRequest } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // --- Prevent duplicate check-ins for the same day ---
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const existingSession = await prisma.chatSession.findFirst({
      where: {
        userId: dbUser.id,
        title: { startsWith: "A friendly check-in from Luma" },
        createdAt: {
          gte: startOfToday,
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });

    if (existingSession && existingSession.messages.length > 0) {
      // A session for today already exists. Update its title and return it.
      await prisma.chatSession.update({
        where: { id: existingSession.id },
        data: { title: "A friendly check-in from Luma (Updated)" },
      });

      return NextResponse.json({
        message: "Proactive check-in for today already exists.",
        checkInMessage: existingSession.messages[0].content,
        sessionId: existingSession.id,
      });
    }

    // --- No session for today, so proceed to generate one ---

    // 1. Get the last mood entry
    const lastMood = await prisma.moodEntry.findFirst({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Get the last 3 journal entries from the past week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentJournals = await prisma.journalEntry.findMany({
      where: {
        userId: dbUser.id,
        createdAt: { gte: oneWeekAgo },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    // --- Generate the Proactive Message ---
    let contextPrompt = "You are Luma, a caring AI companion. Your task is to write a short, gentle, and supportive check-in message (1-2 sentences) to a user based on their recent activity. Do not offer solutions. Your only goal is to open a door for conversation. Start the message with a warm greeting. Here's the context on the user:\n";

    if (lastMood) {
      contextPrompt += `- Their last logged mood was: ${lastMood.mood}.\n`;
    } else {
      contextPrompt += "- They haven't logged their mood recently.\n";
    }

    if (recentJournals.length > 0) {
      const journalSummaries = recentJournals.map(j => j.content.substring(0, 100) + '...').join('"\n- "');
      contextPrompt += `- Here are snippets from their recent journal entries:\n- "${journalSummaries}"\n`;
    } else {
      contextPrompt += "- They haven't written in their journal recently.\n";
    }

    contextPrompt += "\nBased on this, write a gentle, open-ended check-in. For example: 'Hey, I was just thinking of you. How have things been feeling lately?' or 'Hi there, I saw you were feeling a bit down yesterday. Just wanted to gently check in and see how you are today?'";

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(contextPrompt);
    const proactiveMessage = result.response.text();

    // --- Save the Message to a New Session ---
    const newChatSession = await prisma.chatSession.create({
      data: {
        userId: dbUser.id,
        title: "A friendly check-in from Luma",
      },
    });

    await prisma.message.create({
      data: {
        sessionId: newChatSession.id,
        userId: dbUser.id,
        content: proactiveMessage,
        role: 'assistant',
      },
    });

    return NextResponse.json({
      message: "Proactive check-in generated successfully.",
      checkInMessage: proactiveMessage,
      sessionId: newChatSession.id,
    });

  } catch (error) {
    console.error("Error in proactive-checkin API:", error);
    return NextResponse.json({ error: "Failed to generate proactive check-in." }, { status: 500 });
  }
}
