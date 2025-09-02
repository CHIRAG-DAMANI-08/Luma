import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/prisma';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define the schema for the request body
const onboardSchema = z.object({
  nickname: z.string().min(2).max(30),
  pronouns: z.string().optional(),
  timezone: z.string(),
  preferredLanguage: z.string(),
  medicalConditions: z.string().optional(),
  currentMedications: z.string().optional(),
  therapyExperience: z.string().optional(),
  comfortLevel: z.number().min(1).max(5),
  goals: z.string(),
  checkInFrequency: z.enum(['daily', 'few_times_week', 'weekly', 'as_needed']),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session.userId;
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const validation = onboardSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({
        error: 'Validation error',
        details: validation.error.issues,
      }), { status: 400 });
    }

    const data = validation.data;

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx: typeof prisma) => {
      // Check if user exists
      let user = await tx.user.findUnique({
        where: { clerkId: userId },
      });

      // Create user if not exists
      if (!user) {
        // In a real app, you'd get this from Clerk's user info
        const clerkUser = { email: `${userId}@example.com`, name: 'User' };
        
        user = await tx.user.create({
          data: {
            clerkId: userId,
            email: clerkUser.email,
            name: clerkUser.name,
          },
        });
      }

      // Create or update profile
      const profile = await tx.profile.upsert({
        where: { userId: user.id },
        update: {
          nickname: data.nickname,
          pronouns: data.pronouns,
          timezone: data.timezone,
          preferredLanguage: data.preferredLanguage,
          medicalConditions: data.medicalConditions,
          currentMedications: data.currentMedications,
          therapyExperience: data.therapyExperience,
          comfortLevel: data.comfortLevel,
          goals: data.goals,
          checkInFrequency: data.checkInFrequency,
        },
        create: {
          userId: user.id,
          nickname: data.nickname,
          pronouns: data.pronouns,
          timezone: data.timezone,
          preferredLanguage: data.preferredLanguage,
          medicalConditions: data.medicalConditions,
          currentMedications: data.currentMedications,
          therapyExperience: data.therapyExperience,
          comfortLevel: data.comfortLevel,
          goals: data.goals,
          checkInFrequency: data.checkInFrequency,
        },
      });

      // Log the onboarding completion
      await tx.userActivity.create({
        data: {
          userId: user.id,
          activityType: 'onboarding_completed',
          metadata: {
            checkInFrequency: data.checkInFrequency,
            comfortLevel: data.comfortLevel,
          },
        },
      });

      return { user, profile };
    });

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('Error in onboarding:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(
      JSON.stringify({
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
