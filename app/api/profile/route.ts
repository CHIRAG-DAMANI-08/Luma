import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    include: { profile: true },
  });

  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const responseData = {
    // Use Clerk fields directly for name and email
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.primaryEmailAddress?.emailAddress || '',
    profileImage: user.imageUrl || '', // <-- Add this line

    // Profile info from your schema
    nickname: dbUser.profile?.nickname || '',
    pronouns: dbUser.profile?.pronouns || '',
    preferredLanguage: dbUser.profile?.preferredLanguage || 'en',
    timezone: dbUser.profile?.timezone || 'UTC',

    // Health information
    medicalConditions: dbUser.profile?.medicalConditions || '',
    currentMedications: dbUser.profile?.currentMedications || '',
    therapyExperience: dbUser.profile?.therapyExperience || '',
    comfortLevel: dbUser.profile?.comfortLevel || 3,

    // Goals and preferences
    goals: dbUser.profile?.goals || '',
    checkInFrequency: dbUser.profile?.checkInFrequency || 'few_times_week',

    // Privacy
    dataSharingEnabled: dbUser.profile?.dataSharingEnabled ?? true,
  };

  return NextResponse.json(responseData);
}

export async function PUT(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await req.json();

  try {
    // Find the user first to get the internal ID
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update User basic info
    await prisma.user.update({
      where: { clerkId: user.id },
      data: {
        name: data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : undefined,
        email: data.email,
      },
    });

    // Update Profile info using the actual schema fields
    await prisma.profile.upsert({
      where: { userId: dbUser.id },
      update: {
        nickname: data.nickname,
        pronouns: data.pronouns,
        preferredLanguage: data.preferredLanguage,
        timezone: data.timezone,
        medicalConditions: data.medicalConditions,
        currentMedications: data.currentMedications,
        therapyExperience: data.therapyExperience,
        comfortLevel: data.comfortLevel,
        goals: data.goals,
        checkInFrequency: data.checkInFrequency,
        dataSharingEnabled: data.dataSharingEnabled,
      },
      create: {
        userId: dbUser.id,
        nickname: data.nickname,
        pronouns: data.pronouns,
        preferredLanguage: data.preferredLanguage || 'en',
        timezone: data.timezone || 'UTC',
        medicalConditions: data.medicalConditions,
        currentMedications: data.currentMedications,
        therapyExperience: data.therapyExperience,
        comfortLevel: data.comfortLevel || 3,
        goals: data.goals,
        checkInFrequency: data.checkInFrequency || 'few_times_week',
        dataSharingEnabled: data.dataSharingEnabled ?? true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}