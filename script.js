class MusicVisualizer {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.audioElement = null;
        this.source = null;
        this.canvas = null;
        this.ctx = null;
        this.dataArray = null;
        this.bufferLength = null;
        this.animationId = null;
        this.isPlaying = false;
        this.isMicActive = false;
        this.micStream = null;
        this.currentVisualization = 'frequency';
        this.particles = [];
        this.rainDrops = [];
        this.time = 0;
        this.spectrogramData = [];
        this.liquidPoints = [];
        this.fractalPoints = [];
        
        this.init();
    }
    
    init() {
        // Get DOM elements
        this.canvas = document.getElementById('visualizer');
        this.ctx = this.canvas.getContext('2d');
        this.audioElement = document.getElementById('audioElement');
        
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Initialize event listeners
        this.setupEventListeners();
        
        // Initialize status
        this.updateStatus('Ready to visualize audio');
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        this.canvas.width = Math.min(800, rect.width - 20);
        this.canvas.height = 400;
    }
    
    setupEventListeners() {
        // File input
        document.getElementById('audioFile').addEventListener('change', (e) => {
            this.loadAudioFile(e.target.files[0]);
        });
        
        // Playback controls
        document.getElementById('playBtn').addEventListener('click', () => this.play());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
        document.getElementById('stopBtn').addEventListener('click', () => this.stop());
        
        // Volume control
        document.getElementById('volumeSlider').addEventListener('input', (e) => {
            this.setVolume(e.target.value / 100);
            document.querySelector('.volume-value').textContent = e.target.value + '%';
        });
        
        // Microphone button
        document.getElementById('micBtn').addEventListener('click', () => this.toggleMicrophone());
        
        // Visualization selector buttons
        document.querySelectorAll('.viz-card').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const vizType = e.currentTarget.dataset.viz;
                this.setVisualization(vizType);
                this.updateModeCounter();
            });
        });
        
        // Initialize time display
        this.updateTimeDisplay();
        setInterval(() => this.updateTimeDisplay(), 1000);
        
        // Initialize mode counter
        this.updateModeCounter();
        
        // Initialize watermark toggle
        this.setupWatermarkToggle();
        
        // Audio element events
        this.audioElement.addEventListener('ended', () => {
            this.isPlaying = false;
            this.updateStatus('Audio ended');
        });
        
        this.audioElement.addEventListener('loadstart', () => {
            this.updateStatus('Loading audio...');
        });
        
        this.audioElement.addEventListener('canplaythrough', () => {
            this.updateStatus('Audio loaded and ready to play');
        });
        
        this.audioElement.addEventListener('error', (e) => {
            this.updateStatus('Error loading audio file');
            console.error('Audio error:', e);
        });
    }
    
    async initAudioContext() {
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            if (!this.analyser) {
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 256;
                this.bufferLength = this.analyser.frequencyBinCount;
                this.dataArray = new Uint8Array(this.bufferLength);
            }
            
            return true;
        } catch (error) {
            console.error('Error initializing audio context:', error);
            this.updateStatus('Error initializing audio system');
            return false;
        }
    }
    
    async loadAudioFile(file) {
        if (!file) return;
        
        try {
            this.updateStatus('Loading audio file...');
            document.getElementById('songInfo').textContent = `Loading: ${file.name}`;
            
            const url = URL.createObjectURL(file);
            this.audioElement.src = url;
            
            // Wait for the audio to be ready
            await new Promise((resolve, reject) => {
                this.audioElement.addEventListener('canplaythrough', resolve, { once: true });
                this.audioElement.addEventListener('error', reject, { once: true });
            });
            
            document.getElementById('songInfo').textContent = `Loaded: ${file.name}`;
            this.updateStatus('Audio file loaded successfully');
            
        } catch (error) {
            console.error('Error loading audio file:', error);
            this.updateStatus('Error loading audio file');
            document.getElementById('songInfo').textContent = '';
        }
    }
    
    async setupAudioSource() {
        const initialized = await this.initAudioContext();
        if (!initialized) return false;
        
        try {
            // Disconnect existing source
            if (this.source) {
                this.source.disconnect();
            }
            
            // Create new source from audio element
            this.source = this.audioContext.createMediaElementSource(this.audioElement);
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            
            return true;
        } catch (error) {
            console.error('Error setting up audio source:', error);
            this.updateStatus('Error setting up audio source');
            return false;
        }
    }
    
    async play() {
        if (!this.audioElement.src) {
            this.updateStatus('Please select an audio file first');
            return;
        }
        
        try {
            if (!this.source) {
                const success = await this.setupAudioSource();
                if (!success) return;
            }
            
            await this.audioElement.play();
            this.isPlaying = true;
            this.startVisualization();
            this.updateStatus('Playing...');
            document.getElementById('connectionStatus').textContent = 'PLAYING';
            
        } catch (error) {
            console.error('Error playing audio:', error);
            this.updateStatus('Error playing audio');
        }
    }
    
    pause() {
        this.audioElement.pause();
        this.isPlaying = false;
        this.updateStatus('Paused');
        document.getElementById('connectionStatus').textContent = 'PAUSED';
    }
    
    stop() {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        this.isPlaying = false;
        this.stopVisualization();
        this.clearCanvas();
        this.updateStatus('Stopped');
        document.getElementById('connectionStatus').textContent = 'READY';
    }
    
    setVisualization(type) {
        this.currentVisualization = type;
        
        // Update button states
        document.querySelectorAll('.viz-card').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-viz="${type}"]`).classList.add('active');
        
        // Initialize specific visualization data
        if (type === 'particles') {
            this.initParticles();
        } else if (type === 'rain') {
            this.initRainDrops();
        } else if (type === 'spectrogram') {
            this.initSpectrogram();
        } else if (type === 'liquid') {
            this.initLiquidPoints();
        } else if (type === 'fractal') {
            this.initFractalPoints();
        }
        
        this.clearCanvas();
    }
    
    updateModeCounter() {
        const activeCard = document.querySelector('.viz-card.active');
        const allCards = document.querySelectorAll('.viz-card');
        const currentIndex = Array.from(allCards).indexOf(activeCard) + 1;
        
        document.getElementById('currentMode').textContent = currentIndex;
        document.getElementById('totalModes').textContent = allCards.length;
    }
    
    updateTimeDisplay() {
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        document.getElementById('currentTime').textContent = time;
    }
    
    setupWatermarkToggle() {
        const toggleBtn = document.getElementById('watermarkToggle');
        const watermark = document.querySelector('.author-watermark');
        
        toggleBtn.addEventListener('click', () => {
            watermark.classList.toggle('collapsed');
        });
        
        // Auto-collapse after 10 seconds on desktop
        if (window.innerWidth > 768) {
            setTimeout(() => {
                watermark.classList.add('collapsed');
            }, 10000);
        }
    }
    
    initParticles() {
        this.particles = [];
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                color: Math.random() * 360,
                intensity: 0
            });
        }
    }
    
    initRainDrops() {
        this.rainDrops = [];
        for (let i = 0; i < 30; i++) {
            this.rainDrops.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                speed: Math.random() * 3 + 1,
                length: Math.random() * 20 + 10,
                intensity: 0
            });
        }
    }
    
    initSpectrogram() {
        this.spectrogramData = [];
        for (let i = 0; i < 200; i++) {
            this.spectrogramData.push(new Array(this.bufferLength).fill(0));
        }
    }
    
    initLiquidPoints() {
        this.liquidPoints = [];
        for (let i = 0; i < 40; i++) {
            this.liquidPoints.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 15 + 5,
                connections: []
            });
        }
    }
    
    initFractalPoints() {
        this.fractalPoints = [];
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            this.fractalPoints.push({
                x: centerX + Math.cos(angle) * 50,
                y: centerY + Math.sin(angle) * 50,
                baseAngle: angle,
                depth: 0
            });
        }
    }
    
    setVolume(volume) {
        this.audioElement.volume = volume;
    }
    
    async toggleMicrophone() {
        if (this.isMicActive) {
            this.stopMicrophone();
        } else {
            await this.startMicrophone();
        }
    }
    
    async startMicrophone() {
        try {
            this.updateStatus('Requesting microphone access...');
            
            const initialized = await this.initAudioContext();
            if (!initialized) return;
            
            // Get microphone stream
            this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Disconnect existing source
            if (this.source) {
                this.source.disconnect();
            }
            
            // Create microphone source
            this.source = this.audioContext.createMediaStreamSource(this.micStream);
            this.source.connect(this.analyser);
            
            this.isMicActive = true;
            this.startVisualization();
            
            // Update UI
            const micBtn = document.getElementById('micBtn');
            micBtn.classList.add('active');
            micBtn.querySelector('.mic-text').textContent = 'Stop Microphone';
            micBtn.querySelector('.mic-indicator').textContent = 'Recording...';
            
            this.updateStatus('Microphone active - speak to see visualization');
            document.getElementById('connectionStatus').textContent = 'LIVE MIC';
            
        } catch (error) {
            console.error('Error accessing microphone:', error);
            this.updateStatus('Error accessing microphone. Please allow microphone access.');
        }
    }
    
    stopMicrophone() {
        if (this.micStream) {
            this.micStream.getTracks().forEach(track => track.stop());
            this.micStream = null;
        }
        
        if (this.source) {
            this.source.disconnect();
            this.source = null;
        }
        
        this.isMicActive = false;
        this.stopVisualization();
        this.clearCanvas();
        
        // Update UI
        const micBtn = document.getElementById('micBtn');
        micBtn.classList.remove('active');
        micBtn.querySelector('.mic-text').textContent = 'Activate Mic';
        micBtn.querySelector('.mic-indicator').textContent = '';
        
        this.updateStatus('Microphone stopped');
        document.getElementById('connectionStatus').textContent = 'READY';
    }
    
    startVisualization() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.visualize();
    }
    
    stopVisualization() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    visualize() {
        this.animationId = requestAnimationFrame(() => this.visualize());
        
        if (!this.analyser) return;
        
        this.analyser.getByteFrequencyData(this.dataArray);
        this.time += 0.02;
        
        // Clear canvas with different effects based on visualization type
        if (this.currentVisualization === 'particles' || this.currentVisualization === 'rain') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        } else {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        }
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw based on current visualization type
        switch (this.currentVisualization) {
            case 'frequency':
                this.drawFrequencyBars();
                break;
            case 'waveform':
                this.drawWaveform();
                break;
            case 'spectrum':
                this.drawSpectrum();
                break;
            case 'oscilloscope':
                this.drawOscilloscope();
                break;
            case 'spectrogram':
                this.drawSpectrogram();
                break;
            case 'circle':
                this.drawCircleWave();
                break;
            case 'particles':
                this.drawParticleStorm();
                break;
            case 'geometric':
                this.drawGeometricShapes();
                break;
            case 'fractal':
                this.drawFractal();
                break;
            case 'waveform3d':
                this.drawWaveform3D();
                break;
            case 'kaleidoscope':
                this.drawKaleidoscope();
                break;
            case 'liquid':
                this.drawLiquidFlow();
                break;
            case 'neon':
                this.drawNeonGlow();
                break;
            case 'spiral':
                this.drawSpiralGalaxy();
                break;
            case 'rain':
                this.drawDigitalRain();
                break;
        }
    }
    
    drawFrequencyBars() {
        const barWidth = this.canvas.width / this.bufferLength * 2;
        let x = 0;
        
        for (let i = 0; i < this.bufferLength; i++) {
            const barHeight = (this.dataArray[i] / 255) * this.canvas.height * 0.8;
            
            // Create gradient
            const gradient = this.ctx.createLinearGradient(0, this.canvas.height, 0, this.canvas.height - barHeight);
            gradient.addColorStop(0, `hsl(${i * 2 + 200}, 70%, 60%)`);
            gradient.addColorStop(1, `hsl(${i * 2 + 200}, 70%, 80%)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth - 1, barHeight);
            
            x += barWidth;
        }
        
        // Add waveform overlay
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        const sliceWidth = this.canvas.width / this.bufferLength;
        x = 0;
        
        for (let i = 0; i < this.bufferLength; i++) {
            const v = this.dataArray[i] / 255;
            const y = v * this.canvas.height / 2 + 50;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        this.ctx.stroke();
    }
    
    drawCircleWave() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) * 0.7;
        
        // Calculate average amplitude for base pulse
        const avgAmplitude = this.dataArray.reduce((a, b) => a + b, 0) / this.bufferLength / 255;
        
        // Draw multiple concentric circles with different approaches
        for (let ring = 0; ring < 6; ring++) {
            // Method 1: Pulsing solid circles
            if (ring < 3) {
                const baseRadius = 30 + ring * 40;
                const radius = baseRadius + avgAmplitude * 30 + Math.sin(this.time * 2 + ring) * 10;
                
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                this.ctx.strokeStyle = `hsla(${ring * 80 + this.time * 30}, 70%, 70%, 0.8)`;
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
                
                // Add inner glow
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius - 5, 0, Math.PI * 2);
                this.ctx.strokeStyle = `hsla(${ring * 80 + this.time * 30}, 70%, 90%, 0.4)`;
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }
            
            // Method 2: Frequency-responsive wavy circles
            else {
                this.ctx.beginPath();
                const numPoints = 32;
                const angleStep = (Math.PI * 2) / numPoints;
                const baseRadius = 60 + (ring - 3) * 60;
                
                for (let i = 0; i < numPoints; i++) {
                    const angle = i * angleStep + this.time * 0.5;
                    const dataIndex = Math.floor((i / numPoints) * this.bufferLength);
                    const amplitude = this.dataArray[dataIndex] / 255;
                    
                    const radius = baseRadius + amplitude * 40 + Math.sin(angle * 3 + this.time) * 15;
                    const x = centerX + Math.cos(angle) * radius;
                    const y = centerY + Math.sin(angle) * radius;
                    
                    if (i === 0) {
                        this.ctx.moveTo(x, y);
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
                
                this.ctx.closePath();
                this.ctx.strokeStyle = `hsla(${(ring - 3) * 100 + this.time * 40}, 80%, 65%, 0.7)`;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        }
        
        // Add center pulse
        const centerPulse = 10 + avgAmplitude * 20;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, centerPulse, 0, Math.PI * 2);
        this.ctx.fillStyle = `hsla(${this.time * 60}, 80%, 80%, ${0.6 + avgAmplitude * 0.4})`;
        this.ctx.fill();
        
        // Add radiating lines
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + this.time * 0.3;
            const lineLength = 50 + avgAmplitude * 100;
            
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(
                centerX + Math.cos(angle) * lineLength,
                centerY + Math.sin(angle) * lineLength
            );
            this.ctx.strokeStyle = `hsla(${i * 45 + this.time * 50}, 70%, 70%, ${0.3 + avgAmplitude * 0.5})`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }
    
    drawParticleStorm() {
        // Calculate average amplitude
        const avgAmplitude = this.dataArray.reduce((a, b) => a + b, 0) / this.bufferLength / 255;
        
        // Update and draw particles
        this.particles.forEach((particle, index) => {
            const frequencyIndex = Math.floor((index / this.particles.length) * this.bufferLength);
            const intensity = this.dataArray[frequencyIndex] / 255;
            
            // Update particle properties based on audio
            particle.intensity = intensity;
            particle.x += particle.vx * (1 + intensity * 2);
            particle.y += particle.vy * (1 + intensity * 2);
            particle.size = Math.max(1, particle.size + (intensity - 0.5) * 0.5);
            
            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * (1 + intensity), 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${particle.color + this.time * 10}, 70%, ${50 + intensity * 50}%, ${0.3 + intensity * 0.7})`;
            this.ctx.fill();
            
            // Add glow effect
            if (intensity > 0.5) {
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size * (2 + intensity * 2), 0, Math.PI * 2);
                this.ctx.fillStyle = `hsla(${particle.color + this.time * 10}, 70%, 80%, ${(intensity - 0.5) * 0.3})`;
                this.ctx.fill();
            }
        });
    }
    
    drawSpiralGalaxy() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Draw multiple spiral arms
        for (let arm = 0; arm < 3; arm++) {
            this.ctx.beginPath();
            
            for (let i = 0; i < this.bufferLength; i++) {
                const amplitude = this.dataArray[i] / 255;
                const angle = (i / this.bufferLength) * Math.PI * 4 + arm * (Math.PI * 2 / 3) + this.time;
                const radius = (i / this.bufferLength) * Math.min(centerX, centerY) * 0.8;
                
                const x = centerX + Math.cos(angle) * (radius + amplitude * 50);
                const y = centerY + Math.sin(angle) * (radius + amplitude * 50);
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
                
                // Draw points along the spiral
                if (i % 3 === 0) {
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, amplitude * 3 + 1, 0, Math.PI * 2);
                    this.ctx.fillStyle = `hsl(${arm * 120 + i * 2}, 70%, ${40 + amplitude * 60}%)`;
                    this.ctx.fill();
                }
            }
            
            this.ctx.strokeStyle = `hsla(${arm * 120 + this.time * 20}, 70%, 60%, 0.5)`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }
    
    drawDigitalRain() {
        // Update and draw rain drops
        this.rainDrops.forEach((drop, index) => {
            const frequencyIndex = Math.floor((index / this.rainDrops.length) * this.bufferLength);
            const intensity = this.dataArray[frequencyIndex] / 255;
            
            drop.intensity = intensity;
            drop.y += drop.speed * (1 + intensity * 2);
            
            // Reset drop when it goes off screen
            if (drop.y > this.canvas.height + drop.length) {
                drop.y = -drop.length;
                drop.x = Math.random() * this.canvas.width;
            }
            
            // Draw the rain drop as a line
            this.ctx.beginPath();
            this.ctx.moveTo(drop.x, drop.y);
            this.ctx.lineTo(drop.x, drop.y + drop.length * (1 + intensity));
            this.ctx.strokeStyle = `hsl(${120 + intensity * 60}, 70%, ${30 + intensity * 70}%)`;
            this.ctx.lineWidth = Math.max(1, intensity * 3);
            this.ctx.stroke();
            
            // Add glow effect for high intensity
            if (intensity > 0.6) {
                this.ctx.beginPath();
                this.ctx.moveTo(drop.x, drop.y);
                this.ctx.lineTo(drop.x, drop.y + drop.length * (1 + intensity));
                this.ctx.strokeStyle = `hsla(${120 + intensity * 60}, 70%, 80%, ${(intensity - 0.6) * 0.8})`;
                this.ctx.lineWidth = intensity * 6;
                this.ctx.stroke();
            }
        });
        
        // Add some digital characters floating
        if (Math.random() < 0.1) {
            const chars = '01';
            const char = chars[Math.floor(Math.random() * chars.length)];
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const avgAmplitude = this.dataArray.reduce((a, b) => a + b, 0) / this.bufferLength / 255;
            
            this.ctx.font = `${12 + avgAmplitude * 20}px 'Courier New', monospace`;
            this.ctx.fillStyle = `hsla(120, 70%, ${50 + avgAmplitude * 50}%, ${0.3 + avgAmplitude * 0.7})`;
            this.ctx.fillText(char, x, y);
        }
    }
    
    drawWaveform() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        
        const sliceWidth = this.canvas.width / this.bufferLength;
        let x = 0;
        
        for (let i = 0; i < this.bufferLength; i++) {
            const v = this.dataArray[i] / 255;
            const y = (v * this.canvas.height / 2) + (this.canvas.height / 2);
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        this.ctx.stroke();
        
        // Add shadow effect
        this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
        this.ctx.lineWidth = 6;
        this.ctx.stroke();
    }
    
    drawSpectrum() {
        const barWidth = this.canvas.width / this.bufferLength;
        let x = 0;
        
        for (let i = 0; i < this.bufferLength; i++) {
            const barHeight = (this.dataArray[i] / 255) * this.canvas.height;
            
            // Create multiple layers for depth
            for (let layer = 0; layer < 3; layer++) {
                const layerHeight = barHeight * (1 - layer * 0.2);
                const gradient = this.ctx.createLinearGradient(0, this.canvas.height, 0, this.canvas.height - layerHeight);
                
                gradient.addColorStop(0, `hsla(${i * 2 + layer * 60}, 80%, ${60 - layer * 10}%, ${0.8 - layer * 0.2})`);
                gradient.addColorStop(1, `hsla(${i * 2 + layer * 60}, 80%, ${80 - layer * 10}%, ${0.6 - layer * 0.1})`);
                
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(x + layer, this.canvas.height - layerHeight, barWidth - 2, layerHeight);
            }
            
            x += barWidth;
        }
    }
    
    drawOscilloscope() {
        const centerY = this.canvas.height / 2;
        
        // Draw grid
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)';
        this.ctx.lineWidth = 1;
        
        // Horizontal lines
        for (let i = 0; i < 5; i++) {
            const y = (i * this.canvas.height) / 4;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        // Vertical lines
        for (let i = 0; i < 10; i++) {
            const x = (i * this.canvas.width) / 9;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Draw waveform
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.9)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        const sliceWidth = this.canvas.width / this.bufferLength;
        let x = 0;
        
        for (let i = 0; i < this.bufferLength; i++) {
            const v = (this.dataArray[i] / 255) - 0.5;
            const y = centerY + v * centerY;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        this.ctx.stroke();
    }
    
    drawSpectrogram() {
        // Shift existing data
        this.spectrogramData.shift();
        this.spectrogramData.push([...this.dataArray]);
        
        const cellWidth = this.canvas.width / this.spectrogramData.length;
        const cellHeight = this.canvas.height / this.bufferLength;
        
        for (let x = 0; x < this.spectrogramData.length; x++) {
            for (let y = 0; y < this.bufferLength; y++) {
                const intensity = this.spectrogramData[x][y] / 255;
                const hue = 240 - intensity * 240; // Blue to red
                
                this.ctx.fillStyle = `hsla(${hue}, 80%, ${intensity * 70}%, ${intensity})`;
                this.ctx.fillRect(x * cellWidth, (this.bufferLength - y - 1) * cellHeight, cellWidth, cellHeight);
            }
        }
    }
    
    drawGeometricShapes() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const avgAmplitude = this.dataArray.reduce((a, b) => a + b, 0) / this.bufferLength / 255;
        
        // Draw rotating triangles
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + this.time;
            const size = 30 + avgAmplitude * 50;
            const distance = 80 + Math.sin(this.time + i) * 20;
            
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(angle + this.time * 2);
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, -size);
            this.ctx.lineTo(-size * 0.866, size * 0.5);
            this.ctx.lineTo(size * 0.866, size * 0.5);
            this.ctx.closePath();
            
            this.ctx.fillStyle = `hsla(${i * 60 + this.time * 50}, 70%, 60%, 0.7)`;
            this.ctx.fill();
            this.ctx.strokeStyle = `hsla(${i * 60 + this.time * 50}, 70%, 80%, 0.9)`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            this.ctx.restore();
        }
        
        // Draw pulsing squares
        for (let i = 0; i < this.bufferLength; i += 8) {
            const amplitude = this.dataArray[i] / 255;
            const size = amplitude * 20 + 5;
            const x = (i / this.bufferLength) * this.canvas.width;
            const y = this.canvas.height - amplitude * this.canvas.height * 0.5;
            
            this.ctx.fillStyle = `hsla(${i * 3}, 70%, 60%, ${amplitude})`;
            this.ctx.fillRect(x - size/2, y - size/2, size, size);
        }
    }
    
    drawFractal() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const avgAmplitude = this.dataArray.reduce((a, b) => a + b, 0) / this.bufferLength / 255;
        
        this.drawFractalBranch(centerX, centerY, 0, 60 + avgAmplitude * 40, 0, 4);
    }
    
    drawFractalBranch(x, y, angle, length, depth, maxDepth) {
        if (depth > maxDepth) return;
        
        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;
        
        const intensity = depth < this.bufferLength ? this.dataArray[depth * 10] / 255 : 0.5;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(endX, endY);
        this.ctx.strokeStyle = `hsla(${depth * 60 + this.time * 30}, 70%, ${50 + intensity * 50}%, ${1 - depth * 0.2})`;
        this.ctx.lineWidth = Math.max(1, 5 - depth);
        this.ctx.stroke();
        
        if (depth < maxDepth) {
            const newLength = length * 0.7;
            this.drawFractalBranch(endX, endY, angle - 0.5 + Math.sin(this.time) * 0.3, newLength, depth + 1, maxDepth);
            this.drawFractalBranch(endX, endY, angle + 0.5 + Math.cos(this.time) * 0.3, newLength, depth + 1, maxDepth);
        }
    }
    
    drawWaveform3D() {
        const centerY = this.canvas.height / 2;
        const numLayers = 5;
        
        for (let layer = 0; layer < numLayers; layer++) {
            const offset = layer * 20;
            const alpha = 1 - layer * 0.15;
            
            this.ctx.strokeStyle = `hsla(${layer * 50 + this.time * 20}, 70%, 60%, ${alpha})`;
            this.ctx.lineWidth = 3 - layer * 0.3;
            this.ctx.beginPath();
            
            const sliceWidth = this.canvas.width / this.bufferLength;
            let x = 0;
            
            for (let i = 0; i < this.bufferLength; i++) {
                const v = this.dataArray[i] / 255;
                const y = centerY + (v - 0.5) * (this.canvas.height * 0.3) - offset;
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
                
                x += sliceWidth;
            }
            
            this.ctx.stroke();
        }
    }
    
    drawKaleidoscope() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const segments = 8;
        
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        
        for (let segment = 0; segment < segments; segment++) {
            this.ctx.save();
            this.ctx.rotate((segment / segments) * Math.PI * 2);
            
            // Create clipping path for segment
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.arc(0, 0, Math.min(centerX, centerY), 0, Math.PI / segments);
            this.ctx.closePath();
            this.ctx.clip();
            
            // Draw pattern
            for (let i = 0; i < this.bufferLength; i += 4) {
                const amplitude = this.dataArray[i] / 255;
                const angle = (i / this.bufferLength) * Math.PI * 2 + this.time;
                const radius = amplitude * 100 + 20;
                
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, amplitude * 8 + 2, 0, Math.PI * 2);
                this.ctx.fillStyle = `hsla(${i * 2 + this.time * 50}, 80%, 70%, ${amplitude})`;
                this.ctx.fill();
            }
            
            this.ctx.restore();
        }
        
        this.ctx.restore();
    }
    
    drawLiquidFlow() {
        const avgAmplitude = this.dataArray.reduce((a, b) => a + b, 0) / this.bufferLength / 255;
        
        // Update liquid points
        this.liquidPoints.forEach((point, index) => {
            const frequencyIndex = Math.floor((index / this.liquidPoints.length) * this.bufferLength);
            const intensity = this.dataArray[frequencyIndex] / 255;
            
            point.vx += (Math.random() - 0.5) * 0.1;
            point.vy += (Math.random() - 0.5) * 0.1;
            point.x += point.vx * (1 + intensity);
            point.y += point.vy * (1 + intensity);
            
            // Boundary wrapping
            if (point.x < 0) point.x = this.canvas.width;
            if (point.x > this.canvas.width) point.x = 0;
            if (point.y < 0) point.y = this.canvas.height;
            if (point.y > this.canvas.height) point.y = 0;
            
            // Draw connections to nearby points
            point.connections = [];
            this.liquidPoints.forEach((other, otherIndex) => {
                if (index !== otherIndex) {
                    const dx = point.x - other.x;
                    const dy = point.y - other.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 80 + intensity * 50) {
                        point.connections.push(other);
                    }
                }
            });
        });
        
        // Draw connections
        this.liquidPoints.forEach(point => {
            point.connections.forEach(other => {
                this.ctx.beginPath();
                this.ctx.moveTo(point.x, point.y);
                this.ctx.lineTo(other.x, other.y);
                this.ctx.strokeStyle = `hsla(200, 70%, 60%, ${0.2 + avgAmplitude * 0.3})`;
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            });
        });
        
        // Draw points
        this.liquidPoints.forEach((point, index) => {
            const frequencyIndex = Math.floor((index / this.liquidPoints.length) * this.bufferLength);
            const intensity = this.dataArray[frequencyIndex] / 255;
            
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, point.size * (0.5 + intensity), 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(200, 70%, ${40 + intensity * 40}%, ${0.6 + intensity * 0.4})`;
            this.ctx.fill();
        });
    }
    
    drawNeonGlow() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Create bright neon lines
        for (let i = 0; i < this.bufferLength; i += 2) {
            const amplitude = this.dataArray[i] / 255;
            const angle = (i / this.bufferLength) * Math.PI * 2 + this.time;
            const radius = 50 + amplitude * 150;
            
            const x1 = centerX + Math.cos(angle) * 30;
            const y1 = centerY + Math.sin(angle) * 30;
            const x2 = centerX + Math.cos(angle) * radius;
            const y2 = centerY + Math.sin(angle) * radius;
            
            // Outer glow
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.strokeStyle = `hsla(${i * 3 + this.time * 50}, 100%, 50%, 0.1)`;
            this.ctx.lineWidth = 20;
            this.ctx.stroke();
            
            // Middle glow
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.strokeStyle = `hsla(${i * 3 + this.time * 50}, 100%, 60%, 0.3)`;
            this.ctx.lineWidth = 8;
            this.ctx.stroke();
            
            // Inner bright line
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.strokeStyle = `hsla(${i * 3 + this.time * 50}, 100%, 80%, 0.9)`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
        
        // Add pulsing center
        const avgAmplitude = this.dataArray.reduce((a, b) => a + b, 0) / this.bufferLength / 255;
        const glowSize = 20 + avgAmplitude * 30;
        
        // Outer glow
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, glowSize * 2, 0, Math.PI * 2);
        this.ctx.fillStyle = `hsla(${this.time * 100}, 100%, 50%, 0.1)`;
        this.ctx.fill();
        
        // Inner glow
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, glowSize, 0, Math.PI * 2);
        this.ctx.fillStyle = `hsla(${this.time * 100}, 100%, 70%, 0.5)`;
        this.ctx.fill();
        
        // Bright center
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, glowSize * 0.3, 0, Math.PI * 2);
        this.ctx.fillStyle = `hsla(${this.time * 100}, 100%, 90%, 0.9)`;
        this.ctx.fill();
    }
    
    clearCanvas() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    updateStatus(message) {
        document.getElementById('status').textContent = message;
    }
}

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MusicVisualizer();
});

// Handle user gesture requirement for audio context
document.addEventListener('click', async () => {
    if (window.audioContext && window.audioContext.state === 'suspended') {
        await window.audioContext.resume();
    }
}, { once: true });