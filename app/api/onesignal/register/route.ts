import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { playerId } = await req.json();
    
    if (!playerId) {
      return NextResponse.json({ error: "Player ID is required" }, { status: 400 });
    }
    
    // Find user in database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Update user with OneSignal player ID
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        // Update the field name in your schema to store OneSignal player ID
        fcmToken: playerId 
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error registering OneSignal player ID:", error);
    return NextResponse.json(
      { error: "Failed to register OneSignal player ID" },
      { status: 500 }
    );
  }
}