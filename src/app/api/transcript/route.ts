// app/api/transcript/route.ts
import { NextResponse } from "next/server";
import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Helper function to extract video ID from URL
function extractVideoId(url: string) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
}

// Helper function to combine transcript segments
function combineTranscript(transcript: any[]) {
  return transcript.map(t => t.text).join(' ');
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    // Extract video ID
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    // Get transcript
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const fullTranscript = combineTranscript(transcript);

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prompt for Gemini
    const prompt = `Please provide a comprehensive summary of the following video transcript, highlighting the main points and key takeaways:

    ${fullTranscript}

    Please structure the summary with:
    1. Main topic/theme
    2. Key points
    3. Important details
    4. Conclusion/takeaways`;

    // Generate summary using Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    return NextResponse.json({ summary });
    
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process video' },
      { status: 500 }
    );
  }
}
