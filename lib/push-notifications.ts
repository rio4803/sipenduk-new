export async function subscribeToPush(userId: string, token: string) {
    const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            token: token,
            user_id: userId
        }),
    })

    const result = await response.json()
    return result.success
}

export async function unsubscribeFromPush() {
    if (!('serviceWorker' in navigator)) return false

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
        await subscription.unsubscribe()
        return true
    }
    return false
}
