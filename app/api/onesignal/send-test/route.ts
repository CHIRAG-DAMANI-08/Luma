import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

// OneSignal API helper function
async function sendOneSignalNotification(playerIds: string[], message: string, heading: string = 'Luma Reminder') {
  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`
    },
    body: JSON.stringify({
      app_id: '1fdccdfc-93e3-4759-b153-f881c66ba78f',
      include_player_ids: playerIds,
      contents: { en: message },
      headings: { en: heading }
    })
  });
  
  return await response.json();
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { playerId, message } = await req.json();
    
    if (!playerId || !message) {
      return NextResponse.json({ error: "Player ID and message are required" }, { status: 400 });
    }
    
    // Send notification using OneSignal API
    const result = await sendOneSignalNotification(
      [playerId], 
      message,
      '🎯 Test Notification'
    );
    
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error sending test notification:", error);
    return NextResponse.json(
      { error: "Failed to send test notification" },
      { status: 500 }
    );
  }
}