"use client";

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import styles from '../app/dashboard/dashboard.module.css';

// Define the props to include a fallback component
interface ProactiveCheckinProps {
  fallback: ReactNode;
}

export default function ProactiveCheckin({ fallback }: ProactiveCheckinProps) {
  const [checkIn, setCheckIn] = useState<{ message: string; sessionId: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCheckIn = async () => {
      try {
        const response = await fetch('/api/chat/proactive-checkin', {
          method: 'POST',
        });

        // If response is not OK and not a "duplicate" case, treat as an error state.
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (!errorData.message?.includes("already exists")) {
             throw new Error('Failed to fetch check-in');
          }
          // If it's a duplicate, we'll just proceed to the fallback.
          return;
        }

        const data = await response.json();
        if (data.checkInMessage && data.sessionId) {
          setCheckIn({ message: data.checkInMessage, sessionId: data.sessionId });
        }
      } catch (err) {
        console.error("Error fetching proactive check-in:", err);
        // In case of error, we will rely on the fallback.
      } finally {
        setIsLoading(false);
      }
    };

    fetchCheckIn();
  }, []);

  if (isLoading) {
    // Render a skeleton loader while fetching
    return (
      <div className={styles.chatCard} style={{ minHeight: '130px', alignItems: 'center' }}>
        <div style={{ width: '100%' }}>
          <div style={{ height: '20px', backgroundColor: '#e0e0e0', borderRadius: '4px', width: '50%', marginBottom: '10px' }}></div>
          <div style={{ height: '16px', backgroundColor: '#e0e0e0', borderRadius: '4px', width: '80%' }}></div>
        </div>
      </div>
    );
  }

  if (!checkIn) {
    // If no check-in was fetched, render the fallback component
    return <>{fallback}</>;
  }

  // If a check-in exists, render the proactive message card
  return (
    <div className={styles.chatCard}>
      <div className={styles.chatCardContent}>
        <div className={styles.chatCardText}>
          <h3 className={styles.chatCardTitle}>A message from Luma</h3>
          <p className={styles.chatCardDescription}>
            {checkIn.message}
          </p>
        </div>
        <Link href={`/chat?sessionId=${checkIn.sessionId}`} className={styles.chatButton}>
          <span>Continue Chat</span>
          <span className={styles.arrowIcon} aria-hidden>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </Link>
      </div>
    </div>
  );
}
