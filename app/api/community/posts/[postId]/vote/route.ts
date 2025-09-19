import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { userId } = getAuth(req);
    const { postId } = params;
    const { voteType } : { voteType: 'UPVOTE' | 'DOWNVOTE' } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!['UPVOTE', 'DOWNVOTE'].includes(voteType)) {
        return NextResponse.json({ error: "Invalid vote type" }, { status: 400 });
    }

    let dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
    });

    if (!dbUser) {
        const user = await clerkClient.users.getUser(userId);
        const email = user.emailAddresses[0]?.emailAddress;
        if (!email) {
            return NextResponse.json({ error: "User email not found" }, { status: 400 });
        }
        dbUser = await prisma.user.create({
            data: {
                clerkId: userId,
                email: email,
                name: user.firstName || '',
            },
        });
    }

    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_postId: {
          userId: dbUser.id,
          postId,
        },
      },
    });

    if (existingVote) {
      // If the user is casting the same vote again, delete the vote (toggle off)
      if (existingVote.type === voteType) {
        await prisma.vote.delete({
          where: {
            id: existingVote.id,
          },
        });
        return NextResponse.json({ message: "Vote removed" });
      } else {
        // If the user is changing their vote, update it
        const updatedVote = await prisma.vote.update({
          where: {
            id: existingVote.id,
          },
          data: {
            type: voteType,
          },
        });
        return NextResponse.json(updatedVote);
      }
    } else {
      // If the user hasn't voted yet, create a new vote
      const newVote = await prisma.vote.create({
        data: {
          userId: dbUser.id,
          postId,
          type: voteType,
        },
      });
      return NextResponse.json(newVote, { status: 201 });
    }
  } catch (error) {
    console.error("Error voting on post:", error);
    return NextResponse.json({ error: "Failed to vote on post." }, { status: 500 });
  }
}