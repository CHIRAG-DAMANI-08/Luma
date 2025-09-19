# Luma - Mental Wellness App Documentation

## Mood Tracking Page - Implementation Documentation

### Overview of Changes
We've made several improvements to the mood tracking page to enhance its appearance, usability, and responsiveness:

1. **Fixed Container Issues**: Removed the blue/green outer border by using fixed positioning and z-index
2. **Centered Content**: Aligned all elements centrally for better visual balance
3. **Color Scheme Adjustments**: Changed card backgrounds to white for a cleaner look
4. **Spacing Improvements**: Adjusted margins and paddings for better visual hierarchy
5. **Added Navigation**: Implemented a back-to-dashboard button and user profile icon
6. **Responsive Design**: Ensured the page works well on various screen sizes
7. **Improved Form Elements**: Enhanced textarea and buttons for better user experience

### Style Details

#### Container & Layout
- Full viewport container with fixed positioning (100vw × 100vh)
- Light pink background (#f6e6ee)
- High z-index (9999) to ensure content displays over any other elements
- Content wrapper with 800px max-width for readability

#### Cards & Content Areas
- White background for all cards
- 24px border radius for rounded corners
- Subtle shadows for depth (0 4px 12px rgba(0, 0, 0, 0.05))
- Centered content alignment
- 32px margin between major sections

#### Input Elements
- Textarea:
  - Width: 100% with 600px max-width
  - Light pink background (#FFF6FA) with focus state
  - 150px minimum height
  - 24px border radius
  
- Factor Buttons:
  - Horizontally centered with 12px gap
  - Color-coded selected states (purple for Work, pink for Relationships, etc.)
  - Border radius: 9999px (pill shape)
  - Hover and selected animations

#### Navigation Elements
- User Button:
  - Position: Top-right (16px from top, 20px from right)
  - Uses Clerk's UserButton component
  
- Back Button:
  - Position: Bottom-left (24px from bottom, 24px from left)
  - Grey circular button (#6b7280)
  - Arrow icon ("←")
  - Hover effect (darker grey + slight elevation)

#### Chart Section
- White background card
- 700px maximum width
- 200px fixed height for the chart area
- Day labels properly spaced and centered
- Color-coded bars for different mood states

#### Responsive Adjustments
- Mood grid: 3 columns on mobile, 6 columns on desktop (640px breakpoint)
- Smaller back button on mobile (40px vs 48px)
- Adjusted padding and margins for smaller screens

---

## Goals Page - Free Reminder System Implementation

### Overview
Enhanced the goals page with a comprehensive reminder system using **GitHub Actions for FREE background notifications** instead of paid Firebase Functions. This provides reliable notifications even when the app is closed without any subscription costs.

### Free Notification Architecture

#### 1. GitHub Actions Scheduler (FREE)
```yaml
# .github/workflows/check-reminders.yml
name: Check Reminders
on:
  schedule:
    - cron: '* * * * *'  # Every minute
  workflow_dispatch:

jobs:
  check-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Check and Send Reminders
        run: |
          curl -X POST https://your-app-domain.vercel.app/api/reminders/check \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

#### 2. Reminder Checker API Endpoint
```typescript
// /api/reminders/check/route.ts
export async function POST(req: NextRequest) {
  // Verify request is from GitHub Actions
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentDay = now.getDay();
  
  // Check database for due reminders
  const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
  
  const activeReminders = await prisma.reminder.findMany({
    where: { isActive: true, time: timeString },
    include: { user: { select: { fcmToken: true, name: true } } }
  });

  // Send FCM notifications for due reminders
  for (const reminder of activeReminders) {
    if (shouldSendToday(reminder.frequency, currentDay) && reminder.user?.fcmToken) {
      await sendFCMNotification(reminder.user.fcmToken, reminder);
    }
  }
}
```

#### 3. Firebase Admin SDK Integration (Client-only)
```typescript
// lib/firebase.ts - Client-side only, no paid functions
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const app = initializeApp(firebaseConfig);
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

// Direct FCM HTTP API calls (no Firebase Functions needed)
async function sendFCMNotification(fcmToken: string, reminder: any) {
  const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        token: fcmToken,
        notification: {
          title: '🎯 Goal Reminder',
          body: reminder.customMessage || `Time for: ${reminder.goalText}`,
        },
        webpush: {
          fcmOptions: { link: `${process.env.NEXT_PUBLIC_APP_URL}/goals` }
        }
      }
    })
  });
}
```

#### 4. Service Worker for Background Notifications
```javascript
// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages when app is closed
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || '🎯 Luma Reminder';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'goal-reminder',
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'View Goal' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

### Key Features Implemented

#### 1. Reminder Modal System
- **Dynamic Modal Header**: Changes between "Set a Goal Reminder" and "Edit Goal Reminder" based on existing reminder status
- **Icon State Management**: Shows checkmark icon (green) for existing reminders, star icon (pink) for new reminders
- **Form Pre-population**: Automatically loads existing reminder data when editing

#### 2. Reminder Status Detection
- **API Integration**: `GET /api/reminders?goalId={id}` to check existing reminders
- **Real-time Status Updates**: Refreshes reminder status after modal interactions
- **Visual Feedback**: Button text changes from "Remind Me" to "Reminder Set ✓" with green styling

#### 3. Advanced Time Selection
- **12-Hour Format**: Hour (1-12), minute (00, 15, 30, 45), AM/PM dropdowns
- **Frequency Options**: Daily, Weekdays, Weekends, Once a week
- **Custom Messages**: Optional personalized reminder text
- **Calendar Integration**: Toggle to add reminders to calendar

#### 4. Animated Success Experience
```tsx
// Success Overlay Animation Sequence:
// 1. White background overlay (0.1s)
// 2. Animated green checkmark with bounce (0.8s)
// 3. "Reminder Created!" text fade-in (1.2s)
// 4. Auto-close after 2.5s
```

#### 5. Database Operations
- **Upsert Logic**: Updates existing reminders instead of creating duplicates
- **Soft Delete**: Sets `isActive: false` when removing reminders
- **User Association**: Links reminders to Clerk user IDs through Prisma relations

### API Endpoints

#### POST /api/reminders
```typescript
// Creates new or updates existing reminder
{
  userId: string,
  goalId: string,
  goalText: string,
  reminder: {
    frequency: string,
    time: string, // 24-hour format (HH:MM)
    customMessage: string,
    addToCalendar: boolean
  }
}
```

#### GET /api/reminders?goalId={id}
```typescript
// Returns existing reminder status
{
  exists: boolean,
  reminder: ExistingReminder | null
}
```

#### DELETE /api/reminders
```typescript
// Soft deletes reminder
{
  goalId: string
}
```

#### POST /api/reminders/check (GitHub Actions Only)
```typescript
// Called by GitHub Actions every minute
// Checks for due reminders and sends FCM notifications
{
  success: boolean,
  checked: number,
  time: string
}
```

### Component Architecture

#### ReminderModal Component Structure
```
ReminderModal
├── AnimatedSuccessOverlay
│   ├── Animated Checkmark (bounce effect)
│   └── Success Text (fade-in)
├── ErrorAlert (minimal error display)
├── Form Elements
│   ├── Time Picker (3-dropdown system)
│   ├── Frequency Selector
│   ├── Custom Message Input
│   └── Calendar Toggle
└── Action Buttons
    ├── Set/Update Reminder Button
    └── Remove Reminder Button (conditional)
```

### Free Firebase Integration
- **FCM Tokens**: Registered through `/api/fcm/register` endpoint
- **Permission Handling**: Requests notification permissions before setting reminders
- **Service Account**: Uses Firebase service account for server-side FCM API calls
- **No Paid Features**: Only uses free Firebase messaging, no Functions or Firestore rules

### Environment Variables Required
```env
# GitHub Actions Secret
CRON_SECRET=your-random-secret-key-here

# Firebase Service Account (for FCM API)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Firebase Client Config
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_VAPID_API_KEY=your-vapid-key
```

### Visual Design Patterns

#### Button States
```css
/* Default State */
background: #ef4399 (pink)
text: "Remind Me"

/* Reminder Exists */
background: #22c55e (green)
text: "Reminder Set ✓"
icon: CheckCircle

/* Update Mode */
background: #3b82f6 (blue)
text: "Update Reminder"
```

#### Success Animation
```css
/* Checkmark Container */
width: 80px, height: 80px
background: #22c55e
border-radius: 50%
transform: scale(0) → scale(1)
transition: cubic-bezier(0.68, -0.55, 0.265, 1.55)

/* Text Animation */
opacity: 0 → 1
transform: translateY(20px) → translateY(0)
```

### Error Handling
- **Permission Denied**: Shows error alert requesting notification permissions
- **API Failures**: Displays user-friendly error messages
- **Network Issues**: Graceful degradation with retry suggestions
- **GitHub Actions Auth**: Verifies CRON_SECRET to prevent unauthorized access

### Database Schema Updates
```prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  email     String   @unique
  name      String?
  fcmToken  String?  // Added for push notifications
  reminders Reminder[] // New relation
}

model Reminder {
  id            String   @id @default(cuid())
  userId        String
  goalId        String
  goalText      String
  frequency     String
  time          String
  customMessage String?
  addToCalendar Boolean  @default(false)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  user          User     @relation(fields: [userId], references: [id])
  
  @@unique([userId, goalId])
}
```

### Free vs Paid Comparison

#### What We Avoided (Paid)
- ❌ Firebase Functions (requires Blaze plan)
- ❌ Firestore scheduled functions
- ❌ Google Cloud Functions
- ❌ Third-party cron services

#### What We Used (Free)
- ✅ GitHub Actions (2,000 minutes/month free)
- ✅ Firebase messaging (free tier)
- ✅ Vercel API routes (hobby plan)
- ✅ Direct FCM HTTP API calls
- ✅ Browser service workers

### Benefits of This Architecture
1. **Completely Free**: No subscription costs
2. **Reliable**: GitHub's infrastructure handles scheduling
3. **Works When Closed**: True background notifications
4. **Scalable**: Handles unlimited users
5. **No Server Maintenance**: Serverless architecture
6. **Cross-Platform**: Works on all devices with FCM

---

## CSS Organization & Styling Patterns

### Global Styles
- **Color Scheme**: Light pink theme (#f6e6ee background)
- **Typography**: 'Plus Jakarta Sans' font family
- **Border Radius**: Consistent 8px-16px rounded corners
- **Shadows**: Subtle depth with rgba(0,0,0,0.05-0.25) shadows

### Component Styling Approach
- **Inline Styles**: Used for dynamic states and component isolation
- **CSS Modules**: For page-level styling and layouts
- **Responsive Design**: Mobile-first approach with 640px breakpoint

### Animation Standards
- **Transitions**: 0.2-0.3s ease for interactive elements
- **Hover Effects**: Subtle color changes and elevation
- **Success States**: Bounce and fade animations for positive feedback

### Implementation Details
- **Z-index Management**: Success overlay (10001) > Error alerts (10000) > Modals (9999)
- **Accessibility**: Proper contrast ratios and keyboard navigation
- **Performance**: Optimized animations with CSS transforms
- **Cross-browser**: Compatible styling without vendor prefixes needed

## Motivations System - Social Goal Support

### Overview
Implemented a social motivation system that allows friends and family to send encouragement messages for shared goals, enhancing user engagement and support networks.

### Key Features

#### 1. Goal Sharing System
- **Shareable Links**: Generate unique URLs for each goal with progress data
- **Web Share API**: Native sharing on supported devices
- **Email Integration**: Direct email sharing with pre-filled content
- **Anonymous Support**: External users can send motivation without accounts

#### 2. Motivation Sending
```typescript
// API endpoint for sending motivations
POST /api/motivations/send
{
  goalText: string,
  senderName: string,
  note: string,
  receiverId: string (Clerk user ID)
}
```

#### 3. Motivation Display
- **Auto-refresh**: Checks for new motivations every 30 seconds
- **Toast Notifications**: Shows when new motivation is received
- **Cards Layout**: Beautiful display of supporter messages
- **Real-time Updates**: URL parameter triggers immediate refresh

#### 4. Database Schema
```prisma
model Motivation {
  id         String   @id @default(cuid())
  userId     String   // Receiver
  senderName String   // Supporter's name
  note       String?  // Optional message
  goalText   String   // Associated goal
  createdAt  DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id])
}
```

### Social Features
- **Public Goal Pages**: Accessible without login
- **Motivation Forms**: Simple name + message input
- **Success Feedback**: Animated confirmations for sent motivations
- **Privacy Friendly**: Only shares what user explicitly allows

## Technical Implementation Notes

### Service Worker Registration
```tsx
// components/ServiceWorkerRegistration.tsx
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then((registration) => {
        console.log('🔧 Service Worker registered successfully');
      });
  }
}, []);
```

### FCM Token Management
```typescript
// hooks/useFCM.ts
export const useFCM = () => {
  const requestPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: vapidKey });
      // Register token with backend
      await fetch('/api/fcm/register', {
        method: 'POST',
        body: JSON.stringify({ fcmToken: token })
      });
    }
  };
};
```

### Deployment Steps for Free Notifications

#### 1. Setup GitHub Secrets
- Go to GitHub repository → Settings → Secrets
- Add `CRON_SECRET` with a random secure key

#### 2. Deploy Firebase Service Account
- Download service account JSON from Firebase Console
- Extract credentials to environment variables
- Add to Vercel environment variables

#### 3. Configure Vercel Environment
```env
CRON_SECRET=your-secret-key
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=service-account-email
FIREBASE_PRIVATE_KEY=private-key-content
```

#### 4. Test Reminder System
```bash
# Test the reminder checker endpoint
curl -X POST https://your-app.vercel.app/api/reminders/check \
  -H "Authorization: Bearer your-secret-key"
```

This architecture provides enterprise-level reminder functionality completely free, leveraging GitHub Actions' generous free tier and Firebase's free messaging service.