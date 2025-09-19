import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { mood, notes, factors } = await req.json();
    
    // Validate mood is a valid string
    const validMoods = ["sad", "anxious", "calm", "happy", "excited", "other"];
    if (!validMoods.includes(mood)) {
      return NextResponse.json({ error: "Invalid mood value" }, { status: 400 });
    }

    // Get user from database, create if doesn't exist
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    // If user doesn't exist in database, create them
    if (!user) {
      const clerkUser = await currentUser();
      
      if (!clerkUser) {
        return NextResponse.json({ error: "Unable to get user info" }, { status: 401 });
      }

      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          name: clerkUser.firstName && clerkUser.lastName 
            ? `${clerkUser.firstName} ${clerkUser.lastName}` 
            : clerkUser.firstName || clerkUser.username || 'User',
        }
      });
    }
    
    // Create mood entry with string mood and numeric rating in metadata
    const moodEntry = await prisma.moodEntry.create({
      data: {
        userId: user.id,
        mood: mood, // Store as string
        notes: notes || null,
        metadata: {
          factors: factors || [],
          moodRating: getMoodRating(mood) // Store numeric rating in metadata for charts
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

// Helper function to convert mood string to numeric rating (for metadata)
function getMoodRating(mood: string): number {
  const moodRatings: Record<string, number> = {
    "sad": 1,
    "anxious": 2,
    "calm": 3,
    "happy": 4,
    "excited": 5,
    "other": 3
  };
  return moodRatings[mood] || 3;
}