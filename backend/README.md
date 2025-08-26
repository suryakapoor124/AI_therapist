# AI Therapist Backend

FastAPI-based backend for the AI Therapist application, handling AI model interactions and speech processing.

## Tech Stack

- FastAPI
- Python 3.9+
- OpenAI
- SpeechRecognition
- pydub

## Prerequisites

- Python 3.9 or higher
- pip
- Virtual environment

## Getting Started

1. Clone the repository:
```bash
git clone <your-repository-url>
cd AI_therapist/backend
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # For Linux
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file with your configuration:
```bash
MODE=normal
CORS_ALLOW_ORIGINS=http://localhost:5173
SARVAM_API_KEY=your_sarvam_api_key_here
HF_BASE_URL=https://router.huggingface.co/v1
HF_TOKEN=your_huggingface_token_here
HF_MODEL=openai/gpt-oss-20b:fireworks-ai
```

5. Start the server:
```bash
fastapi dev main.py
```

The API will be available at `http://localhost:8000`

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── routes/
│   ├── core/
│   │   └── config.py
│   ├── services/
│   └── utils/
├── requirements.txt
├── main.py
└── .env
```

## API Documentation

Once the server is running, you can access:
- Swagger UI documentation: `http://localhost:8000/docs`
- ReDoc documentation: `http://localhost:8000/redoc`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| MODE | Application mode | normal |
| CORS_ALLOW_ORIGINS | Allowed CORS origins | * |
| SARVAM_API_KEY | Sarvam AI API key | - |
| HF_BASE_URL | Hugging Face API base URL | https://router.huggingface.co/v1 |
| HF_TOKEN | Hugging Face API token | - |
| HF_MODEL | Hugging Face model name | openai/gpt-oss-20b:fireworks-ai |

## Development

To run tests:
```bash
pytest
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
