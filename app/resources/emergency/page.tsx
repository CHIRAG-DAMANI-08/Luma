"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import styles from "./styles.module.css";

export default function EmergencyResourcesPage() {
  // Use the same toast pattern as your other pages
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Add Material Symbols font if not already loaded
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

    const materialSymbols = addLink(
      "stylesheet",
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
    );

    return () => {
      if (materialSymbols) materialSymbols.remove();
    };
  }, []);

  // Function to handle number clicks
  const handleNumberClick = (phoneNumber: string, serviceName: string) => {
    // Check if it's a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Clean the phone number (remove spaces, dashes, etc.)
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
    
    if (isMobile) {
      // On mobile, open phone dialer
      window.location.href = `tel:${cleanNumber}`;
    } else {
      // On desktop, open WhatsApp Web
      const whatsappUrl = `https://wa.me/${cleanNumber}`;
      window.open(whatsappUrl, '_blank');
      
      // Show toast notification using your existing pattern
      setToast({ 
        message: `Opening ${serviceName} in WhatsApp...`, 
        type: 'success' 
      });
    }
  };

  // Toast component (same as your mood page)
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
        <div className={styles.header}>
          <span className={`${styles.headerIcon} material-symbols-outlined`}>
            health_and_safety
          </span>
          <h1 className={styles.title}>Emergency Resources - India</h1>
          <p className={styles.subtitle}>
            If you are in immediate danger, please call emergency services or go to the nearest hospital. Your safety is the priority.
          </p>
        </div>

        <div className={styles.sectionsContainer}>
          {/* National Helplines Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>National Helplines</h2>
            <div className={styles.nationalGrid}>
              <div className={styles.helplineCard}>
                <div>
                  <h3 className={styles.helplineTitle}>National Suicide Prevention Lifeline</h3>
                  <p className={styles.helplineAvailability}>Available 24/7</p>
                </div>
                <button 
                  className={styles.helplineNumber}
                  onClick={() => handleNumberClick("1-800-599-0019", "National Suicide Prevention Lifeline")}
                  aria-label="Call National Suicide Prevention Lifeline"
                >
                  1-800-599-0019
                </button>
              </div>
              <div className={styles.helplineCard}>
                <div>
                  <h3 className={styles.helplineTitle}>KIRAN Mental Health Helpline</h3>
                  <p className={styles.helplineAvailability}>Provided by the Government of India</p>
                </div>
                <button 
                  className={styles.helplineNumber}
                  onClick={() => handleNumberClick("1800-599-0019", "KIRAN Mental Health Helpline")}
                  aria-label="Call KIRAN Mental Health Helpline"
                >
                  1800-599-0019
                </button>
              </div>
            </div>
          </div>

          {/* Emergency Services Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Emergency Services</h2>
            <div className={styles.emergencyGrid}>
              <div className={styles.emergencyCard}>
                <h3 className={styles.emergencyTitle}>Police</h3>
                <button 
                  className={styles.emergencyNumber}
                  onClick={() => handleNumberClick("100", "Police")}
                  aria-label="Call Police"
                >
                  100
                </button>
              </div>
              <div className={styles.emergencyCard}>
                <h3 className={styles.emergencyTitle}>Ambulance</h3>
                <button 
                  className={styles.emergencyNumber}
                  onClick={() => handleNumberClick("102", "Ambulance")}
                  aria-label="Call Ambulance"
                >
                  102
                </button>
              </div>
              <div className={styles.emergencyCard}>
                <h3 className={styles.emergencyTitle}>National Emergency</h3>
                <button 
                  className={styles.emergencyNumber}
                  onClick={() => handleNumberClick("112", "National Emergency")}
                  aria-label="Call National Emergency"
                >
                  112
                </button>
              </div>
            </div>
          </div>

          {/* Other Resources Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Other Resources</h2>
            <div className={styles.resourcesList}>
              <div className={styles.resourceCard}>
                <div className={styles.resourceInfo}>
                  <h3 className={styles.resourceName}>Vandrevala Foundation</h3>
                  <p className={styles.resourceHours}>24/7 Mental Health Helpline</p>
                </div>
                <button 
                  className={styles.resourceNumber}
                  onClick={() => handleNumberClick("+91 9999 666 555", "Vandrevala Foundation")}
                  aria-label="Call Vandrevala Foundation"
                >
                  +91 9999 666 555
                </button>
              </div>
              <div className={styles.resourceCard}>
                <div className={styles.resourceInfo}>
                  <h3 className={styles.resourceName}>iCALL</h3>
                  <p className={styles.resourceHours}>Mon-Sat, 10 AM - 8 PM</p>
                </div>
                <button 
                  className={styles.resourceNumber}
                  onClick={() => handleNumberClick("022-25521111", "iCALL")}
                  aria-label="Call iCALL"
                >
                  022-25521111
                </button>
              </div>
              <div className={styles.resourceCard}>
                <div className={styles.resourceInfo}>
                  <h3 className={styles.resourceName}>AASRA</h3>
                  <p className={styles.resourceHours}>24/7 Suicide Prevention</p>
                </div>
                <button 
                  className={styles.resourceNumber}
                  onClick={() => handleNumberClick("+91-9820466726", "AASRA")}
                  aria-label="Call AASRA"
                >
                  +91-9820466726
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer Section */}
        <div className={styles.disclaimerSection}>
          <p className={styles.disclaimerText}>
            Luma is a supportive tool, not a substitute for professional medical advice or emergency services. Please prioritize your safety.
          </p>
        </div>
      </div>

      {/* Back to Dashboard Button */}
      <Link href="/dashboard" className={styles.backButton} aria-label="Back to dashboard">
        <span className={styles.backIcon}>←</span>
      </Link>
    </div>
  );
}