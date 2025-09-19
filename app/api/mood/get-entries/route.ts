import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

      // Return empty entries for new user
      return NextResponse.json({ entries: [] });
    }

    // Get mood entries for the last 7 days
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

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Error fetching mood entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch mood entries" },
      { status: 500 }
    );
  }
}