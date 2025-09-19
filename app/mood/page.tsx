'use client';

import React, { useState, useEffect, useCallback } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import styles from "./styles.module.css";

// Toast component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className={`${styles.toast} ${type === 'success' ? styles.toastSuccess : styles.toastError}`}>
      <div className={styles.toastIcon}>
        {type === 'success' ? '✅' : '❌'}
      </div>
      <p className={styles.toastMessage}>{message}</p>
    </div>
  );
};

interface MoodEntry {
    id: string;
    mood: string;
    notes: string | null;
    createdAt: string;
}

export default function MoodTrackingPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [selectedMood, setSelectedMood] = useState("");
  const [notes, setNotes] = useState("");
  const [factors, setFactors] = useState<string[]>([]);
  const [weeklyMoods, setWeeklyMoods] = useState<MoodEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastEntry, setLastEntry] = useState<Date | null>(null);
  // Add toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchMoodEntries = useCallback(async () => {
    try {
      const token = await getToken();
      const response = await fetch("/api/mood", {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.moodEntries) {
        setWeeklyMoods(data.moodEntries);
        
        // Check last entry time
        if (data.moodEntries.length > 0) {
          const lastEntryTime = new Date(data.moodEntries[0].createdAt);
          setLastEntry(lastEntryTime);
        }
      }
    } catch (error) {
      console.error("Failed to fetch mood entries:", error);
    }
  }, [getToken]);

  useEffect(() => {
    if (isLoaded && user) {
      console.log("Your Clerk User ID is:", user.id);

      fetchMoodEntries();
    }
  }, [isLoaded, user, getToken, fetchMoodEntries]);

  const handleFactorToggle = (factor: string) => {
    setFactors(prev => 
      prev.includes(factor) 
        ? prev.filter(f => f !== factor) 
        : [...prev, factor]
    );
  };

  const handleSubmit = async () => {
    if (!selectedMood) return;
    
    // Check if enough time has passed since last entry
    if (!canLogMood()) {
      const hoursRemaining = Math.ceil(6 - ((new Date().getTime() - lastEntry!.getTime()) / (1000 * 60 * 60)));
      setToast({ 
        message: `Please wait ${hoursRemaining} more hours before logging another mood`, 
        type: 'error' 
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = await getToken();
      const response = await fetch("/api/mood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mood: selectedMood,
          notes,
          factors,
        }),
      });
      
      if (response.ok) {
        // Show success toast
        setToast({ 
          message: `Your ${selectedMood} mood has been logged successfully!`,
          type: 'success' 
        });
        
        // Clear form
        setSelectedMood("");
        setNotes("");
        setFactors([]);
        
        // Refresh mood entries
        fetchMoodEntries();
      } else {
        setToast({ message: 'Failed to log mood. Please try again.', type: 'error' });
      }
    } catch (error) {
      console.error("Error logging mood:", error);
      setToast({ message: 'An error occurred. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if user can log a mood (6-hour intervals)
  const canLogMood = () => {
    if (!lastEntry) return true;
    
    const now = new Date();
    const timeDiff = now.getTime() - lastEntry.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    return hoursDiff >= 6;
  };
  
  const moodEmojis: Record<string, string> = {
    "happy": "😊",
    "sad": "😢",
    "anxious": "😟",
    "calm": "😌",
    "excited": "🤩",
    "other": "🙂"
  };

  const moodRatings: Record<string, number> = {
    "sad": 1,
    "anxious": 2,
    "calm": 3,
    "happy": 4,
    "excited": 5,
    "other": 3
  };
  
  return (
    <div className={styles.container}>
      {/* User profile button */}
      <div className={styles.userButtonContainer}>
        <UserButton afterSignOutUrl="/" />
      </div>
      
      {/* Toast notification */}
      {toast && (
        <div className={styles.toastContainer}>
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        </div>
      )}
      
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1 className={styles.heading}>How are you feeling today?</h1>
            <p className={styles.subheading}>
              Choose one of the options below to track your mood.
            </p>
          </div>
          
          <div className={styles.moodGrid}>
            {/* Same mood grid code */}
            {Object.entries(moodEmojis).map(([mood, emoji]) => (
              <label 
                key={mood} 
                className={`${styles.moodItem} ${selectedMood === mood ? styles.selected : ''}`}>
                <input
                  type="radio"
                  name="mood"
                  value={mood}
                  checked={selectedMood === mood}
                  onChange={() => setSelectedMood(mood)}
                  className={styles.radioInput}
                />
                <div className={styles.moodEmoji}>
                  {mood === "other" ? (
                    <span className={styles.materialIcon}>🤔</span>
                  ) : (
                    emoji
                  )}
                </div>
                <span className={styles.moodLabel}>{mood.charAt(0).toUpperCase() + mood.slice(1)}</span>
              </label>
            ))}
          </div>
          
          <div className={styles.notesSection}>
            <label htmlFor="notes" className={styles.label}>
              Add a note (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={styles.textarea}
              placeholder="What&apos;s on your mind?"
              rows={2}
            ></textarea>
          </div>
          
          <div className={styles.factorsSection}>
            {/* Same factors section code */}
            <h3 className={styles.label}>What&apos;s influencing your mood? (optional)</h3>
            <div className={styles.factorButtons}>
              {["Work", "Relationships", "Health", "Exercise", "Weather", "Other"].map(factor => (
                <button
                  key={factor}
                  type="button"
                  onClick={() => handleFactorToggle(factor)}
                  className={`${styles.factorButton} ${factors.includes(factor) ? styles.factorSelected : ""}`}>
                  {factor}
                </button>
              ))}
            </div>
          </div>
          
          <div className={styles.submitSection}>
            <button 
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedMood}>
              {isSubmitting ? "Logging..." : "Log Mood"}
            </button>
            
            {/* Removed the warning message here */}
          </div>
        </div>
        
        <div className={styles.card}>
          {/* Same chart section */}
          <h2 className={styles.chartTitle}>Your Week in Moods</h2>
          <div className={styles.chart}>
            <div className={styles.chartContainer}>
              {weeklyMoods.length > 0 ? (
                <div className={styles.chartBars}>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
                    const dayEntries = weeklyMoods.filter(entry => {
                      const entryDate = new Date(entry.createdAt);
                      return entryDate.getDay() === (index + 1) % 7;
                    });
                    
                    const avgMood = dayEntries.length > 0
                      ? dayEntries.reduce((sum, entry) => {
                          if (typeof entry.mood === 'string') {
                            return sum + (moodRatings[entry.mood.toLowerCase()] || 3);
                          } else if (typeof entry.mood === 'number') {
                            return sum + entry.mood;
                          }
                          return sum;
                        }, 0) / dayEntries.length
                      : 0;
                    
                    const height = avgMood > 0 ? (avgMood / 5) * 100 : 0;
                    const colorClass = getColorClass(avgMood);
                    
                    return (
                      <div key={day} className={styles.barColumn}>
                        <div 
                          className={`${styles.bar} ${colorClass}`} 
                          style={{ height: `${height}%` }}></div>
                        <span className={styles.dayLabel}>{day}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.noData}>No mood data available yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Back to Dashboard Button */}
      <Link href="/dashboard" className={styles.backButton} aria-label="Back to dashboard">
        <span className={styles.backIcon}>←</span>
      </Link>
    </div>
  );
}

function getColorClass(mood: number): string {
  if (mood <= 1) return styles.barSad;
  if (mood <= 2) return styles.barAnxious;
  if (mood <= 3) return styles.barCalm;
  if (mood <= 4) return styles.barHappy;
  return styles.barExcited;
}