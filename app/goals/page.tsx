"use client";

import { BellRing, GripVertical, PlusIcon, Share2, Smile, Heart, Copy, Send, MessageSquare, CheckCircle } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import styles from "./styles.module.css";
import { User } from "lucide-react";
import ReminderModal from "@/components/ReminderModal";
import { useOneSignal } from '@/hooks/useOneSignal';

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

// Add this component inside your goals page file
const NotificationPrompt = ({ onRequestPermission, onDismiss }: { 
  onRequestPermission: () => void; 
  onDismiss: () => void; 
}) => (
  <div style={{
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    zIndex: 10000,
    maxWidth: '320px',
    border: '1px solid #e5e7eb',
    animation: 'slideInRight 0.3s ease-out'
  }}>
    <div style={{ fontSize: '24px', textAlign: 'center', marginBottom: '12px' }}>
      🔔
    </div>
    <div>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
        Enable Goal Reminders
      </h3>
      <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280', lineHeight: '1.4' }}>
        Get notified when it's time to work on your goals. We'll send you helpful reminders.
      </p>
    </div>
    <div style={{ display: 'flex', gap: '8px' }}>
      <button 
        onClick={onRequestPermission}
        style={{
          flex: 1,
          background: '#ef4399',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 16px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer'
        }}
      >
        Enable Notifications
      </button>
      <button 
        onClick={onDismiss}
        style={{
          flex: 1,
          background: '#f3f4f6',
          color: '#6b7280',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 16px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer'
        }}
      >
        Maybe Later
      </button>
    </div>
  </div>
);

export default function GoalsPage() {
  // Replace useFCM with useOneSignal
  const { permission, requestPermission, sendTestNotification } = useOneSignal();
  
  // Add notification prompt state
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  
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
  
  // Reminder modal state
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [currentGoalForReminder, setCurrentGoalForReminder] = useState<Goal | null>(null);
  
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
  const [motivations, setMotivations] = useState<any[]>([]);
  const [isLoadingMotivations, setIsLoadingMotivations] = useState(false);
  // Add this for auto-refresh
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Add this state near your other useState declarations
  const [goalReminders, setGoalReminders] = useState<{[key: number]: boolean}>({});

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
  
  // Function to open the reminder modal for a specific goal
  const openReminderModal = (goal: Goal) => {
    setCurrentGoalForReminder(goal);
    setReminderModalOpen(true);
  };

  // Function to check reminder status for all goals
  const checkGoalReminders = async () => {
    if (!isLoaded || !user) return;
    
    const remindersStatus: {[key: number]: boolean} = {};
    
    // Check each goal for existing reminders
    for (const goal of goals) {
      try {
        const response = await fetch(`/api/reminders?goalId=${goal.id}`);
        const data = await response.json();
        remindersStatus[goal.id] = data.exists;
      } catch (error) {
        console.error(`Error checking reminder for goal ${goal.id}:`, error);
        remindersStatus[goal.id] = false;
      }
    }
    
    setGoalReminders(remindersStatus);
  };

  // Render goal item component
  const renderGoalItem = (goal: Goal) => {
    const hasReminder = goalReminders[goal.id];
    
    return (
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
                style={{ width: `${goal.progress}%` }}
              ></div>
            </div>
          </div>
          <div className={styles.goalActions}>
            <button 
              className={styles.actionBtn} 
              onClick={() => openReminderModal(goal)}
              style={{
                color: hasReminder ? '#22c55e' : '#6B7280',
                fontWeight: hasReminder ? '600' : '400'
              }}
            >
              {hasReminder ? (
                <>
                  <CheckCircle size={16} /> Reminder Set
                </>
              ) : (
                <>
                  <BellRing size={16} /> Remind Me
                </>
              )}
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
  };
  
  // Function to close the toast
  const closeToast = () => {
    setShowToast(false);
  };
  
  // Fetch motivations from the server
  const fetchMotivations = async () => {
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
  };

  // Initial fetch when component mounts
  useEffect(() => {
    if (isLoaded && user) {
      fetchMotivations();
    }
  }, [isLoaded, user]);
  
  // Check for motivation query parameter
  useEffect(() => {
    if (searchParams.get('motivated') === 'true') {
      // Trigger a refresh immediately when 'motivated' param is present
      fetchMotivations();
    }
  }, [searchParams]);
  
  // Set up auto-refresh interval
  useEffect(() => {
    // Auto-refresh every 5 hours instead of 30 seconds
    const interval = setInterval(() => {
      // Increment the refresh trigger to track refreshes
      setRefreshTrigger(prev => prev + 1);
      fetchMotivations();
    }, 18000000); // 5 hours in milliseconds
    
    // Clean up on unmount
    return () => clearInterval(interval);
  }, [isLoaded, user]);
  
  // Debug effect to log refreshes (optional)
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log(`Auto-refreshed motivations (${refreshTrigger})`);
    }
  }, [refreshTrigger]);
  
  // Add this useEffect to check reminders when component loads
  useEffect(() => {
    if (isLoaded && user) {
      checkGoalReminders();
    }
  }, [isLoaded, user, goals]);
  
  // Test FCM function
  const testFCM = async () => {
    console.log('🔧 Testing FCM setup...');
    
    // Check permission
    console.log('📱 Notification permission:', permission);
    
    // Request permission if needed
    if (permission !== 'granted') {
      const granted = await requestPermission();
      console.log('🔔 Permission granted:', granted);
    }
    
    // Test notification
    try {
      const response = await fetch('/api/fcm/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      console.log('📤 Test notification result:', result);
    } catch (error) {
      console.error('❌ Test notification failed:', error);
    }
  };

  // Make testFCM available globally for console testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).testFCM = testFCM;
    }
  }, []);

  // Add this useEffect to show notification prompt
  useEffect(() => {
    if (isLoaded && user && permission === 'default') {
      // Check if user recently dismissed the prompt
      const dismissed = localStorage.getItem('notificationPromptDismissed');
      const dayAgo = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
      
      if (!dismissed || parseInt(dismissed) < dayAgo) {
        const timer = setTimeout(() => {
          setShowNotificationPrompt(true);
        }, 3000); // Show after 3 seconds
        
        return () => clearTimeout(timer);
      }
    }
  }, [isLoaded, user, permission]);

  // Update prompt handlers
  const handleRequestPermission = async () => {
    setShowNotificationPrompt(false);
    const granted = await requestPermission();
    
    if (granted) {
      console.log('✅ Notifications enabled successfully');
    }
  };

  const handleDismissPrompt = () => {
    setShowNotificationPrompt(false);
    // Store dismissal in localStorage to not show again for a while
    localStorage.setItem('notificationPromptDismissed', Date.now().toString());
  };

  // Add this for OneSignal debugging
  const debugOneSignal = async () => {
    if (window.OneSignal && window.OneSignal.initialized) {
      console.log('🔧 OneSignal Debug Information:');
      console.log('- Notification permission:', Notification.permission);
      
      // Get player ID
      const playerId = await window.OneSignal.getUserId();
      console.log('- OneSignal Player ID:', playerId);
      
      // Test sending a notification
      if (playerId) {
        const testResult = await sendTestNotification('This is a test notification from OneSignal!');
        console.log('- Test notification result:', testResult);
      }
    } else {
      console.log('❌ OneSignal not initialized');
    }
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
      
      {/* Notification Permission Prompt */}
      {showNotificationPrompt && (
        <NotificationPrompt 
          onRequestPermission={handleRequestPermission}
          onDismiss={handleDismissPrompt}
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
                    <p>"{motivation.note}"</p>
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

      {/* Reminder Modal - New addition */}
      <ReminderModal 
        isOpen={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        goal={currentGoalForReminder}
      />

      {/* Add this button to test basic notifications (add it to your goals page) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          background: 'rgba(0,0,0,0.9)',
          color: 'white',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '11px',
          zIndex: 10000,
          maxWidth: '300px',
          fontFamily: 'monospace'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>🔧 Debug Panel</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              onClick={async () => {
                try {
                  console.log('🧪 Testing database connection...');
                  const response = await fetch('/api/test-db');
                  const result = await response.json();
                  console.log('DB Test Result:', result);
                  alert(`DB Test: ${result.success ? 'Success' : 'Failed'}\n${JSON.stringify(result, null, 2)}`);
                } catch (error) {
                  console.error('DB Test Error:', error);
                  alert(`DB Test Error: ${error}`);
                }
              }}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              Test Database
            </button>
            
            <button
              onClick={async () => {
                try {
                  console.log('🧪 Testing FCM registration step by step...');
                  
                  // Step 1: Check if user is logged in
                  console.log('Step 1: User check -', user ? 'Logged in' : 'Not logged in');
                  if (!user) {
                    alert('User not logged in!');
                    return;
                  }
                  
                  // Step 2: Test FCM registration
                  console.log('Step 2: Starting FCM registration...');
                  const success = await requestPermission();
                  console.log('FCM Registration result:', success);
                  
                  alert(`FCM Test: ${success ? 'Success' : 'Failed'}\nCheck console for details`);
                } catch (error) {
                  console.error('FCM Test Error:', error);
                  alert(`FCM Test Error: ${error instanceof Error ? error.message : String(error)}`);
                }
              }}
              style={{
                background: '#ef4399',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              Test FCM Flow
            </button>
            
            <button
              onClick={async () => {
                console.log('🔍 Environment check:', {
                  NODE_ENV: process.env.NODE_ENV,
                  VAPID_KEY: process.env.NEXT_PUBLIC_VAPID_API_KEY ? 'Found' : 'Missing',
                  USER_ID: user?.id || 'No user',
                  CLERK_USER: !!user,
                  SW_SUPPORT: 'serviceWorker' in navigator,
                  NOTIFICATION_SUPPORT: 'Notification' in window
                });
              }}
              style={{
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              Environment Check
            </button>

            {/* Add this button to test FCM setup */}
      
          </div>
        </div>
      )}

      {/* Add this button to test real FCM notifications */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={async () => {
            try {
              console.log('🚀 Testing REAL FCM notification...');
              
              // First ensure FCM token is registered
              const success = await requestPermission();
              if (!success) {
                alert('❌ FCM registration failed');
                return;
              }

              console.log('✅ FCM registered, sending REAL notification...');
              
              // Send actual notification via Firebase Admin
              const response = await fetch('/api/test-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: '🎯 Real Luma Notification',
                  body: 'This is a REAL notification sent via Firebase Admin SDK!',
                  testMode: true
                })
              });
              
              const result = await response.json();
              console.log('📬 Real notification result:', result);
              
              if (response.ok) {
                alert('✅ REAL notification sent! Minimize this browser tab NOW to see the desktop notification.');
                console.log('Message ID:', result.messageId);
              } else {
                alert(`❌ Error: ${result.error}`);
              }
            } catch (error) {
              console.error('❌ Real notification test error:', error);
              alert(`❌ Test failed: ${error}`);
            }
          }}
          style={{
            position: 'fixed',
            top: '80px',
            left: '20px',
            background: '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            zIndex: 10000,
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
          }}
        >
          🚀 Send REAL FCM Notification
        </button>
      )}

      {/* Add this button to test Firebase Admin setup */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={async () => {
            try {
              console.log('🔧 Testing Firebase Admin setup...');
              const response = await fetch('/api/debug-firebase');
              const result = await response.json();
              console.log('Firebase Debug Result:', result);
              
              if (result.success) {
                alert('✅ Firebase Admin is working!\n' + JSON.stringify(result, null, 2));
              } else {
                alert('❌ Firebase Admin setup failed:\n' + result.error + '\n\nCheck console for details');
              }
            } catch (error) {
              console.error('Debug test error:', error);
              alert(`Debug test failed: ${error}`);
            }
          }}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            background: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '12px',
            cursor: 'pointer',
            zIndex: 10000
          }}
        >
          🔧 Debug Firebase Admin
        </button>
      )}
    </div>
  );
}