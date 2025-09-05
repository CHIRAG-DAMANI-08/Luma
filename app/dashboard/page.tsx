"use client";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const { user } = useUser();
  const firstName = user?.firstName || "User";

  // inject Google fonts + Material Symbols if not present (keeps change local to this page)
  useEffect(() => {
    const addLink = (rel: string, href: string, crossOrigin = false) => {
      if (document.querySelector(`link[href="${href}"]`)) return null;
      const l = document.createElement("link");
      l.rel = rel;
      l.href = href;
      if (crossOrigin) l.crossOrigin = "";
      document.head.appendChild(l);
      return l;
    };

    const p1 = addLink("preconnect", "https://fonts.gstatic.com", true);
    const p2 = addLink(
      "stylesheet",
      "https://fonts.googleapis.com/css2?display=swap&family=Lexend:wght@400;500;700;900&family=Noto+Sans:wght@400;500;700;900"
    );
    const p3 = addLink(
      "stylesheet",
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
    );

    return () => {
      if (p1) p1.remove();
      if (p2) p2.remove();
      if (p3) p3.remove();
    };
  }, []);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.content}>
          {/* header */}
          <header className={styles.header}>
            <div className={styles.logoContainer}>
              <svg
                width="40"
                height="40"
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
              <h1 className={styles.logoText}>Luma</h1>
            </div>
          </header>

          {/* welcome */}
          <div className={styles.welcome}>
            <h2 className={styles.welcomeTitle}>Hello, {firstName}!</h2>
            <p className={styles.welcomeSubtitle}>What would you like to do today?</p>
          </div>

          {/* gradient chat card */}
          <div className={styles.chatCard}>
            <div className={styles.chatCardContent}>
              <div className={styles.chatCardText}>
                <h3 className={styles.chatCardTitle}>Chat with Luma</h3>
                <p className={styles.chatCardDescription}>
                  Your personal AI companion is here to listen and support you. Start a conversation anytime.
                </p>
              </div>

              <Link href="/chat" className={styles.chatButton}>
                <span>Start Chat</span>
                <span className={styles.arrowIcon} aria-hidden>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>

          {/* cards grid - icons use Material Symbols exactly like the reference */}
          <div className={styles.cardGrid}>
            <Link href="/profile" className={styles.card}>
              <div className={styles.iconPink}>
                <span className={`${styles.materialIcon} material-symbols-outlined`}>person</span>
              </div>
              <h3 className={styles.cardTitle}>Profile</h3>
              <p className={styles.cardDescription}>Manage your personal information.</p>
            </Link>

            <Link href="/resources" className={styles.card}>
              <div className={styles.iconPurple}>
                <span className={`${styles.materialIcon} material-symbols-outlined`} style={{ color: "rgb(124, 58, 237)" }}>
                  bookmarks
                </span>
              </div>
              <h3 className={styles.cardTitle}>Resources</h3>
              <p className={styles.cardDescription}>Access helpful articles and tools.</p>
            </Link>

            <Link href="/journal" className={styles.card}>
              <div className={styles.iconPink}>
                <span className={`${styles.materialIcon} material-symbols-outlined`}>edit_note</span>
              </div>
              <h3 className={styles.cardTitle}>Journaling</h3>
              <p className={styles.cardDescription}>Reflect on your thoughts and feelings.</p>
            </Link>

            <Link href="/mood-tracking" className={styles.card}>
              <div className={styles.iconPurple}>
                <span className={`${styles.materialIcon} material-symbols-outlined`} style={{ color: "rgb(124, 58, 237)" }}>
                  sentiment_satisfied
                </span>
              </div>
              <h3 className={styles.cardTitle}>Mood Tracking</h3>
              <p className={styles.cardDescription}>Monitor your emotional well-being.</p>
            </Link>

            <Link href="/resources/emergency" className={styles.card}>
              <div className={styles.iconPink}>
                <span className={`${styles.materialIcon} material-symbols-outlined`}>emergency</span>
              </div>
              <h3 className={styles.cardTitle}>Emergency Resources</h3>
              <p className={styles.cardDescription}>Find immediate help and support.</p>
            </Link>

            <Link href="/goals" className={styles.card}>
              <div className={styles.iconPurple}>
                <span className={`${styles.materialIcon} material-symbols-outlined`} style={{ color: "rgb(124, 58, 237)" }}>
                  flag
                </span>
              </div>
              <h3 className={styles.cardTitle}>Goals</h3>
              <p className={styles.cardDescription}>Set and track personal goals.</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
