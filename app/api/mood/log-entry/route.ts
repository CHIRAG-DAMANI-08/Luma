import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { mood, notes, factors } = await req.json();
    
    // Validate input
    if (typeof mood !== 'number' || mood < 1 || mood > 5) {
      return NextResponse.json({ error: "Invalid mood rating" }, { status: 400 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Create mood entry
    const moodEntry = await prisma.moodEntry.create({
      data: {
        userId: user.id,
        mood,
        notes: notes || null,
        // Store factors as JSON in the notes field or extend your schema
        metadata: {
          factors: factors || []
        }
      }
    });
    
    return NextResponse.json({ success: true, entry: moodEntry });
  } catch (error) {
    console.error("Error logging mood entry:", error);
    return NextResponse.json(
      { error: "Failed to log mood" },
      { status: 500 }
    );
  }
}