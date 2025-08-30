# AI Therapist Frontend

A React-based frontend application for AI Therapist, built with Vite and TailwindCSS.

## Tech Stack

- React 18
- Vite
- TailwindCSS
- Framer Motion
- Axios
- Lucide React Icons
- react-textarea-autosize


## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

## Getting Started

1. Clone the repository:
```bash
git clone <your-repository-url>
cd AI_therapist/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```bash
VITE_API_URL=http://localhost:8000  # Update with your backend API URL
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   ├── assets/
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

## Building for Production

To create a production build:

```bash
npm run build
```

This will generate a `dist` folder with the built application.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## We are open for contributor.

## License

This project is licensed under the MIT License - see the LICENSE file for details
