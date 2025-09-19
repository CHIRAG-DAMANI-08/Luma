import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, voiceId } = body || {};

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const voice = voiceId || process.env.ELEVENLABS_VOICE_ID || "Rachel";
    const apiKey = process.env.ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY?.toString();

    if (!apiKey) {
      return NextResponse.json({ error: "ElevenLabs API key not configured" }, { status: 500 });
    }

    // Forward request to ElevenLabs text-to-speech streaming endpoint
    const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}/stream`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2"
      }),
    });

    if (!elevenRes.ok) {
      const errText = await elevenRes.text().catch(() => "");
      console.error("ElevenLabs error:", elevenRes.status, errText);
      return NextResponse.json({ error: "ElevenLabs request failed" }, { status: elevenRes.status });
    }

    // Stream binary audio back to client
    const arrayBuffer = await elevenRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(buffer.length),
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("TTS route error:", err.message);
    } else {
      console.error("TTS route error:", err);
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
