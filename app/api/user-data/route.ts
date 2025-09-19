
  import { NextResponse } from 'next/server';
  import { auth } from '@clerk/nextjs/server';
  import { PrismaClient } from '@prisma/client';

  // Initialize the Prisma Client
  const prisma = new PrismaClient();

  /**
   * This function gets the internal user ID from your database based on the Clerk user ID.
   * If the user doesn't exist in your database, it creates a new user record.
   * @param clerkId The user ID from Clerk authentication.
   * @returns The user object from your database.
   */
  async function getInternalUserId(clerkId: string) {
    // Find the user in your database that corresponds to the Clerk user ID
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true }, // We only need the internal ID
    });

    if (!user) {
      // This is a simplified example. In a real application, you would likely
      // create the user here, potentially using more information from the Clerk user object.
      // For this example, we'll assume the user already exists from the sign-up process.

      // throw new Error("User not found in internal database.");
    const newUser = await prisma.user.create({
      data: {
        clerkId,
        // You can add other default values here if needed
        email: "default@email.com", // Placeholder
        name: "Default User" // Placeholder
      },
      select: { id: true },
    });
    return newUser.id;
  }

    return user.id;
  }

  /**
   * Handles POST requests to save a new mood or journal entry.
   */
  export async function POST(request: Request) {
    try {
      const { userId: clerkId } = auth();
      if (!clerkId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

      const internalUserId = await getInternalUserId(clerkId);
      const body = await request.json();

      // Check if the request is for a mood entry
      if (body.mood) {
        const { mood, notes } = body;
        const newMoodEntry = await prisma.moodEntry.create({
          data: {
            userId: internalUserId,
            mood, 
            notes,
          },
        });
        return NextResponse.json(newMoodEntry);
      }

      // Check if the request is for a journal entry
      if (body.content) {
        const { title, content, tags } = body;
        const newJournalEntry = await prisma.journalEntry.create({
          data: {
            userId: internalUserId,
            title,
            content,
            tags,
          },
        });
        return NextResponse.json(newJournalEntry);
      }

      return new NextResponse("Invalid request body", { status: 400 });
    } catch (error) {
      console.error("Error saving entry:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  }

  /**
   * Handles GET requests to retrieve all mood and journal entries for the user.
   */
  export async function GET() {
    try {
      const { userId: clerkId } = auth();
      if (!clerkId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

      const internalUserId = await getInternalUserId(clerkId);

      // Retrieve all mood entries for the user
      const moodEntries = await prisma.moodEntry.findMany({
        where: { userId: internalUserId },
        orderBy: { createdAt: 'desc' },
      });

      // Retrieve all journal entries for the user
      const journalEntries = await prisma.journalEntry.findMany({
        where: { userId: internalUserId },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ moodEntries, journalEntries });
    } catch (error) {
      console.error("Error retrieving entries:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  }
  