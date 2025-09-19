import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// OneSignal API helper function
async function sendOneSignalNotification(playerIds: string[], reminderText: string, goalText: string) {
  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`
    },
    body: JSON.stringify({
      app_id: '1fdccdfc-93e3-4759-b153-f881c66ba78f',
      include_player_ids: playerIds,
      contents: { en: reminderText || `Time to work on: ${goalText}` },
      headings: { en: '🎯 Goal Reminder' },
      url: `${process.env.NEXT_PUBLIC_APP_URL}/goals`
    })
  });
  
  return await response.json();
}

export async function POST(req: NextRequest) {
  try {
    // Verify request is from GitHub Actions
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Format time string for database query (HH:MM)
    const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    // Check for due reminders
    const activeReminders = await prisma.reminder.findMany({
      where: { 
        isActive: true, 
        time: timeString 
      },
      include: { 
        user: { 
          select: { 
            fcmToken: true, // This field now stores OneSignal Player ID
            name: true 
          } 
        } 
      }
    });
    
    // Helper function to check if reminder should be sent today based on frequency
    const shouldSendToday = (frequency: string, day: number) => {
      switch (frequency) {
        case 'daily':
          return true;
        case 'weekdays':
          return day >= 1 && day <= 5;
        case 'weekends':
          return day === 0 || day === 6;
        case 'weekly':
          return day === 1; // Monday
        default:
          return true;
      }
    };
    
    // Send notifications for due reminders
    let sentCount = 0;
    for (const reminder of activeReminders) {
      // Check if reminder should be sent today based on frequency
      if (shouldSendToday(reminder.frequency, currentDay) && reminder.user?.fcmToken) {
        // Send notification using OneSignal
        await sendOneSignalNotification(
          [reminder.user.fcmToken], // Use stored OneSignal Player ID
          reminder.customMessage || `Time to work on your goal: ${reminder.goalText}`,
          reminder.goalText
        );
        sentCount++;
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      checked: activeReminders.length,
      sent: sentCount,
      time: timeString
    });
  } catch (error) {
    console.error("Error checking reminders:", error);
    return NextResponse.json(
      { error: "Failed to check reminders" },
      { status: 500 }
    );
  }
}