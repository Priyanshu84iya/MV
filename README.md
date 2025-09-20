# 🎵 VibeLive - Professional Music Visualizer

[![GitHub](https://img.shields.io/badge/GitHub-Priyanshu84iya-black?style=for-the-badge&logo=github)](https://github.com/Priyanshu84iya)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Priyanshu%20Chaurasiya-blue?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/priyanshu-chaurasiya-8986a833b)
[![Instagram](https://img.shields.io/badge/Instagram-pry__uchiha-E4405F?style=for-the-badge&logo=instagram)](https://www.instagram.com/pry_uchiha/)

A professional-grade music visualizer designed for clubs, cafes, and live venues. Features 15 unique visualization modes, real-time audio processing, and a sleek dark theme with neon accents.

![VibeLive Preview](https://via.placeholder.com/800x400/0a0a0a/00d4ff?text=VibeLive+Music+Visualizer)

## ✨ Features

### 🎨 **15 Visualization Modes**
- **Frequency Bars** - Classic spectrum analysis with gradient colors
- **Waveform** - Pure audio waveform with shadow effects
- **Spectrum** - Advanced multi-layer spectrum visualization
- **Oscilloscope** - Traditional oscilloscope display with grid
- **Spectrogram** - Time-frequency heatmap visualization
- **Circle Wave** - Concentric circles with audio-reactive patterns
- **Particle Storm** - Dynamic particle effects responding to frequencies
- **Geometric Shapes** - Abstract geometric forms and rotating triangles
- **Fractal** - Mathematical fractal patterns with recursive branching
- **3D Waveform** - Multi-layered pseudo-3D wave effects
- **Kaleidoscope** - 8-segment mirrored symmetry patterns
- **Liquid Flow** - Fluid simulation with connected particles
- **Neon Glow** - Bright neon effects with multiple glow layers
- **Spiral Galaxy** - Rotating spiral arms with cosmic patterns
- **Digital Rain** - Matrix-style falling digital effects

### 🎛️ **Professional Audio Controls**
- **File Upload** - Support for all major audio formats (MP3, WAV, OGG, etc.)
- **Playback Controls** - Play, Pause, Stop with visual feedback
- **Volume Control** - Real-time volume adjustment with percentage display
- **Live Microphone** - Real-time visualization of microphone input
- **Status Monitoring** - Live connection status and audio state tracking

### 🏢 **Club/Venue Ready Interface**
- **Professional Branding** - VibeLive logo with neon effects
- **Real-time Clock** - Always visible time display for venues
- **Status Indicators** - READY/PLAYING/PAUSED/LIVE MIC states
- **Dark Theme** - Optimized for low-light environments
- **Touch-Friendly** - Large buttons perfect for DJ booths and kiosks

### 📱 **Fully Responsive Design**
- **Desktop Displays** (1024px+) - Full dashboard layout
- **Tablets** (768px-1024px) - Optimized touch interface
- **Mobile Phones** (480px-768px) - Compact mobile layout
- **Small Screens** (<480px) - Essential controls maintained

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (for file access) or live server environment

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Priyanshu84iya/vibelive-music-visualizer.git
   cd vibelive-music-visualizer
   ```

2. **Start a local server**
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### Alternative - Direct File Access
Simply open `index.html` in your web browser. Note: File upload may be limited due to browser security policies.

## 📖 Usage Guide

### 🎵 **Audio File Playback**
1. Click the **"Load Track"** button in the left control panel
2. Select an audio file from your computer
3. Use the circular **Play/Pause/Stop** controls
4. Adjust volume with the slider (shows percentage)
5. Select any visualization mode from the bottom grid

### 🎤 **Live Microphone Input**
1. Click **"Activate Mic"** in the Live Input section
2. Allow microphone access when prompted
3. Speak or play music near your microphone
4. Watch real-time visualization respond to audio
5. Click **"Stop Microphone"** to deactivate

### 🎨 **Visualization Modes**
- Click any of the **15 visualization cards** at the bottom
- Each mode offers unique visual interpretation of audio
- Mode counter shows current selection (e.g., "5/15")
- Visualizations work with both file playback and microphone input

## 🛠️ Technical Details

### **Built With**
- **HTML5** - Semantic structure and audio elements
- **CSS3** - Advanced styling with custom properties and gradients
- **Vanilla JavaScript** - Web Audio API and Canvas 2D rendering
- **Font Awesome** - Professional iconography

### **Key Technologies**
- **Web Audio API** - High-quality audio processing and analysis
- **Canvas 2D API** - Hardware-accelerated graphics rendering
- **CSS Custom Properties** - Consistent theming and color management
- **Responsive Grid** - Flexible layouts for all screen sizes
- **Local Storage** - Settings persistence (future feature)

### **Browser Compatibility**
- ✅ Chrome 66+
- ✅ Firefox 60+
- ✅ Safari 11.1+
- ✅ Edge 79+
- ✅ Mobile browsers with Web Audio API support

### **Performance Features**
- **60 FPS Animation** - Smooth visualization rendering
- **Efficient Memory Management** - Optimized particle systems
- **Responsive Canvas** - Automatic resolution scaling
- **Background Processing** - Non-blocking audio analysis

## 📁 Project Structure

```
VibeLive/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling and themes
├── script.js           # Audio processing and visualizations
├── README.md           # Project documentation
└── assets/             # (Optional) Additional resources
    ├── images/         # Screenshots and graphics
    └── audio/          # Sample audio files
```

## 🎯 Use Cases

### **Live Venues**
- **Clubs and Nightclubs** - Background visuals for DJs
- **Cafes and Lounges** - Ambient audio visualization
- **Bars and Restaurants** - Interactive music displays
- **Event Spaces** - Professional audio-visual setup

### **Personal Use**
- **Home Entertainment** - Music listening enhancement
- **Content Creation** - Video backgrounds and streaming
- **Educational** - Audio frequency demonstration
- **Relaxation** - Meditative visual patterns

### **Professional Applications**
- **DJ Software Integration** - Visual feedback for mixing
- **Audio Engineering** - Frequency analysis and monitoring
- **Digital Art** - Real-time generative visuals
- **Performance Art** - Interactive installations

## 🔧 Customization

### **Color Themes**
Edit CSS custom properties in `styles.css`:
```css
:root {
    --primary-bg: #0a0a0a;        /* Main background */
    --neon-blue: #00d4ff;         /* Primary accent */
    --neon-purple: #b347d9;       /* Secondary accent */
    --neon-green: #39ff14;        /* Success/active states */
    --neon-pink: #ff1744;         /* Warning/recording states */
}
```

### **Branding**
Update logo and venue information in `index.html`:
```html
<div class="logo-text">YourBrand</div>
<span class="venue-name">Your Venue Name</span>
```

### **Visualization Parameters**
Modify visualization settings in `script.js`:
```javascript
// Particle count
this.particles = []; // Adjust array size for performance
this.analyser.fftSize = 256; // Frequency resolution (128, 256, 512, 1024)
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

### **Development Setup**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Contribution Guidelines**
- Maintain code style consistency
- Test across multiple browsers
- Update documentation for new features
- Ensure responsive design compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Priyanshu Chaurasiya**

- **GitHub**: [@Priyanshu84iya](https://github.com/Priyanshu84iya)
- **LinkedIn**: [Priyanshu Chaurasiya](https://www.linkedin.com/in/priyanshu-chaurasiya-8986a833b)
- **Instagram**: [@pry_uchiha](https://www.instagram.com/pry_uchiha/)
- **Discord**: [Direct Message](https://discord.com/channels/@me/986668410685521940)

## ☕ Support

If you found this project helpful, consider buying me a coffee!

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support-yellow?style=for-the-badge&logo=buy-me-a-coffee)](https://coff.ee/priyanshu6o)

## 🙏 Acknowledgments

- **Web Audio API** community for excellent documentation
- **Font Awesome** for professional iconography
- **MDN Web Docs** for comprehensive web development resources
- **GitHub** community for inspiration and code sharing

## 📊 Statistics

- **15** unique visualization modes
- **60 FPS** smooth animation
- **100%** responsive design
- **0** external dependencies
- **5** social media integrations
- **∞** creative possibilities

---

<div align="center">

**Made with ❤️ for the music and visual arts community**

[⭐ Star this repo](https://github.com/Priyanshu84iya/vibelive-music-visualizer) | [🐛 Report Bug](https://github.com/Priyanshu84iya/vibelive-music-visualizer/issues) | [✨ Request Feature](https://github.com/Priyanshu84iya/vibelive-music-visualizer/issues)

</div>