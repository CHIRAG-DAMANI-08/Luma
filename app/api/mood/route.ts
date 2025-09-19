import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Handles GET requests for retrieving mood entries
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const entries = await prisma.moodEntry.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ moodEntries: entries });
  } catch (error) {
    console.error("Error fetching mood entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch mood entries" },
      { status: 500 }
    );
  }
}

// Handles POST requests for logging mood entries
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      console.log("POST: Unauthorized attempt - no user ID");

      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { mood, notes, factors } = await req.json();
    console.log("POST: Received payload:", { mood, notes, factors });

    if (typeof mood !== 'string' || mood.trim() === '') {
      return NextResponse.json({ error: "Invalid mood string" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const moodEntry = await prisma.moodEntry.create({
      data: {
        userId: user.id,
        mood,
        notes: notes || null,
        metadata: {
          factors: factors || [],
        },
      },
    });

    return NextResponse.json({ success: true, entry: moodEntry });
  } catch (error) {
    console.error("POST: Error logging mood entry:", error);
    return NextResponse.json(
      { error: "Failed to log mood" },
      { status: 500 }
    );
  }
}