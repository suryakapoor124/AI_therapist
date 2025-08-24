# backend/core/stt.py

import os
import tempfile
import speech_recognition as sr
from fastapi import UploadFile
from pydub import AudioSegment


def transcribe_audio(file: UploadFile) -> str | None:
    """
    Convert uploaded audio file into text using Google STT (via speech_recognition).
    Returns recognized text or None if transcription fails.
    """

    recognizer = sr.Recognizer()
    wav_path = None

    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_wav:
            # Force standard format: mono, 16kHz, PCM
            audio = AudioSegment.from_file(file.file)
            audio = audio.set_frame_rate(16000).set_channels(1).set_sample_width(2)
            audio.export(tmp_wav.name, format="wav")
            wav_path = tmp_wav.name

        # Run STT
        with sr.AudioFile(wav_path) as source:
            audio_data = recognizer.record(source)

        try:
            text = recognizer.recognize_google(audio_data)
            return text
        except sr.UnknownValueError:
            print("[STT] Google could not understand audio")
            return None
        except sr.RequestError as e:
            print(f"[STT] Could not request results from Google; {e}")
            return None

    except Exception as e:
        print(f"[STT] General error: {type(e).__name__} - {e}")
        return None

    finally:
        if wav_path and os.path.exists(wav_path):
            os.remove(wav_path)
