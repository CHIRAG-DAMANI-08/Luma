// app/api/reminders/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await req.json();
    const { goalId, goalText, reminder } = body;
    
    if (!goalId || !goalText || !reminder || !reminder.time || !reminder.frequency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Check if user has OneSignal player ID (stored in fcmToken field)
    if (!user.fcmToken) {
      return NextResponse.json({ 
        error: "No notification token found. Enable notifications first." 
      }, { status: 400 });
    }
    
    // Create or update reminder in database using Prisma
    const reminderRecord = await prisma.reminder.upsert({
      where: {
        userId_goalId: {
          userId: user.id,
          goalId: goalId
        }
      },
      update: {
        goalText,
        frequency: reminder.frequency,
        time: reminder.time,
        customMessage: reminder.customMessage || null,
        addToCalendar: reminder.addToCalendar || false,
        isActive: true
      },
      create: {
        userId: user.id,
        goalId,
        goalText,
        frequency: reminder.frequency,
        time: reminder.time,
        customMessage: reminder.customMessage || null,
        addToCalendar: reminder.addToCalendar || false,
        isActive: true
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      reminder: reminderRecord,
      fcmTokenPresent: true,
      message: "Reminder set successfully" 
    });
  } catch (error) {
    console.error("Error setting reminder:", error);
    return NextResponse.json({ 
      error: "Failed to set reminder" 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const goalId = searchParams.get('goalId');
    
    if (!goalId) {
      return NextResponse.json({ error: "Goal ID is required" }, { status: 400 });
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Find reminder for this goal
    const reminder = await prisma.reminder.findUnique({
      where: {
        userId_goalId: {
          userId: user.id,
          goalId: goalId
        }
      }
    });
    
    return NextResponse.json({ 
      exists: !!reminder && reminder.isActive,
      reminder: reminder && reminder.isActive ? reminder : null
    });
  } catch (error) {
    console.error("Error checking reminder:", error);
    return NextResponse.json({ 
      error: "Failed to check reminder" 
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await req.json();
    const { goalId } = body;
    
    if (!goalId) {
      return NextResponse.json({ error: "Goal ID is required" }, { status: 400 });
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Soft delete by setting isActive to false
    await prisma.reminder.update({
      where: {
        userId_goalId: {
          userId: user.id,
          goalId: goalId
        }
      },
      data: {
        isActive: false
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: "Reminder deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting reminder:", error);
    return NextResponse.json({ 
      error: "Failed to delete reminder" 
    }, { status: 500 });
  }
}