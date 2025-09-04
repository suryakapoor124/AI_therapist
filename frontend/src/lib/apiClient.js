import axios from 'axios'

// Backend base URL
// Use environment variable (Vite convention: VITE_*)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'


// --------------------- TEXT ---------------------
export async function sendTextMessage(text, isFirst = false, sessionId = null) {
    try {
        const payload = {
            user_input: text,
            is_first: isFirst,
        }
        if (sessionId) payload.session_id = sessionId

        const response = await axios.post(`${BASE_URL}/chat/text`, payload)
        return response.data
    } catch (error) {
        console.error('Error sending text message:', error)
        throw error
    }
}

// --------------------- VOICE ---------------------
export async function transcribeAudio(blob, isFirst = false, sessionId = null) {
    try {
        const formData = new FormData()
        formData.append('file', blob, 'audio.wav')
        formData.append('is_first', isFirst ? 'true' : 'false')
        if (sessionId) formData.append('session_id', sessionId)

        const response = await axios.post(`${BASE_URL}/chat/voice`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return response.data
    } catch (error) {
        console.error('Error transcribing audio:', error)
        throw error
    }
}