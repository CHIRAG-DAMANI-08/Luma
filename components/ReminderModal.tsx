"use client";
import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, CheckCircle, AlertCircle, Check } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useOneSignal } from '@/hooks/useOneSignal';

interface Goal {
  id: number;
  text: string;
  category: 'short-term' | 'long-term';
}

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
}

interface ExistingReminder {
  id: string;
  frequency: string;
  time: string;
  customMessage: string | null;
  addToCalendar: boolean;
}

// Animated Success Overlay Component
const AnimatedSuccessOverlay = ({ 
  onComplete 
}: { 
  onComplete: () => void;
}) => {
  const [showCheck, setShowCheck] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // Step 1: Show animated checkmark
    const checkTimer = setTimeout(() => {
      setShowCheck(true);
    }, 100);

    // Step 2: Show text after checkmark animation
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 800);

    // Step 3: Auto-close after showing everything
    const closeTimer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(checkTimer);
      clearTimeout(textTimer);
      clearTimeout(closeTimer);
    };
  }, [onComplete]);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}
    >
      <div style={{ textAlign: 'center' }}>
        {/* Animated Checkmark */}
        <div 
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            transform: showCheck ? 'scale(1)' : 'scale(0)',
            transition: 'transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            opacity: showCheck ? 1 : 0
          }}
        >
          <Check 
            size={40} 
            color="white" 
            style={{
              transform: showCheck ? 'scale(1)' : 'scale(0)',
              transition: 'transform 0.3s ease 0.2s'
            }}
          />
        </div>

        {/* Success Text */}
        <div
          style={{
            opacity: showText ? 1 : 0,
            transform: showText ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.4s ease'
          }}
        >
          <h2 
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1b0d14',
              margin: '0 0 8px 0'
            }}
          >
            Reminder Created!
          </h2>
          <p 
            style={{
              fontSize: '16px',
              color: '#6B7280',
              margin: 0
            }}
          >
            You'll receive notifications at your chosen time
          </p>
        </div>
      </div>
    </div>
  );
};

// Simple Error Alert Component (keeping this minimal)
const ErrorAlert = ({ 
  title, 
  message, 
  onClose 
}: { 
  title: string;
  message: string;
  onClose: () => void;
}) => {
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: '16px',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fef2f2',
          border: '2px solid #ef4444',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <AlertCircle size={24} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
          
          <div style={{ flex: 1 }}>
            <h3 
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#dc2626',
                margin: '0 0 8px 0'
              }}
            >
              {title}
            </h3>
            <p 
              style={{
                fontSize: '14px',
                color: '#991b1b',
                margin: '0 0 20px 0',
                lineHeight: '1.5'
              }}
            >
              {message}
            </p>
            
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '10px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose, goal }) => {
  const [frequency, setFrequency] = useState('daily');
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');
  const [customMessage, setCustomMessage] = useState('');
  const [addToCalendar, setAddToCalendar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // New states for existing reminder functionality
  const [existingReminder, setExistingReminder] = useState<ExistingReminder | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCheckingReminder, setIsCheckingReminder] = useState(false);
  
  // Alert states
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [errorAlert, setErrorAlert] = useState<{
    title: string;
    message: string;
  } | null>(null);
  
  const { user } = useUser();
  const { permission, requestPermission } = useOneSignal();

  // Check for existing reminder when modal opens
  useEffect(() => {
    if (isOpen && goal && user) {
      checkExistingReminder();
    }
  }, [isOpen, goal, user]);

  // Load existing reminder data into form
  useEffect(() => {
    if (existingReminder) {
      setFrequency(existingReminder.frequency);
      setCustomMessage(existingReminder.customMessage || '');
      setAddToCalendar(existingReminder.addToCalendar);
      
      // Parse time
      const [hours, minutes] = existingReminder.time.split(':').map(Number);
      const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const period = hours >= 12 ? 'PM' : 'AM';
      
      setSelectedHour(hour12);
      setSelectedMinute(minutes);
      setSelectedPeriod(period);
      setIsEditMode(true);
    } else {
      // Reset to defaults
      setFrequency('daily');
      setSelectedHour(9);
      setSelectedMinute(0);
      setSelectedPeriod('AM');
      setCustomMessage('');
      setAddToCalendar(false);
      setIsEditMode(false);
    }
  }, [existingReminder]);

  const oneSignalInitialized = useRef(false);

  // Debugging effect for OneSignal initialization
  useEffect(() => {
    if (isOpen) {
      // Debug OneSignal initialization status
      const checkOneSignal = () => {
        console.log("🔔 OneSignal Debugging:");
        
        if (window.OneSignal) {
          console.log("- OneSignal object exists on window");
          console.log("- OneSignal initialized:", window.OneSignal.initialized);
          
          // If OneSignal exists but isn't initialized yet, we'll retry
          if (!window.OneSignal.initialized) {
            console.log("- Waiting for initialization...");
            return false;
          }
          
          // Store initialization state
          oneSignalInitialized.current = true;
          return true;
        } else {
          console.log("- OneSignal object not found on window!");
          return false;
        }
      };
      
      // Check immediately
      const isInitialized = checkOneSignal();
      
      // If not initialized, set up a retry mechanism
      if (!isInitialized) {
        const initCheckInterval = setInterval(() => {
          if (checkOneSignal()) {
            clearInterval(initCheckInterval);
            console.log("- OneSignal is now initialized!");
          }
        }, 1000);
        
        // Clear interval on component cleanup
        return () => clearInterval(initCheckInterval);
      }
    }
  }, [isOpen]);

  if (!isOpen || !goal) return null;

  const checkExistingReminder = async () => {
    setIsCheckingReminder(true);
    try {
      const response = await fetch(`/api/reminders?goalId=${goal.id}`);
      const data = await response.json();
      
      if (response.ok && data.exists) {
        setExistingReminder(data.reminder);
      } else {
        setExistingReminder(null);
      }
    } catch (error) {
      console.error('Error checking existing reminder:', error);
    } finally {
      setIsCheckingReminder(false);
    }
  };

  const showError = (title: string, message: string) => {
    setErrorAlert({ title, message });
  };

  const closeError = () => {
    setErrorAlert(null);
  };

  const deleteReminder = async () => {
    try {
      const response = await fetch('/api/reminders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId: goal.id.toString() })
      });

      if (response.ok) {
        setExistingReminder(null);
        setIsEditMode(false);
        setShowSuccessOverlay(true);
      } else {
        throw new Error('Failed to delete reminder');
      }
    } catch (error) {
      showError(
        'Failed to Remove Reminder',
        'Something went wrong while removing your reminder. Please try again.'
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Request notification permission through OneSignal and make sure we get a player ID
      if (permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          showError(
            'Permission Required',
            'Browser notification permission is required to set reminders. Please allow notifications and try again.'
          );
          setIsSubmitting(false);
          return; // Stop here if permission not granted
        }
      }

      // Wait a moment for OneSignal to register the player ID
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Convert to 24-hour format
      let hour24 = selectedHour;
      if (selectedPeriod === 'PM' && selectedHour !== 12) {
        hour24 += 12;
      } else if (selectedPeriod === 'AM' && selectedHour === 12) {
        hour24 = 0;
      }

      const timeString = `${hour24.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
      
      // Call the reminder API
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalId: goal.id.toString(),
          goalText: goal.text,
          reminder: {
            frequency,
            time: timeString,
            customMessage: customMessage || `Time for: ${goal.text}`,
            addToCalendar
          }
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitSuccess(true);
        setExistingReminder(data.reminder);
        setShowSuccessOverlay(true);
      } else {
        // If the error is about missing notification token, let's handle it specifically
        if (data.error?.includes("notification token")) {
          showError(
            'Notification Setup Needed',
            'Please reload the page and try again. Make sure to allow notifications when prompted.'
          );
        } else {
          throw new Error(data.error || 'Failed to set reminder');
        }
      }
    } catch (error) {
      console.error('Reminder error:', error);
      showError(
        'Failed to Set Reminder',
        `Something went wrong: ${
          error instanceof Error ? error.message : String(error)
        }. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessComplete = () => {
    setShowSuccessOverlay(false);
    setSubmitSuccess(false);
    onClose();
  };

  // Generate hour options (1-12)
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  // Generate minute options (00, 15, 30, 45)
  const minutes = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59];

  return (
    <>
      {/* Main Modal */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 16px',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          minHeight: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}
        onClick={onClose}
      >
        {/* Modal Content */}
        <div 
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '448px',
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            transform: 'scale(1)',
            opacity: 1,
            transition: 'all 0.3s ease'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#6B7280'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                backgroundColor: existingReminder ? '#DCF6E8' : '#FCE7F3',
                borderRadius: '50%',
                marginBottom: '16px'
              }}
            >
              {existingReminder ? (
                <Check style={{ width: '32px', height: '32px', color: '#22c55e' }} />
              ) : (
                <svg 
                  style={{ width: '32px', height: '32px', color: '#ef4399' }}
                  fill="none" 
                  viewBox="0 0 48 48" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    clipRule="evenodd" 
                    d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" 
                    fill="currentColor" 
                    fillRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <h1 
              style={{
                fontSize: '30px',
                fontWeight: '700',
                color: '#1b0d14',
                margin: '0 0 8px 0'
              }}
            >
              {existingReminder ? 'Edit Goal Reminder' : 'Set a Goal Reminder'}
            </h1>
            <p 
              style={{
                color: '#6B7280',
                margin: '0',
                fontSize: '14px'
              }}
            >
              {existingReminder ? 'Update your reminder settings.' : 'Stay on track with your mental wellness goals.'}
            </p>
          </div>

          {/* Loading state */}
          {isCheckingReminder ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '4px solid #f3f4f6', 
                borderTop: '4px solid #ef4399', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ color: '#6B7280' }}>Checking existing reminder...</p>
            </div>
          ) : (
            <>
              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Goal Field */}
                <div>
                  <label 
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '6px'
                    }}
                  >
                    Goal
                  </label>
                  <div 
                    style={{
                      width: '100%',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: '#F9FAFB',
                      padding: '12px 16px',
                      color: '#111827',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    {goal.text}
                  </div>
                </div>

                {/* Time and Frequency */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Custom Time Picker */}
                  <div>
                    <label 
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '6px'
                      }}
                    >
                      <Clock style={{ width: '16px', height: '16px', display: 'inline', marginRight: '6px' }} />
                      Time
                    </label>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      {/* Hour Select */}
                      <select
                        value={selectedHour}
                        onChange={(e) => setSelectedHour(Number(e.target.value))}
                        style={{
                          flex: 1,
                          borderRadius: '8px',
                          border: '1px solid #D1D5DB',
                          backgroundColor: '#F9FAFB',
                          padding: '8px 12px',
                          color: '#111827',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          outline: 'none',
                          appearance: 'none',
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 8px center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '12px'
                        }}
                      >
                        {hours.map(hour => (
                          <option key={hour} value={hour}>{hour}</option>
                        ))}
                      </select>
                      
                      <span style={{ color: '#6B7280', fontSize: '16px', fontWeight: '500' }}>:</span>
                      
                      {/* Minute Select */}
                      <select
                        value={selectedMinute}
                        onChange={(e) => setSelectedMinute(Number(e.target.value))}
                        style={{
                          flex: 1,
                          borderRadius: '8px',
                          border: '1px solid #D1D5DB',
                          backgroundColor: '#F9FAFB',
                          padding: '8px 12px',
                          color: '#111827',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          outline: 'none',
                          appearance: 'none',
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 8px center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '12px'
                        }}
                      >
                        {minutes.map(minute => (
                          <option key={minute} value={minute}>{minute.toString().padStart(2, '0')}</option>
                        ))}
                      </select>
                      
                      {/* AM/PM Select */}
                      <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value as 'AM' | 'PM')}
                        style={{
                          flex: 1,
                          borderRadius: '8px',
                          border: '1px solid #D1D5DB',
                          backgroundColor: '#F9FAFB',
                          padding: '8px 12px',
                          color: '#111827',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          outline: 'none',
                          appearance: 'none',
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 8px center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '12px'
                        }}
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label 
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '6px'
                      }}
                    >
                      Frequency
                    </label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      style={{
                        width: '100%',
                        borderRadius: '8px',
                        border: '1px solid #D1D5DB',
                        backgroundColor: '#F9FAFB',
                        padding: '12px 16px',
                        color: '#111827',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        outline: 'none',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 12px center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '16px'
                      }}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekdays">Weekdays</option>
                      <option value="weekends">Weekends</option>
                      <option value="weekly">Once a week</option>
                    </select>
                  </div>
                </div>

                {/* Custom Message */}
                <div>
                  <label 
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '6px'
                    }}
                  >
                    Custom Message
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Time for a mindful moment!"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    style={{
                      width: '100%',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: '#F9FAFB',
                      padding: '12px 16px',
                      color: '#111827',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#ef4399';
                      e.target.style.boxShadow = '0 0 0 3px rgba(239, 67, 153, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#D1D5DB';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Calendar Toggle */}
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRadius: '8px',
                    backgroundColor: '#F3F4F6',
                    padding: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Calendar style={{ width: '20px', height: '20px', color: '#7C3AED' }} />
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#6B46C1' }}>
                      Add to calendar
                    </span>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={addToCalendar}
                      onChange={(e) => setAddToCalendar(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <div 
                      style={{
                        position: 'relative',
                        width: '44px',
                        height: '24px',
                        backgroundColor: addToCalendar ? '#ef4399' : '#D1D5DB',
                        borderRadius: '12px',
                        transition: 'background-color 0.3s',
                        cursor: 'pointer'
                      }}
                    >
                      <div 
                        style={{
                          position: 'absolute',
                          top: '2px',
                          left: addToCalendar ? '22px' : '2px',
                          width: '20px',
                          height: '20px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          transition: 'left 0.3s',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                        }}
                      />
                    </div>
                  </label>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Main Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || submitSuccess}
                    style={{
                      width: '100%',
                      borderRadius: '8px',
                      backgroundColor: submitSuccess 
                        ? '#22c55e' 
                        : isSubmitting 
                          ? '#D1D5DB' 
                          : existingReminder ? '#3b82f6' : '#ef4399',
                      padding: '14px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'white',
                      border: 'none',
                      cursor: isSubmitting || submitSuccess ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting && !submitSuccess) {
                        if (existingReminder) {
                          e.currentTarget.style.backgroundColor = '#2563eb';
                        } else {
                          e.currentTarget.style.backgroundColor = '#db2777';
                        }
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting && !submitSuccess) {
                        if (existingReminder) {
                          e.currentTarget.style.backgroundColor = '#3b82f6';
                        } else {
                          e.currentTarget.style.backgroundColor = '#ef4399';
                        }
                      }
                    }}
                  >
                    {submitSuccess && <CheckCircle size={18} />}
                    {isSubmitting 
                      ? (existingReminder ? 'Updating Reminder...' : 'Setting Reminder...') 
                      : submitSuccess 
                        ? 'Reminder Set!' 
                        : existingReminder 
                          ? 'Update Reminder' 
                          : 'Set Reminder'
                    }
                  </button>

                  {/* Remove Reminder Button (only shown if reminder exists) */}
                  {existingReminder && (
                    <button
                      type="button"
                      onClick={deleteReminder}
                      style={{
                        width: '100%',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        padding: '12px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#ef4444',
                        border: '1px solid #ef4444',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fef2f2';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                      }}
                    >
                      Remove Reminder
                    </button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Animated Success Overlay */}
      {showSuccessOverlay && (
        <AnimatedSuccessOverlay onComplete={handleSuccessComplete} />
      )}

      {/* Error Alert */}
      {errorAlert && (
        <ErrorAlert
          title={errorAlert.title}
          message={errorAlert.message}
          onClose={closeError}
        />
      )}

      {/* CSS for spin animation */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default ReminderModal;