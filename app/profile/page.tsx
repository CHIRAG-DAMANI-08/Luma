// /app/edit-profile/page.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';
import { useUser, useClerk } from "@clerk/nextjs";

const ProfilePage = () => {
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user signed in with Google
  const isGoogleUser = user?.externalAccounts?.some(
    (acc) => String(acc.provider) === "oauth_google"
  );

  // Check if user can reset password (email/password sign-in)
  const canResetPassword = user?.passwordEnabled;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [moodReminders, setMoodReminders] = useState(true);
  const [generalNotifications, setGeneralNotifications] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState(true);
  const [meditationGoal, setMeditationGoal] = useState('5 days a week');
  const [audioQuality, setAudioQuality] = useState('Standard (Recommended)');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const [uploading, setUploading] = useState(false);

  // Fetch user profile data
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setFirstName(data.firstName || user?.firstName || '');
          setLastName(data.lastName || user?.lastName || '');
          setEmail(data.email || user?.emailAddresses?.[0]?.emailAddress || '');
          setProfileImage(data.profileImage || user?.imageUrl || '');
          setMeditationGoal(data.meditationGoal || '5 days a week');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
      setLoading(false);
    }
    fetchProfile();
  }, [user]);

  // Handle profile image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/profile/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfileImage(data.imageUrl);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle update
  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);
    
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          meditationGoal,
          profileImage,
        }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const triggerFileInput = () => {
    if (!isGoogleUser) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className="text-center mb-8">
          <h2 className={styles.pageTitle}>Edit Your Profile</h2>
          <p className={styles.pageSubtitle}>Manage your account and mental health preferences.</p>
        </div>

        <form className="space-y-6" onSubmit={handleUpdate}>
          {/* Avatar section */}
          <div className={styles.avatarRow}>
            <div className={styles.avatarWrap}>
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className={styles.avatarImage}
                />
              ) : (
                <span className={styles.avatarInitial}>
                  {firstName ? firstName.charAt(0).toUpperCase() : 'A'}
                </span>
              )}
              
              {/* Only show edit button for non-Google users */}
              {!isGoogleUser && (
                <button 
                  className={styles.avatarEditBtn} 
                  type="button" 
                  aria-label="Edit photo"
                  onClick={triggerFileInput}
                  disabled={uploading}
                >
                  {uploading ? (
                    <div className={styles.spinner}></div>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  )}
                </button>
              )}
              
              {/* Hidden file input */}
              {!isGoogleUser && (
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              )}
            </div>
            <div>
              <h3 className={styles.avatarTitle}>Update your photo</h3>
              <p className={styles.avatarDesc}>
                {isGoogleUser 
                  ? "Your photo is synced from Google and cannot be changed here."
                  : "Click on the image to change your profile picture."
                }
              </p>
            </div>
          </div>

          {/* Name fields */}
          <div className={styles.formGrid}>
            <div className={styles.formRow}>
              <label className={styles.formLabel} htmlFor="first-name">First Name</label>
              <input 
                className={styles.formInput} 
                id="first-name" 
                type="text" 
                value={firstName} 
                onChange={e => setFirstName(e.target.value)} 
                placeholder="Alex"
              />
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel} htmlFor="last-name">Last Name</label>
              <input 
                className={styles.formInput} 
                id="last-name" 
                type="text" 
                value={lastName} 
                onChange={e => setLastName(e.target.value)} 
                placeholder="Doe"
              />
            </div>
          </div>

          {/* Email field */}
          <div className={`${styles.formRow} ${styles.fullWidth}`}>
            <label className={styles.formLabel} htmlFor="email">Email address</label>
            <input 
              className={styles.formInput} 
              id="email" 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="alex.doe@example.com"
              disabled={isGoogleUser}
            />
          </div>

          {/* Reset password - only for non-Google users */}
          {canResetPassword && !isGoogleUser && (
            <div className={styles.fullWidth}>
              <button type="button" className={styles.resetPassword}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                </svg>
                Reset Password
              </button>
            </div>
          )}

          {/* Mental Health Preferences */}
          <div className="pt-6">
            <h3 className={styles.sectionTitle}>Mental Health Preferences</h3>
            
            <div className={styles.preferenceItem}>
              <div>
                <p className={styles.preferenceLabel}>Daily mood check-in reminders</p>
                <p className={styles.preferenceDesc}>Receive a notification to log your mood.</p>
              </div>
              <label className={styles.toggleContainer} htmlFor="mood-reminders">
                <input 
                  checked={moodReminders} 
                  className="sr-only" 
                  id="mood-reminders" 
                  type="checkbox" 
                  onChange={() => setMoodReminders(!moodReminders)} 
                />
                <div className={`${styles.toggleSwitch} ${moodReminders ? styles.toggleSwitchChecked : ''}`}>
                  <div className={`${styles.toggleSwitchCircle} ${moodReminders ? styles.toggleSwitchCircleChecked : ''}`}></div>
                </div>
              </label>
            </div>

            <div className={styles.formRow}>
              <label className={styles.formLabel} htmlFor="meditation-goal">Weekly Meditation Goal</label>
              <select 
                className={styles.select} 
                id="meditation-goal" 
                value={meditationGoal} 
                onChange={e => setMeditationGoal(e.target.value)}
              >
                <option>5 days a week</option>
                <option>3 days a week</option>
                <option>Every day</option>
                <option>As needed</option>
              </select>
            </div>

            <div className={styles.preferenceItem}>
              <div>
                <p className={styles.preferenceLabel}>General Notifications</p>
                <p className={styles.preferenceDesc}>For new features and recommendations.</p>
              </div>
              <label className={styles.toggleContainer} htmlFor="general-notifications">
                <input 
                  checked={generalNotifications} 
                  className="sr-only" 
                  id="general-notifications" 
                  type="checkbox" 
                  onChange={() => setGeneralNotifications(!generalNotifications)} 
                />
                <div className={`${styles.toggleSwitch} ${generalNotifications ? styles.toggleSwitchChecked : ''}`}>
                  <div className={`${styles.toggleSwitchCircle} ${generalNotifications ? styles.toggleSwitchCircleChecked : ''}`}></div>
                </div>
              </label>
            </div>
          </div>

          {/* Voice Message Settings */}
          <div className="pt-6">
            <h3 className={styles.sectionTitle}>Voice Message Settings</h3>
            
            <div className={styles.preferenceItem}>
              <div>
                <p className={styles.preferenceLabel}>Enable Voice Recording</p>
                <p className={styles.preferenceDesc}>Allow Luma to record voice messages.</p>
              </div>
              <label className={styles.toggleContainer} htmlFor="voice-recording">
                <input 
                  checked={voiceRecording} 
                  className="sr-only" 
                  id="voice-recording" 
                  type="checkbox" 
                  onChange={() => setVoiceRecording(!voiceRecording)} 
                />
                <div className={`${styles.toggleSwitch} ${voiceRecording ? styles.toggleSwitchChecked : ''}`}>
                  <div className={`${styles.toggleSwitchCircle} ${voiceRecording ? styles.toggleSwitchCircleChecked : ''}`}></div>
                </div>
              </label>
            </div>

            <div className={styles.formRow}>
              <label className={styles.formLabel} htmlFor="audio-quality">Audio Quality</label>
              <select 
                className={styles.select} 
                id="audio-quality" 
                value={audioQuality} 
                onChange={e => setAudioQuality(e.target.value)}
              >
                <option>Standard (Recommended)</option>
                <option>High</option>
                <option>Low (for slower connections)</option>
              </select>
            </div>
          </div>

          {/* Save button */}
          <div>
            <button className={styles.btnPrimary} type="submit" disabled={loading || uploading}>
              {loading || uploading ? 'Loading...' : 'Save Changes'}
            </button>
            {success && <p className={styles.successMessage}>Profile updated successfully!</p>}
          </div>
        </form>

        <div className="text-center mt-6">
          <a href="/dashboard" className={styles.backLink}>Back to App</a>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;