import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

// Helper function to generate a random anonymous username
const generateAnonymousUsername = () => {
  const adjectives = ["Agile", "Bright", "Creative", "Daring", "Eager", "Flying", "Gentle", "Happy", "Jolly", "Kind"];
  const nouns = ["Panda", "Tiger", "Lion", "Bear", "Wolf", "Eagle", "Shark", "Dragon", "Unicorn", "Phoenix"];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 100);
  return `${adjective}${noun}${number}`;
};

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        votes: true,
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const postsWithVoteCounts = posts.map(post => {
        const upvotes = post.votes.filter(vote => vote.type === 'UPVOTE').length;
        const downvotes = post.votes.filter(vote => vote.type === 'DOWNVOTE').length;
        return {
            ...post,
            upvotes,
            downvotes,
        };
    });

    return NextResponse.json(postsWithVoteCounts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Missing post content" }, { status: 400 });
    }

    const anonymousUsername = generateAnonymousUsername();

    const newPost = await prisma.post.create({
      data: {
        content,
        authorId: dbUser.id,
        anonymousUsername,
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Failed to create post." }, { status: 500 });
  }
}