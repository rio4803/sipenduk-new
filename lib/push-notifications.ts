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

export async function unsubscribeFromPush(userId: string) {
    const request = await fetch("/api/notifications/unsubscribe", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({
            user_id: userId,
        })
    })

    const response = await request.json()
    return response.success
}

export async function checkSubscription(userId: string){
    const request = await fetch("/api/notifications/check-subs", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_id: userId
        })
    })

    const {subsStatus} = await request.json()
    return subsStatus
}