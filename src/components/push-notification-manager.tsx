'use client';

import { useEffect, useState, useCallback } from 'react';
import { Bell, BellOff, BellRing } from 'lucide-react';

type PushState = 'loading' | 'not-supported' | 'default' | 'granted' | 'denied' | 'subscribed';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager() {
  const [pushState, setPushState] = useState<PushState>('loading');
  const [isToggling, setIsToggling] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPushState('not-supported');
      return;
    }

    const permission = Notification.permission;
    if (permission === 'denied') {
      setPushState('denied');
      return;
    }

    if (permission === 'granted') {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setPushState(subscription ? 'subscribed' : 'granted');
      } catch {
        setPushState('granted');
      }
      return;
    }

    setPushState('default');
  }, []);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const subscribe = async () => {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.warn('VAPID public key not configured');
      return;
    }

    setIsToggling(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setPushState(permission === 'denied' ? 'denied' : 'default');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const keyArray = urlBase64ToUint8Array(vapidPublicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyArray.buffer as ArrayBuffer,
      });

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });

      if (response.ok) {
        setPushState('subscribed');
      } else {
        console.error('Failed to save subscription to server');
        setPushState('granted');
      }
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const unsubscribe = async () => {
    setIsToggling(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Remove from server
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        // Unsubscribe from browser
        await subscription.unsubscribe();
      }

      setPushState('granted');
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleClick = () => {
    if (pushState === 'subscribed') {
      unsubscribe();
    } else if (pushState === 'default' || pushState === 'granted') {
      subscribe();
    }
  };

  if (pushState === 'loading' || pushState === 'not-supported') {
    return null;
  }

  const getIcon = () => {
    switch (pushState) {
      case 'subscribed':
        return <BellRing className="h-5 w-5" />;
      case 'denied':
        return <BellOff className="h-5 w-5 text-muted-foreground" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getTitle = () => {
    switch (pushState) {
      case 'subscribed':
        return 'Push notifications enabled — click to disable';
      case 'denied':
        return 'Notifications blocked — enable in browser settings';
      default:
        return 'Enable push notifications';
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isToggling || pushState === 'denied'}
      title={getTitle()}
      className="relative inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      aria-label={getTitle()}
    >
      {getIcon()}
      {pushState === 'subscribed' && (
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-green-500" />
      )}
    </button>
  );
}
