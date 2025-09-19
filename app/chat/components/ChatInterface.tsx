"use client";
import { useState, useEffect, useRef } from "react";
import { Search, Send, MessageSquare, Mic, X, AudioWaveform } from "lucide-react";
import { useUser, UserButton, useAuth } from "@clerk/nextjs";
import styles from './styles.module.css';
import { useConversation } from "@11labs/react";
import { useRouter } from "next/navigation";

interface Message {
  audio?: {
    data: string;
    mimeType?: string;
  };
  text?: string;
}

const ChatInterface = () => {
  const { user } = useUser();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  // NEW: sidebar state was missing
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Existing voice state (using ElevenLabs conversational logic)
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [elevenError, setElevenError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- ElevenLabs conversation setup (handlers use helper functions defined below) ---
  const conversation = useConversation({
    onConnect: () => console.debug("ElevenLabs: connected"),
    onDisconnect: () => console.debug("ElevenLabs: disconnected"),
    onMessage: async (msg: Message) => {
      try {
        if (msg?.audio?.data && msg.audio.data.startsWith("data:")) {
          // if already data URI, play directly
          playAudioFromDataURI(msg.audio.data);
        } else if (msg?.audio?.data) {
          // assume base64 audio bytes + mime type provided
          const mime = msg.audio?.mimeType || "audio/mpeg";
          const base64 = msg.audio.data;
          playAudioFromBase64(base64, mime);
        } else if (msg?.text) {
          // fallback: synthesize server-side (existing /api/speak) and play
          const resp = await fetch("/api/speak", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: msg.text }),
          });
          if (resp.ok) {
            const blob = await resp.blob();
            playBlobAudio(blob);
          }
        }
      } catch (err) {
        console.error("onMessage handling error:", err);
      }
    },
    onError: (err: string | Error) => {
      console.error("ElevenLabs conversation error:", err);
      setElevenError(typeof err === "string" ? err : err.message);
    },
  });

  const { status: convoStatus, isSpeaking } = conversation;

  // NEW: RAG chat state
  const [conversationHistory, setConversationHistory] = useState<{ role: string; text: string }[]>([]);
  const [message, setMessage] = useState("");
  const [isSaving] = useState(true);
  const [status, setStatus] = useState("Type or record a message to get started.");
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle sending a text message to our RAG API
  const handleTextSend = async (messageText: string) => {
    if (!messageText.trim() || !isLoaded || !isSignedIn) {
        setStatus("Please wait, session is loading.");
        return;
    };
    setIsLoading(true);

    const newUserMessage = { role: 'user', text: messageText };
    setConversationHistory(prev => [...prev, newUserMessage]);
    setMessage('');
    setStatus("Analyzing and thinking...");

    try {
      // Step 1: Combine the message into a single payload for the RAG pipeline
      const payload = {
        message: newUserMessage.text,
        saveToDb: isSaving,
        emotionAnalysis: null, // Send null for emotion analysis on text messages
      };

      const token = await getToken();
      console.log("Clerk token:", token);
      
      // Step 2: Call the RAG Pipeline API with the combined payload
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!chatResponse.ok) {
        throw new Error(`Chat API error! status: ${chatResponse.status}`);
      }

      const chatResult = await chatResponse.json();
      setConversationHistory(prev => [...prev, { role: 'model', text: chatResult.result }]);
      setStatus("Response received.");

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error during chat:', errorMessage);
      setStatus("Error: " + errorMessage);
      setConversationHistory(prev => [
        ...prev,
        { role: 'model', text: `Sorry, there was an error processing your request. ${errorMessage}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceSend = async () => {
    // Placeholder for voice to text functionality.
    // This function would first transcribe the audio, then call the emotion detection API,
    // and finally send the combined payload to the RAG API.
    const placeholderMessage = "User spoke an audio message.";
    await handleTextSend(placeholderMessage);
  };

  // request mic permissions on mount
  useEffect(() => {
    const check = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasMicPermission(true);
      } catch (err) {
        console.warn("Mic permission denied or not available", err);
        setHasMicPermission(false);
      }
    };
    check();
  }, []);

  // helper: play blob
  function playBlobAudio(blob: Blob) {
    const url = URL.createObjectURL(blob);
    if (audioRef.current) {
      audioRef.current.pause();
      try { URL.revokeObjectURL(audioRef.current.src); } catch {}
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch((e) => console.error("audio play err", e));
    audio.onended = () => {
      setTimeout(() => { try { URL.revokeObjectURL(url); } catch {} }, 300);
    };
  }

  // helper: convert base64 -> blob -> play
  function playAudioFromBase64(base64: string, mime = "audio/mpeg") {
    try {
      const binary = atob(base64);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes.buffer], { type: mime });
      playBlobAudio(blob);
    } catch (err) {
      console.error("playAudioFromBase64 error:", err);
    }
  }

  function playAudioFromDataURI(dataUri: string) {
    const matches = dataUri.match(/^data:(audio\/[a-zA-Z0-9.+-]+);base64,(.*)$/);
    if (!matches) return;
    const mime = matches[1];
    const b64 = matches[2];
    playAudioFromBase64(b64, mime);
  }

  const startVoiceModal = async () => {
    if (hasMicPermission === false) {
      alert("Microphone permission denied. Enable mic to use voice chat.");
      return;
    }
    setElevenError(null);
    setIsVoiceMode(true);
    try {
      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || undefined,
      });
    } catch (err) {
      console.error("Failed to start ElevenLabs session:", err);
      setElevenError("Could not start voice session");
      setIsVoiceMode(false);
    }
  };

  const stopVoiceModal = async () => {
    try {
      await conversation.endSession();
    } catch (err) {
      console.warn("endSession error:", err);
    } finally {
      setIsVoiceMode(false);
    }
  };

  const suggestions = [
    {
      title: "2-minute breathing",
      description: "A short guided breathing exercise to help you calm down and focus.",
      icon: "🧘‍♀️"
    },
    {
      title: "Quick mood check",
      description: "Answer a few quick prompts to reflect on how you're feeling right now.",
      icon: "📊"
    },
    {
      title: "Coping tips",
      description: "Practical, bite-sized strategies for stress, anxiety and low mood.",
      icon: "💡"
    },
  ];

  return (
    <div className={styles.chatContainer}>
      <div className={styles.mainWrapper}>
        {/* Sidebar */}
        <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
          {/* Header */}
          <div className={styles.sidebarHeader}>
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ display: "block" }}>
              <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fillRule="evenodd" />
            </svg>
            <h1 className={styles.brandName}>Luma</h1>
          </div>

          {/* show version inside sidebar for mobile (visible via CSS only on small screens) */}
          <div className={styles.sidebarVersion}>
            <button className={styles.versionButton}>
              ✨Gemini 2.5 Pro
            </button>
          </div>

          {/* Search */}
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} />
            <input type="text" placeholder="Search chat" className={styles.searchInput} />
          </div>

          <nav className={styles.navSection}>
            <button className={styles.navButton}>
              <MessageSquare size={16} className={styles.navIcon} />
              New support chat
            </button>
          </nav>

          {/* Recent Chats */}
          <div className={styles.recentChatsSection}>
            <h3 className={styles.sectionTitle}>Recent Conversations</h3>
          </div>

          {/* Back to Dashboard button pinned to the bottom-right of the sidebar */}
          <div className={styles.sidebarBottom}>
            <button
              className={styles.backButton}
              onClick={() => router.push('/dashboard')}
              aria-label="Back to dashboard"
              title="Back to dashboard"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </aside>

        {/* Overlay for mobile when sidebar open */}
        {isSidebarOpen && <div className={styles.sidebarOverlay} onClick={() => setIsSidebarOpen(false)} aria-hidden />}

        {/* Main Content */}
        <main className={styles.mainContent}>
          {/* Header */}
          <header className={styles.mainHeader}>
            {/* MOBILE: hamburger to toggle sidebar */}
            <button
              className={styles.mobileMenuButton}
              onClick={() => setIsSidebarOpen(prev => !prev)}
              aria-expanded={isSidebarOpen}
              aria-label="Toggle menu"
            >
              <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <rect y="0" width="20" height="2" rx="1" fill="currentColor"></rect>
                <rect y="6" width="20" height="2" rx="1" fill="currentColor"></rect>
                <rect y="12" width="20" height="2" rx="1" fill="currentColor"></rect>
              </svg>
            </button>

            {/* keep version button visible on desktop only (hidden on mobile via CSS) */}
            <button className={styles.versionButton}>
             ✨Gemini 2.5 Pro
            </button>
            
            <div className={styles.userInfo}>
              <div className={styles.userDetails}>
                <div className={styles.userName}>
                  {user?.firstName || 'User'} {user?.lastName || ''}
                </div>
                <div className={styles.userEmail}>
                  {user?.primaryEmailAddress?.emailAddress || ''}
                </div>
              </div>
              <div className={styles.userAvatar}>
                <UserButton 
                  userProfileMode="modal"
                  afterSignOutUrl="/"
                />
              </div>
            </div>
          </header>

          {/* Chat Area */}
          <div className={styles.chatArea}>
            {/* Greeting */}
            <div className={styles.greeting}>
              <h1 className={styles.greetingTitle}>
                Hello {user?.firstName},
              </h1>
              <p className={styles.greetingSubtitle}>
                How can I help you today?
              </p>
            </div>

            {/* A tiny testing area that shows conversation lines (non-intrusive)
            {conversationHistory.length > 0 && (
              <div style={{ margin: "0 auto 1rem", maxWidth: 800 }}>
                {conversationHistory.map((m, idx) => (
                  <div key={idx} style={{ textAlign: m.role === 'user' ? 'right' : 'left', padding: '2px 0' }}>
                    <strong>{m.role}:</strong> {m.text}
                  </div>
                ))}
              </div>
            )} */}

            

            {/* Suggestions - will be hidden on small screens via CSS
            <div className={styles.suggestionsGrid}>
              {suggestions.map((suggestion, index) => (
                <div key={index} className={styles.suggestionCard}>
                  <div className={styles.suggestionIcon}>
                    {suggestion.icon}
                  </div>
                  <h3 className={styles.suggestionTitle}>
                    {suggestion.title}
                  </h3>
                  <p className={styles.suggestionDescription}>
                    {suggestion.description}
                  </p>
                </div>
              ))}
            </div> */}

            {/* Scrollable chat feed */}
<div className={styles.messagesContainer}>
  {conversationHistory.map((m, idx) => (
    <div
      key={idx}
      className={`${styles.messageBubble} ${
        m.role === 'user' ? styles.userMessage : styles.botMessage
      }`}
    >
      {m.text}
    </div>
  ))}
</div>

{/* Suggestions only if no chat yet */}
{conversationHistory.length === 0 && (
  <div className={styles.suggestionsGrid}>
    {suggestions.map((suggestion, index) => (
      <div key={index} className={styles.suggestionCard}>
        <div className={styles.suggestionIcon}>
          {suggestion.icon}
        </div>
        <h3 className={styles.suggestionTitle}>
          {suggestion.title}
        </h3>
        <p className={styles.suggestionDescription}>
          {suggestion.description}
        </p>
      </div>
    ))}
  </div>
)}

            {/* Fixed bottom bar wrapper - keeps input centered and footer directly below it */}
            <div className={styles.fixedBar}>
              <div className={styles.inputArea}>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask something..."
                  className={styles.messageInput}
                />
                <button onClick={startVoiceModal} className={`${styles.iconButton} ${styles.micButton}`} aria-label="Open voice chat">
                  <AudioWaveform size={20} />
                </button>
                {/* fixed: call handleTextSend when clicking send */}
                <button className={styles.sendButton} onClick={() => handleTextSend(message)}>
                  <Send size={18} />
                </button>
              </div>

              <div className={styles.footer}>
                Luma is only your mental health companion, if you face serious issues, please reach out to a professional.
              </div>
            </div>
          </div>
        </main>

        {/* --- Voice Chat Modal (ElevenLabs-driven) --- */}
        {isVoiceMode && (
          <div className={styles.voiceOverlay}>
            <div className={styles.voiceModal}>
              <button onClick={stopVoiceModal} className={styles.closeVoiceButton}>
                <X size={24} />
              </button>
              <div className={`${styles.pulsingCircle} ${isSpeaking ? styles.isPulsing : ""}`}>
                <div className={styles.pulsingCircleCenter}>
                  <Mic size={40} color="white" />
                </div>
              </div>
              <p className={styles.transcript}>
                {convoStatus === "connected" ? (isSpeaking ? "Agent speaking…" : "Listening…") : "Connecting…"}
              </p>
              <div className={styles.voiceFooter}>
                {elevenError ? elevenError : "Talk now — the session streams your audio to the agent."}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;