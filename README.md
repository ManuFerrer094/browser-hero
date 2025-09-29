# Browser Hero 🎸

A Guitar Hero-style browser game built with Next.js that converts YouTube videos into playable rhythm games with automatic note generation.

![Browser Hero Main Menu](https://github.com/user-attachments/assets/1a90fc36-8cc9-4229-a2eb-92f616c2ec9e)

## Features

- 🎵 **YouTube Integration**: Paste any YouTube URL to generate a custom Guitar Hero experience
- 🎯 **Automatic Note Generation**: Advanced audio analysis creates notes that match the rhythm and beat
- 🎮 **Classic Guitar Hero Mechanics**: 5-lane gameplay with A, S, D, F, G keys
- 🎨 **Beautiful Visual Effects**: Animated notes, score system, and responsive UI
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Fast Deployment**: Optimized for Vercel deployment

![Browser Hero Gameplay](https://github.com/user-attachments/assets/f3dae7ab-2e73-40d5-adb5-164d78ae541f)

## How to Play

1. **Enter a YouTube URL** or click "MODO DEMO" for a demo experience
2. **Wait for processing** - the app analyzes the audio and generates notes automatically
3. **Use keyboard controls**: Press A, S, D, F, G when notes reach the hit zone
4. **Build combos**: Hit consecutive notes to increase your score multiplier
5. **Achieve high scores**: Perfect timing gives maximum points!

## Technology Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS for responsive design  
- **Animation**: Framer Motion for smooth animations
- **Graphics**: HTML5 Canvas for game rendering
- **Audio**: Web Audio API for audio analysis and beat detection
- **3D Effects**: Three.js ready for future enhancements

## Development

### Getting Started

```bash
# Clone the repository
git clone https://github.com/ManuFerrer094/browser-hero.git
cd browser-hero

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play the game.

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Deployment on Vercel

This project is optimized for deployment on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FManuFerrer094%2Fbrowser-hero)

Or deploy manually:

1. Push your code to GitHub
2. Import the project in Vercel
3. Deploy with zero configuration needed!

## Game Controls

| Key | Lane | Color |
|-----|------|-------|
| A   | 1    | Red   |
| S   | 2    | Orange|
| D   | 3    | Yellow|
| F   | 4    | Green |
| G   | 5    | Blue  |

## Audio Processing

The game uses advanced Web Audio API features to analyze YouTube audio:

- **FFT Analysis**: Extracts frequency data in real-time
- **Beat Detection**: Identifies rhythmic patterns and peaks
- **Multi-band Processing**: Separates bass, mid, and treble frequencies
- **Intelligent Note Mapping**: Maps different frequency ranges to appropriate lanes
- **Dynamic Difficulty**: Adjusts note density based on audio complexity

## Future Enhancements

- [ ] Real YouTube audio extraction via backend service
- [ ] Multiplayer support
- [ ] Custom themes and visual effects
- [ ] Leaderboards and score sharing
- [ ] Mobile touch controls
- [ ] VR/AR support with Three.js
- [ ] Custom song upload support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

---

Developed with ❤️ by the Browser Hero team
