"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./reminder.module.css";

interface Goal {
  id: number;
  text: string;
  category: "short-term" | "long-term";
}

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
  onSet?: (payload: {
    goal: string;
    time: string;
    frequency: string;
    message: string;
    addToCalendar: boolean;
  }) => void;
}

const AnimatedSuccessOverlay = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onComplete, 900);
    return () => clearTimeout(t);
  }, [onComplete]);
  return (
    <div className={styles.successOverlay} aria-hidden>
      <div className={styles.successCheck}>✓</div>
    </div>
  );
};

const ErrorAlert = ({ title, message, onClose }: { title: string; message: string; onClose: () => void }) => (
  <div className={styles.errorAlert} role="alert">
    <strong>{title}</strong>
    <div>{message}</div>
    <button onClick={onClose} className={styles.errorClose}>Close</button>
  </div>
);

const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose, goal, onSet }) => {
  const [selectedGoalText, setSelectedGoalText] = useState<string>(goal?.text ?? "Practice mindfulness meditation");
  const [time, setTime] = useState<string>("09:00");
  const [frequency, setFrequency] = useState<string>("Daily");
  const [message, setMessage] = useState<string>("Time for a mindful moment!");
  const [addToCalendar, setAddToCalendar] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const firstInputRef = useRef<HTMLSelectElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedGoalText(goal?.text ?? selectedGoalText);
      // focus first input after open
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [isOpen, goal]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Optional: ask for notification permission (no OneSignal)
    try {
      if ("Notification" in window && Notification.permission !== "granted") {
        // request permission but do not block if denied
        await Notification.requestPermission();
      }
    } catch (err) {
      // ignore permission errors
    }

    const payload = {
      goal: selectedGoalText,
      time,
      frequency,
      message,
      addToCalendar,
    };

    try {
      // call optional onSet callback (Goals page may handle persistence / scheduling)
      onSet?.(payload);

      // show success overlay and close after animation
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 900);
    } catch (err) {
      setError({ title: "Failed", message: "Unable to set reminder. Try again." });
    }
  };

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label="Set reminder">
      <div className={styles.modal}>
        <button className={styles.closeBtn} aria-label="Close reminder" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <svg className={styles.icon} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fillRule="evenodd"/>
            </svg>
          </div>
          <h2 className={styles.title}>Set a Goal Reminder</h2>
          <p className={styles.subtitle}>Stay on track with your mental wellness goals.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            <span className={styles.label}>Goal</span>
            <select
              id="reminder-goal"
              ref={firstInputRef}
              className={styles.select}
              value={selectedGoalText}
              onChange={(e) => setSelectedGoalText(e.target.value)}
            >
              <option>Practice mindfulness meditation</option>
              <option>Journal for 10 minutes</option>
              <option>Go for a walk</option>
              <option>Connect with a friend</option>
              {goal && <option key={goal.id}>{goal.text}</option>}
            </select>
          </label>

          <div className={styles.row}>
            <label>
              <span className={styles.label}>Time</span>
              <input className={styles.input} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </label>

            <label>
              <span className={styles.label}>Frequency</span>
              <select className={styles.select} value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                <option>Daily</option>
                <option>Weekdays</option>
                <option>Weekends</option>
                <option>Once a week</option>
              </select>
            </label>
          </div>

          <label>
            <span className={styles.label}>Custom Message</span>
            <input className={styles.input} type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="e.g., Time for a mindful moment!" />
          </label>

          <div className={styles.panel}>
            <div className={styles.panelLeft}>
              <span className="material-symbols-outlined">calendar_month</span>
              <span className={styles.panelText}>Add to calendar</span>
            </div>
            <label className={styles.switch}>
              <input type="checkbox" checked={addToCalendar} onChange={(e) => setAddToCalendar(e.target.checked)} />
              <span className={styles.slider}></span>
            </label>
          </div>

          {error && <ErrorAlert title={error.title} message={error.message} onClose={() => setError(null)} />}

          <div className={styles.actions}>
            <button type="submit" className={styles.primary}>Set Reminder</button>
          </div>
        </form>

        {showSuccess && <AnimatedSuccessOverlay onComplete={() => {}} />}
      </div>
    </div>
  );
};

export default ReminderModal;