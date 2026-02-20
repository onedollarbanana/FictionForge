'use client';

import { useEffect, useState, useCallback } from 'react';
import { Bell, BellOff, BellRing, Send } from 'lucide-react';

type PushStatus = 'loading' | 'not-supported' | 'default' | 'granted' | 'denied' | 'subscribed';

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

export function NotificationSettings() {
  const [pushStatus, setPushStatus] = useState<PushStatus>('loading');
  const [isToggling, setIsToggling] = useState(false);
  const [testSent, setTestSent] = useState(false);

  const checkPushStatus = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPushStatus('not-supported');
      return;
    }

    const permission = Notification.permission;
    if (permission === 'denied') {
      setPushStatus('denied');
      return;
    }

    if (permission === 'granted') {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setPushStatus(subscription ? 'subscribed' : 'granted');
      } catch {
        setPushStatus('granted');
      }
      return;
    }

    setPushStatus('default');
  }, []);

  useEffect(() => {
    checkPushStatus();
  }, [checkPushStatus]);

  const enablePush = async () => {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.warn('VAPID public key not configured');
      return;
    }

    setIsToggling(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setPushStatus(permission === 'denied' ? 'denied' : 'default');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });

      if (response.ok) {
        setPushStatus('subscribed');
      }
    } catch (error) {
      console.error('Failed to enable push:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const disablePush = async () => {
    setIsToggling(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }

      setPushStatus('granted');
    } catch (error) {
      console.error('Failed to disable push:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const sendTestNotification = async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification('FictionForge', {
        body: 'Push notifications are working! 🎉',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
      });
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
  };

  const getStatusIcon = () => {
    switch (pushStatus) {
      case 'subscribed':
        return <BellRing className="h-5 w-5 text-green-500" />;
      case 'denied':
        return <BellOff className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (pushStatus) {
      case 'loading':
        return 'Checking notification status...';
      case 'not-supported':
        return 'Push notifications are not supported in this browser.';
      case 'subscribed':
        return 'Push notifications are enabled.';
      case 'denied':
        return 'Notifications are blocked. Please enable them in your browser settings.';
      case 'granted':
        return 'Notifications are allowed but not active.';
      default:
        return 'Enable push notifications to get alerts for new chapters.';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Push Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Get notified when stories you follow publish new chapters.
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <p className="text-sm font-medium">Browser Push Notifications</p>
              <p className="text-xs text-muted-foreground">{getStatusText()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pushStatus === 'subscribed' && (
              <button
                onClick={sendTestNotification}
                disabled={testSent}
                className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                {testSent ? 'Sent!' : 'Test'}
              </button>
            )}

            {(pushStatus === 'default' || pushStatus === 'granted') && (
              <button
                onClick={enablePush}
                disabled={isToggling}
                className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {isToggling ? 'Enabling...' : 'Enable'}
              </button>
            )}

            {pushStatus === 'subscribed' && (
              <button
                onClick={disablePush}
                disabled={isToggling}
                className="inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent disabled:opacity-50"
              >
                {isToggling ? 'Disabling...' : 'Disable'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">Notification Types</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">New Chapters</p>
              <p className="text-xs text-muted-foreground">
                When a story you follow publishes a new chapter
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              Managed per story via the Follow button
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Comment Replies</p>
              <p className="text-xs text-muted-foreground">
                When someone replies to your comment
              </p>
            </div>
            <div className="text-xs text-muted-foreground">Coming soon</div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Achievements</p>
              <p className="text-xs text-muted-foreground">
                When you earn a new achievement or badge
              </p>
            </div>
            <div className="text-xs text-muted-foreground">Coming soon</div>
          </div>
        </div>
      </div>
    </div>
  );
}
