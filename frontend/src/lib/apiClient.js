import axios from 'axios'

// Backend base URL
const BASE_URL = 'http://localhost:8000'

// --------------------- TEXT ---------------------
export async function sendTextMessage(text, isFirst = false) {
    try {
        const response = await axios.post(`${BASE_URL}/chat/text`, {
            user_input: text,
            is_first: isFirst
        })
        // Backend returns: { reply_text, reply_audio_base64, crisis, banner, session_id }
        return response.data
    } catch (error) {
        console.error('Error sending text message:', error)
        throw error
    }
}

// --------------------- VOICE ---------------------
export async function transcribeAudio(blob, isFirst = false) {
    try {
        const formData = new FormData()
        formData.append('file', blob, 'audio.wav')       // audio file
        formData.append('is_first', isFirst ? 'true' : 'false')  // send is_first

        const response = await axios.post(`${BASE_URL}/chat/voice`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })

        // Backend returns: { reply_text, reply_audio_base64, crisis, banner, session_id }
        return response.data
    } catch (error) {
        console.error('Error transcribing audio:', error)
        throw error
    }
}
