"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./styles.module.css";
import { Flag, Heart } from "lucide-react";

export default function ShareGoalPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [goalData, setGoalData] = useState<{
    text: string;
    category: 'short-term' | 'long-term';
    progress: number;
    sharedBy?: string;
    userId?: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [motivationSent, setMotivationSent] = useState(false);
  const [supporterName, setSupporterName] = useState("");
  const [motivationNote, setMotivationNote] = useState("");
  const [nameError, setNameError] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    try {
      const data = searchParams.get('data');
      if (!data) {
        setError("No goal data provided");
        return;
      }

      // Try to safely decode the URI component
      let decodedString;
      try {
        decodedString = decodeURIComponent(data);
      } catch (decodeError) {
        try {
          decodedString = decodeURIComponent(encodeURIComponent(data));
        } catch (fallbackError) {
          decodedString = data;
        }
      }

      // Parse the JSON
      const decodedData = JSON.parse(decodedString);
      
      // Validate the required fields
      if (!decodedData.text || !decodedData.category || decodedData.progress === undefined) {
        throw new Error("Missing required goal data");
      }
      
      setGoalData(decodedData);
    } catch (err) {
      console.error("Error parsing goal data:", err);
      setError("Invalid goal data format");
    }
  }, [searchParams]);

  // Function to send motivation without requiring login
  const sendMotivation = async () => {
    if (!supporterName.trim()) {
      // Add validation for name
      setNameError("Please enter your name");
      return;
    }
    
    try {
      setIsSending(true);
      
      // Extract the user ID from the goal data
      // This assumes you've added the user's clerk ID to the goal data when sharing
      const receiverId = goalData?.userId || "";
      
      // Call the API endpoint instead of using localStorage
      const response = await fetch('/api/motivations/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goalText: goalData?.text,
          senderName: supporterName,
          note: motivationNote,
          receiverId: receiverId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send motivation');
      }
      
      setMotivationSent(true);
      
      // Still provide immediate feedback, but don't need to redirect
    } catch (error) {
      console.error('Error sending motivation:', error);
      setError("Failed to send motivation. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  if (error) {
    // Error state remains unchanged
    return (
      <div className={styles.pageContainer}>
        <nav className={styles.navbar}>
          <div className={styles.logoContainer}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                clipRule="evenodd"
                d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                fill="#ef4399"
                fillRule="evenodd"
              />
            </svg>
            <span className={styles.logoText}>Luma</span>
          </div>
        </nav>
        <main className={styles.mainContent}>
          <div className={styles.cardContainer}>
            <div className={styles.errorCard}>
              <h1>Error Loading Goal</h1>
              <p>{error}</p>
              <Link href="/goals" className={styles.btnPrimary}>
                Go to Goals
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!goalData) {
    // Loading state remains unchanged
    return (
      <div className={styles.pageContainer}>
        <nav className={styles.navbar}>
          <div className={styles.logoContainer}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                clipRule="evenodd"
                d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                fill="#ef4399"
                fillRule="evenodd"
              />
            </svg>
            <span className={styles.logoText}>Luma</span>
          </div>
        </nav>
        <main className={styles.mainContent}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <h2>Loading goal...</h2>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Navbar with Luma logo */}
      <nav className={styles.navbar}>
        <div className={styles.logoContainer}>
          <svg
            width="32"
            height="32"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              clipRule="evenodd"
              d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
              fill="#ef4399"
              fillRule="evenodd"
            />
          </svg>
          <span className={styles.logoText}>Luma</span>
        </div>
      </nav>

      <main className={styles.mainContent}>
        <div className={styles.cardContainer}>
          {/* Goal Card */}
          <div className={styles.goalCard}>
            <div className={styles.goalHeader}>
              <div className={styles.categoryTag}>
                {goalData.category === 'short-term' ? 'Short-Term Goal' : 'Long-Term Goal'}
              </div>
              
              <div className={styles.sharerInfo}>
                {goalData.sharedBy ? (
                  <p><span className={styles.sharedByText}>Shared by:</span> {goalData.sharedBy}</p>
                ) : (
                  <p><span className={styles.sharedByText}>Shared by:</span> A friend</p>
                )}
              </div>
            </div>

            <div className={styles.goalContent}>
              <div className={styles.iconContainer}>
                <Flag size={28} className={styles.goalIcon} />
              </div>
              <h1 className={styles.goalTitle}>{goalData.text}</h1>
              
              <div className={styles.progressSection}>
                <div className={styles.progressBarBg}>
                  <div 
                    className={styles.progressBar} 
                    style={{width: `${goalData.progress}%`}}
                  ></div>
                </div>
                <div className={styles.progressInfo}>
                  <span className={styles.progressLabel}>Progress</span>
                  <span className={styles.progressPercentage}>{goalData.progress}%</span>
                </div>
              </div>
            </div>
            
            {/* Motivation input fields */}
            {!motivationSent && (
              <div className={styles.motivationForm}>
                <div className={styles.inputField}>
                  <label htmlFor="supporterName">Your Name</label>
                  <input
                    id="supporterName"
                    type="text"
                    placeholder="Enter your name"
                    value={supporterName}
                    onChange={(e) => setSupporterName(e.target.value)}
                    className={styles.textInput}
                  />
                  {nameError && <p className={styles.errorMessage}>{nameError}</p>}
                </div>
                
                <div className={styles.inputField}>
                  <label htmlFor="motivationNote">Add a note (optional)</label>
                  <textarea
                    id="motivationNote"
                    placeholder="Write something encouraging..."
                    value={motivationNote}
                    onChange={(e) => setMotivationNote(e.target.value)}
                    className={styles.textareaInput}
                    rows={3}
                  />
                </div>
              </div>
            )}
            
            {/* Motivation button */}
            <button 
              onClick={sendMotivation}
              className={`${styles.motivationButton} ${motivationSent ? styles.motivationSent : ''}`}
              disabled={motivationSent || isSending}
            >
              <Heart size={18} className={styles.heartIcon} />
              {motivationSent ? 'Motivation Sent!' : isSending ? 'Sending...' : 'Send Motivation'}
            </button>
            
            <div className={styles.actionButtons}>
              <Link href="/goals" className={styles.primaryButton}>
                Add This Goal
              </Link>
              <Link href="/goals" className={styles.secondaryButton}>
                View All Goals
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}