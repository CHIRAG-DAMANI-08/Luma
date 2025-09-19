import { useState, useEffect } from 'react';

declare global {
  interface Window {
    OneSignal: {
      initialized: boolean;
      init: (options: any) => Promise<void>;
      getUserId: () => Promise<string | null>;
      showSlidedownPrompt: () => Promise<void>;
      registerForPushNotifications: () => Promise<void>;
      setExternalUserId: (id: string) => Promise<void>;
      isPushNotificationsEnabled: () => Promise<boolean>;
    };
    OneSignalDeferred: Array<(oneSignal: any) => void>;
  }
}

interface OneSignalState {
  permission: NotificationPermission;
  playerId: string | null;
  isInitialized: boolean;
}

export const useOneSignal = () => {
  const [state, setState] = useState<OneSignalState>({
    permission: 'default',
    playerId: null,
    isInitialized: false
  });

  // Initialize OneSignal and check permission status
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkInitialization = setInterval(() => {
      if (window.OneSignal && window.OneSignal.initialized) {
        clearInterval(checkInitialization);
        
        // Get current permission state
        const permissionState = Notification.permission as NotificationPermission;
        
        // Get OneSignal player ID if available
        window.OneSignal.getUserId().then((playerId: string | null) => {
          setState({
            permission: permissionState,
            playerId,
            isInitialized: true
          });
        });
      }
    }, 500);

    return () => clearInterval(checkInitialization);
  }, []);

  // Function to request permission and register user
  const requestPermission = async (): Promise<boolean> => {
    if (!window.OneSignal || !window.OneSignal.initialized) {
      console.error('OneSignal not initialized');
      return false;
    }

    try {
      // Request notification permission
      await window.OneSignal.showSlidedownPrompt();
      
      // Get permission result
      const permissionResult = Notification.permission;
      
      if (permissionResult === 'granted') {
        // Get OneSignal player ID
        const playerId = await window.OneSignal.getUserId();
        
        if (playerId) {
          // Register player ID with backend
          await registerPlayerIdWithBackend(playerId);
          
          setState({
            permission: 'granted',
            playerId,
            isInitialized: true
          });
          
          return true;
        }
      }
      
      setState({
        ...state,
        permission: permissionResult as NotificationPermission
      });
      
      return permissionResult === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  // Register OneSignal player ID with backend
  const registerPlayerIdWithBackend = async (playerId: string) => {
    try {
      await fetch('/api/onesignal/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ playerId })
      });
    } catch (error) {
      console.error('Error registering player ID with backend:', error);
    }
  };

  // Function to send a test notification
  const sendTestNotification = async (message: string): Promise<boolean> => {
    try {
      if (!state.playerId) {
        throw new Error('No player ID available');
      }
      
      const response = await fetch('/api/onesignal/send-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          playerId: state.playerId,
          message
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send test notification');
      }
      
      return true;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  };

  return {
    ...state,
    requestPermission,
    sendTestNotification
  };
};