# Web-Push Configuration

## VAPID Keys Setup ✅

Your VAPID keys have been generated and configured:

**Public Key:**
```
BG0yIjrOL_3NS8zNrVO9B5xjDQZ2LJw-UcY1rpasbZeUBIbZP9kVumMcPeXCmp3jZqU6PvL0BQ1FBUiiqdEHGX4
```

**Private Key:**
```
c_o9eh9lUPKdEax3ljIxw31_1-7BKx8nzd8EAHdRNhI
```

## Environment Variables (.env)

Make sure your `.env` file contains:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BG0yIjrOL_3NS8zNrVO9B5xjDQZ2LJw-UcY1rpasbZeUBIbZP9kVumMcPeXCmp3jZqU6PvL0BQ1FBUiiqdEHGX4
VAPID_PRIVATE_KEY=c_o9eh9lUPKdEax3ljIxw31_1-7BKx8nzd8EAHdRNhI
VAPID_EMAIL=admin@sipenduk.com
```

## Changes Made

### 1. Updated Send Notification API
- **File:** `app/api/notifications/send/route.ts`
- Now uses `web-push` library to actually send push notifications
- Configured with your VAPID keys
- Sends notifications to all subscribed users

### 2. Updated Notification Button
- **File:** `components/notification-button.tsx`
- Now uses VAPID public key for subscription
- Properly converts base64 VAPID key to Uint8Array

## Testing Push Notifications

### Step 1: Restart Dev Server
```bash
# Stop current server (Ctrl+C)
bun dev
```

### Step 2: Subscribe to Notifications
1. Open the app in Chrome or Edge
2. Look for the notification button (or PWA install prompt)
3. Click to subscribe
4. Grant notification permission when prompted

### Step 3: Send a Test Notification
1. Go to `/admin/pengumuman`
2. Create a new announcement
3. Click the bell icon (🔔) next to the announcement
4. You should receive a real push notification!

## How It Works

1. **Service Worker**: Registered at `/sw.js`, handles push events
2. **Subscription**: Users subscribe with VAPID public key
3. **Storage**: Subscriptions stored in Redis
4. **Sending**: Admin clicks bell icon → sends to all subscribers via web-push
5. **Delivery**: Push notification appears even if browser is closed

## Troubleshooting

### "VAPID key not found"
- Make sure `.env` has `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- Restart dev server after adding env variables

### "Subscription failed"
- Check browser console for errors
- Make sure service worker is registered (check DevTools → Application → Service Workers)
- Try in incognito mode

### "No notifications received"
- Check that you're subscribed (notification button should show "Nonaktifkan Notifikasi")
- Make sure notifications are allowed in browser settings
- Check browser DevTools → Application → Push Messaging

## Production Notes

⚠️ **Important for Production:**
- Keep your VAPID private key secure (never commit to git)
- Use different VAPID keys for dev and production
- Add proper error handling for failed subscriptions
- Implement subscription cleanup for expired subscriptions
- Consider rate limiting for notification sending
