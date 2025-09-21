"use client";
import { BellRing, GripVertical, PlusIcon, Share2, Smile, Heart, Copy, Send, MessageSquare } from "lucide-react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import styles from "./styles.module.css";
import { User } from "lucide-react";
import ReminderModal from "@/components/ReminderModal";

// Toast component
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 7000); // Increased to 7 seconds for longer messages
    
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={styles.toast}>
      <div className={styles.toastIcon}>
        <Heart size={18} fill="#ef4399" color="#ef4399" />
      </div>
      <div className={styles.toastMessage}>
        {message.split('\n').map((line, i) => (
          <p key={i} className={i > 0 ? styles.toastNote : ''}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
};

// Define a goal type for type safety
interface Goal {
  id: number;
  text: string;
  completed: boolean;
  progress: number;
  category: 'short-term' | 'long-term';
}

interface Motivation {
    id: string;
    senderName: string;
    goalText: string;
    note: string;
    createdAt: string;
}

export default function GoalsPage() {
  // Add toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  const searchParams = useSearchParams();
  const firstRender = useRef(true);
  
  // Add confetti state
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentGoalToShare, setCurrentGoalToShare] = useState<Goal | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");
  const shareableLinkRef = useRef<HTMLInputElement>(null);
  
  const { user, isLoaded } = useUser();

  const [goals, setGoals] = useState<Goal[]>([
    { id: 1, text: "Practice mindfulness for 15 minutes daily", completed: true, progress: 100, category: 'short-term' },
    { id: 2, text: "Attend a yoga class", completed: false, progress: 25, category: 'short-term' },
    { id: 3, text: "Reduce stress levels by 50%", completed: false, progress: 75, category: 'long-term' },
    { id: 4, text: "Improve sleep quality", completed: false, progress: 50, category: 'long-term' },
  ]);
  
  const [newShortTermGoal, setNewShortTermGoal] = useState("");
  const [newLongTermGoal, setNewLongTermGoal] = useState("");
  const [draggedGoal, setDraggedGoal] = useState<Goal | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<string | null>(null);
  
  // New state for motivations
  const [motivations, setMotivations] = useState<Motivation[]>([]);
  const [isLoadingMotivations, setIsLoadingMotivations] = useState(false);
  // Add this for auto-refresh
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Filter goals by category
  const shortTermGoals = goals.filter(goal => goal.category === 'short-term');
  const longTermGoals = goals.filter(goal => goal.category === 'long-term');
  
  // Check for motivation on first render or URL parameter
  useEffect(() => {
    // Check for the motivated=true parameter in URL
    const isMotivated = searchParams.get('motivated') === 'true';
    
    // Only check localStorage if we have the parameter or it's first render
    if (isMotivated || firstRender.current) {
      firstRender.current = false;
      
      // Check localStorage for motivation data
      const motivationData = localStorage.getItem('motivationSent');
      if (motivationData) {
        try {
          const parsedData = JSON.parse(motivationData);
          
          // Check if the motivation is recent (last 5 minutes)
          const isRecent = Date.now() - parsedData.timestamp < 5 * 60 * 1000;
          
          if (isRecent) {
            let message = `${parsedData.sender || 'Someone'} sent you motivation for your goal!`;
            
            // Add note to message if present
            if (parsedData.note && parsedData.note.trim() !== '') {
              message += `\n"${parsedData.note}"`;
            }
            
            setToastMessage(message);
            setShowToast(true);
            
            // Trigger confetti for motivation
            triggerConfetti();
            
            // Clear the motivation data after showing the toast
            localStorage.removeItem('motivationSent');
          }
        } catch (error) {
          console.error("Error parsing motivation data:", error);
        }
      }
    }
  }, [searchParams]);

  // Function to trigger confetti
  const triggerConfetti = () => {
    setShowConfetti(true);
    // Hide confetti after 3 seconds (matching animation duration)
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  };

  // Function to generate a shareable link for a goal
  const generateShareableLink = (goal: Goal) => {
    const baseUrl = window.location.origin;
    const goalData = encodeURIComponent(JSON.stringify({
      text: goal.text,
      category: goal.category,
      progress: goal.progress,
      sharedBy: user?.firstName || "A friend",
      userId: user?.id  // Include the Clerk user ID
    }));
    return `${baseUrl}/goals/share?data=${goalData}`;
  };

  // Web Share API function
  const shareGoal = async (goal: Goal) => {
    setCurrentGoalToShare(goal);
    
    const shareData = {
      title: 'Mental Wellness Goal',
      text: `Check out my goal: ${goal.text} (${goal.progress}% complete)`,
      url: generateShareableLink(goal)
    };

    // Check if Web Share API is supported
    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        console.log('Goal shared successfully');
        // Maybe show a success toast here
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to modal if sharing was rejected/failed
        setShareModalOpen(true);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      setShareModalOpen(true);
    }
  };

  // Function to copy link to clipboard
  const copyToClipboard = () => {
    if (shareableLinkRef.current) {
      shareableLinkRef.current.select();
      document.execCommand('copy');
      setCopySuccess("Copied!");
      
      // Reset success message after 2 seconds
      setTimeout(() => {
        setCopySuccess("");
      }, 2000);
    }
  };

  // Function to send via email
  const sendEmail = () => {
    if (currentGoalToShare) {
      const subject = encodeURIComponent('Check out my wellness goal');
      const body = encodeURIComponent(`I wanted to share my goal with you: ${currentGoalToShare.text} (${currentGoalToShare.progress}% complete)\n\nView it here: ${generateShareableLink(currentGoalToShare)}`);
      
      window.open(`mailto:?subject=${subject}&body=${body}`);
    }
  };
  
  const addShortTermGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newShortTermGoal.trim() === "") return;
    
    setGoals([
      ...goals,
      { 
        id: Date.now(), 
        text: newShortTermGoal, 
        completed: false, 
        progress: 0,
        category: 'short-term'
      }
    ]);
    setNewShortTermGoal("");
    triggerConfetti(); // Show confetti when goal is added
  };
  
  const addLongTermGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLongTermGoal.trim() === "") return;
    
    setGoals([
      ...goals,
      { 
        id: Date.now(), 
        text: newLongTermGoal, 
        completed: false, 
        progress: 0,
        category: 'long-term'
      }
    ]);
    setNewLongTermGoal("");
    triggerConfetti(); // Show confetti when goal is added
  };
  
  const toggleGoalCompletion = (goalId: number) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        // If the goal is being marked as completed (not previously completed)
        if (!goal.completed) {
          // Show confetti only when completing a goal, not uncompleting
          triggerConfetti();
        }
        return { ...goal, completed: !goal.completed };
      }
      return goal;
    }));
  };

  // Drag and drop handlers
  const handleDragStart = (goal: Goal) => {
    setDraggedGoal(goal);
  };

  const handleDragEnd = () => {
    setDraggedGoal(null);
    setIsDraggingOver(null);
  };

  const handleDragOver = (e: React.DragEvent, category: string) => {
    e.preventDefault();
    setIsDraggingOver(category);
  };

  const handleDrop = (e: React.DragEvent, targetCategory: 'short-term' | 'long-term') => {
    e.preventDefault();
    
    if (draggedGoal && draggedGoal.category !== targetCategory) {
      setGoals(goals.map(goal =>
        goal.id === draggedGoal.id ? { ...goal, category: targetCategory } : goal
      ));
    }
    
    setIsDraggingOver(null);
  };
  
  // Render goal item component
  const renderGoalItem = (goal: Goal) => (
    <div 
      key={goal.id} 
      className={`${styles.goalItem} ${goal.completed ? styles.completed : ''}`}
      draggable
      onDragStart={() => handleDragStart(goal)}
      onDragEnd={handleDragEnd}
    >
      <GripVertical className={styles.gripIcon} />
      <div className={styles.goalContent}>
        <div className={styles.goalHeader}>
          <p>{goal.text}</p>
          <input 
            type="checkbox" 
            checked={goal.completed}
            onChange={() => toggleGoalCompletion(goal.id)}
          />
        </div>
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBarBg}>
            <div 
              className={styles.progressBar} 
              style={{width: `${goal.progress}%`}}
            ></div>
          </div>
        </div>
        <div className={styles.goalActions}>
          <button
            className={styles.actionBtn}
            onClick={() =>
              openReminderModal({ id: goal.id as number, text: goal.text })
            }
            aria-label={`Set reminder for ${goal.text}`}
          >
            ⏰ Set Reminder
          </button>
          <button className={styles.actionBtn}>
            <Smile size={16} /> Link to Mood
          </button>
          <button className={styles.actionBtn} onClick={() => shareGoal(goal)}>
            <Share2 size={16} /> Share
          </button>
        </div>
      </div>
    </div>
  );
  
  // Function to close the toast
  const closeToast = () => {
    setShowToast(false);
  };
  
  // Fetch motivations from the server
  const fetchMotivations = useCallback(async () => {
    if (!isLoaded || !user) return;
    
    try {
      setIsLoadingMotivations(true);
      const response = await fetch('/api/motivations/get', {
        // Add cache busting to prevent cached responses
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch motivations');
      }
      
      const data = await response.json();
      
      if (data.motivations) {
        setMotivations(data.motivations);
      }
    } catch (error) {
      console.error('Error fetching motivations:', error);
    } finally {
      setIsLoadingMotivations(false);
    }
  }, [isLoaded, user]);

  // Initial fetch when component mounts
  useEffect(() => {
    if (isLoaded && user) {
      fetchMotivations();
    }
  }, [isLoaded, user, fetchMotivations]);
  
  // Check for motivation query parameter
  useEffect(() => {
    if (searchParams.get('motivated') === 'true') {
      // Trigger a refresh immediately when 'motivated' param is present
      fetchMotivations();
    }
  }, [searchParams, fetchMotivations]);
  
  // Set up auto-refresh interval
  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      // Increment the refresh trigger to track refreshes
      setRefreshTrigger(prev => prev + 1);
      fetchMotivations();
    }, 30000); // 30 seconds
    
    // Clean up on unmount
    return () => clearInterval(interval);
  }, [isLoaded, user, fetchMotivations]);
  
  // Debug effect to log refreshes (optional)
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log(`Auto-refreshed motivations (${refreshTrigger})`);
    }
  }, [refreshTrigger]);
  
  // reminder modal state & handlers
  const [reminderOpen, setReminderOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<{ id: number; text: string } | null>(null);

  const openReminderModal = (goal: { id: number; text: string }) => {
    setSelectedGoal(goal);
    setReminderOpen(true);
  };

  const closeReminderModal = () => {
    setSelectedGoal(null);
    setReminderOpen(false);
  };

  const handleReminderSet = (payload: {
    goal: string;
    time: string;
    frequency: string;
    message: string;
    addToCalendar: boolean;
  }) => {
    // keep existing behaviour: show toast / persist as needed
    console.log("Reminder set:", payload);
    // Example: integrate with your toast code if present
    // setToastMessage(`Reminder set for "${payload.goal}" — ${payload.frequency} @ ${payload.time}`);
    // setShowToast(true);
  };

  return (
    <div className={styles.designRoot}>
      {/* Toast notification */}
      {showToast && (
        <Toast 
          message={toastMessage} 
          onClose={closeToast}
        />
      )}
      
      {/* Confetti conditionally rendered */}
      {showConfetti && (
        <div className={styles.confettiContainer}>
          <div className={styles.confetti}></div>
          <div className={styles.confetti}></div>
          <div className={styles.confetti}></div>
          <div className={styles.confetti}></div>
          <div className={styles.confetti}></div>
          <div className={styles.confetti}></div>
          <div className={styles.confetti}></div>
          <div className={styles.confetti}></div>
          <div className={styles.confetti}></div>
        </div>
      )}

      <main className={styles.mainContent}>
        <div className={styles.container}>
          <div className={styles.contentWrapper}>
            <header className={styles.header}>
              <h1>Your Mental Wellness Goals</h1>
              <p>Drag, drop, and conquer your goals for a healthier mind.</p>
            </header>
            
            <div className={styles.goalsGrid}>
              {/* Short-Term Goals */}
              <section 
                className={`${styles.goalsCard} ${isDraggingOver === 'short-term' ? styles.dropTarget : ''}`}
                onDragOver={(e) => handleDragOver(e, 'short-term')}
                onDrop={(e) => handleDrop(e, 'short-term')}
              >
                <h2>Short-Term Goals</h2>
                <form className={styles.goalForm} onSubmit={addShortTermGoal}>
                  <input 
                    placeholder="Add a new goal..." 
                    value={newShortTermGoal}
                    onChange={(e) => setNewShortTermGoal(e.target.value)}
                  />
                  <button type="submit">
                    <PlusIcon />
                  </button>
                </form>
                
                <div className={styles.goalsList}>
                  {shortTermGoals.map(goal => renderGoalItem(goal))}
                  {isDraggingOver === 'short-term' && draggedGoal && (
                    <div className={styles.dropPlaceholder}>
                      Drop here to move goal to Short-Term
                    </div>
                  )}
                </div>
              </section>
              
              {/* Long-Term Goals */}
              <section 
                className={`${styles.goalsCard} ${isDraggingOver === 'long-term' ? styles.dropTarget : ''}`}
                onDragOver={(e) => handleDragOver(e, 'long-term')}
                onDrop={(e) => handleDrop(e, 'long-term')}
              >
                <h2>Long-Term Goals</h2>
                <form className={styles.goalForm} onSubmit={addLongTermGoal}>
                  <input 
                    placeholder="Add a new goal..." 
                    value={newLongTermGoal}
                    onChange={(e) => setNewLongTermGoal(e.target.value)}
                  />
                  <button type="submit">
                    <PlusIcon />
                  </button>
                </form>
                
                <div className={styles.goalsList}>
                  {longTermGoals.map(goal => renderGoalItem(goal))}
                  {isDraggingOver === 'long-term' && draggedGoal && (
                    <div className={styles.dropPlaceholder}>
                      Drop here to move goal to Long-Term
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      
      {/* Motivations Section - New addition */}
      <section className={styles.motivationsSection}>
        <div className={styles.motivationsHeader}>
          <h2 className={styles.motivationsTitle}>
            <Heart size={24} className={styles.motivationsIcon} /> People Rooting for You
          </h2>
          <p className={styles.motivationsSubtitle}>
            Supportive messages from people who believe in your goals
            {refreshTrigger > 0 && (
              <span className={styles.autoRefreshIndicator}>
                • Auto-refreshing
              </span>
            )}
          </p>
        </div>
        
        {/* Show loading state */}
        {isLoadingMotivations ? (
          <div className={styles.motivationsLoading}>
            <div className={styles.motivationsSpinner}></div>
            <p>Loading motivations...</p>
          </div>
        ) : motivations.length > 0 ? (
          <div className={styles.motivationsGrid}>
            {motivations.map((motivation) => (
              <div key={motivation.id} className={styles.motivationCard}>
                <div className={styles.motivationHeader}>
                  <div className={styles.motivationAvatar}>
                    <User size={18} />
                  </div>
                  <div className={styles.motivationFrom}>
                    <span className={styles.fromLabel}>From:</span>
                    <span className={styles.senderName}>{motivation.senderName}</span>
                  </div>
                  <div className={styles.motivationDate}>
                    {new Date(motivation.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className={styles.motivationGoal}>
                  <span className={styles.goalLabel}>Goal:</span> {motivation.goalText}
                </div>
                
                {motivation.note && (
                  <div className={styles.motivationNote}>
                    <MessageSquare size={14} className={styles.noteIcon} />
                    <p>&quot;{motivation.note}&quot;</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noMotivations}>
            <div className={styles.emptyStateIcon}>
              <Heart size={48} />
            </div>
            <p>No motivations yet. Share your goals with others to get support!</p>
          </div>
        )}
      </section>
      
      {/* Share Modal - Updated with Web Share API fallback */}
      {shareModalOpen && currentGoalToShare && (
        <div className={styles.modal}>
          <div className={styles.modalContainer}>
            <div 
              className={styles.modalBackdrop}
              onClick={() => setShareModalOpen(false)}
            ></div>
            
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <div className={styles.modalIcon}>
                  <Share2 />
                </div>
                <div className={styles.modalTitle}>
                  <h3>Share Your Goal</h3>
                  <p>Share your progress with a friend or therapist for extra support.</p>
                </div>
              </div>
              
              <div className={styles.modalBody}>
                <div className={styles.goalPreview}>
                  <h4>{currentGoalToShare.text}</h4>
                  <div className={styles.progressBarContainerSmall}>
                    <div className={styles.progressBarBg}>
                      <div 
                        className={styles.progressBar} 
                        style={{width: `${currentGoalToShare.progress}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="link">Shareable Link</label>
                  <div className={styles.inputGroup}>
                    <input 
                      type="text" 
                      id="link" 
                      name="link" 
                      readOnly 
                      ref={shareableLinkRef}
                      value={generateShareableLink(currentGoalToShare)}
                    />
                    <button type="button" onClick={copyToClipboard}>
                      {copySuccess || <><Copy size={14} /> Copy</>}
                    </button>
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Share via Email</label>
                  <button 
                    className={styles.emailShareButton} 
                    onClick={sendEmail}
                  >
                    <Send size={16} /> Compose Email
                  </button>
                </div>
              </div>
              
              <div className={styles.modalFooter}>
                <button 
                  className={styles.btnPrimary} 
                  type="button"
                  onClick={() => setShareModalOpen(false)}
                >
                  Done
                </button>
                <button 
                  className={styles.btnSecondary} 
                  type="button"
                  onClick={() => setShareModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Render the modal once at page root */}
      <ReminderModal
        isOpen={reminderOpen}
        onClose={closeReminderModal}
        goal={selectedGoal}
        onSet={handleReminderSet}
      />
    </div>
  );
}