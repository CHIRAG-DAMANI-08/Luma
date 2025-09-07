import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { goalText, senderName, note, receiverId } = await req.json();
    
    // Basic validation
    if (!goalText || !senderName || !receiverId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // Find user by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: receiverId }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Create the motivation entry
    const motivation = await prisma.motivation.create({
      data: {
        userId: user.id,
        senderName,
        note: note || null,
        goalText
      }
    });
    
    return NextResponse.json({ success: true, motivation });
  } catch (error) {
    console.error("Error sending motivation:", error);
    return NextResponse.json(
      { error: "Failed to send motivation" },
      { status: 500 }
    );
  }
}