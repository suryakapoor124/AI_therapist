import { useState, useEffect } from 'react'

export default function useSession() {
    const [sessionId, setSessionId] = useState(() => {
        // Try to get existing session from localStorage
        return localStorage.getItem('chatSessionId') || null
    })

    // Update localStorage when sessionId changes
    useEffect(() => {
        if (sessionId) {
            localStorage.setItem('chatSessionId', sessionId)
        }
    }, [sessionId])

    return [sessionId, setSessionId]
}