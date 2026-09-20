// ==========================================
// BOUQUET EXPERIENCE CONTROLLER & SOUND ENGINE
// ==========================================

// 1. Web Audio API Bloom Sound Synthesizer
class SoundController {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playTone(freq, time, duration = 1.2, type = 'sine', volume = 0.12) {
        if (!this.enabled || !this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.001, time);
        gain.gain.exponentialRampToValueAtTime(volume, time + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + duration);
    }

    // Play sparkling blooming arpeggio (Harp / Celesta chords)
    playBloomArpeggio() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        // Pentatonic romantic notes: F4, G4, A4, C5, D5, E5, G5, A5, C6, E6
        const chord = [349.23, 392.00, 440.0, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.5, 1318.51];
        chord.forEach((freq, idx) => {
            this.playTone(freq, now + idx * 0.24, 1.4, 'sine', 0.09);
            // Soft celesta sparkle overtone
            this.playTone(freq * 1.5, now + idx * 0.24 + 0.03, 0.8, 'triangle', 0.035);
        });
    }

    // Play chime for opening gift card
    playCardChime() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
            this.playTone(freq, now + idx * 0.12, 1.1, 'sine', 0.09);
        });
    }

    // Soft chime when hovering on a blossom
    playHoverChime() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const tones = [659.25, 783.99, 880.0, 1046.5];
        const randomTone = tones[Math.floor(Math.random() * tones.length)];
        this.playTone(randomTone, this.ctx.currentTime, 0.6, 'sine', 0.04);
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

const sound = new SoundController();

// Sound Toggle Button Handler
const soundToggle = document.getElementById("soundToggle");
const soundIcon = document.getElementById("soundIcon");
const soundLabel = document.getElementById("soundLabel");

soundToggle.addEventListener("click", () => {
    sound.init();
    const isEnabled = sound.toggle();
    if (isEnabled) {
        soundIcon.textContent = "🔔";
        soundLabel.textContent = "Sound: On";
        sound.playTone(659.25, sound.ctx.currentTime, 0.4);
    } else {
        soundIcon.textContent = "🔕";
        soundLabel.textContent = "Sound: Muted";
    }
});

// Auto-trigger bloom sound on first user gesture or after slight delay
let hasBloomedAudio = false;
function triggerBloomSoundOnce() {
    if (!hasBloomedAudio) {
        hasBloomedAudio = true;
        sound.playBloomArpeggio();
    }
}

window.addEventListener("click", triggerBloomSoundOnce, { once: true });
window.addEventListener("touchstart", triggerBloomSoundOnce, { once: true });

// Schedule audio start if autoplay permitted
setTimeout(() => {
    try {
        sound.init();
        if (sound.ctx && sound.ctx.state === 'running') {
            triggerBloomSoundOnce();
        }
    } catch (e) {}
}, 600);


// ==========================================
// 2. CANVAS PARTICLES: PETALS & GOLDEN POLLEN
// ==========================================

const canvas = document.getElementById("ambientCanvas");
const ctx = canvas.getContext("2d");

let width, height;
let particles = [];

function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class FloatingPetal {
    constructor(isBurst = false) {
        this.reset(isBurst);
    }

    reset(isBurst = false) {
        if (isBurst) {
            this.x = width / 2 + (Math.random() - 0.5) * 200;
            this.y = height / 2 + (Math.random() - 0.5) * 100;
            this.speedX = (Math.random() - 0.5) * 8;
            this.speedY = (Math.random() - 0.5) * 6 - 2;
            this.size = Math.random() * 16 + 12;
            this.opacity = 1;
        } else {
            this.x = Math.random() * width;
            this.y = Math.random() * -50;
            this.speedX = Math.random() * 1.5 - 0.5;
            this.speedY = Math.random() * 1.2 + 0.7;
            this.size = Math.random() * 14 + 8;
            this.opacity = Math.random() * 0.55 + 0.35;
        }

        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 1.8;
        this.swaySpeed = Math.random() * 0.02 + 0.01;
        this.swayOffset = Math.random() * Math.PI * 2;
        this.type = Math.random() > 0.3 ? "petal" : "sparkle";

        // Color palettes
        const petalGradients = [
            ["#ffa8c0", "#e24c75"],
            ["#ffd4e0", "#f486a4"],
            ["#fed5c8", "#e66c58"],
            ["#ffffff", "#fedee7"]
        ];
        this.gradientColors = petalGradients[Math.floor(Math.random() * petalGradients.length)];
    }

    update() {
        this.swayOffset += this.swaySpeed;
        this.x += this.speedX + Math.sin(this.swayOffset) * 0.9;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        if (this.y > height + 30 || this.x < -40 || this.x > width + 40) {
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;

        if (this.type === "sparkle") {
            // Golden pollen sparkle
            ctx.fillStyle = "#ffd56b";
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(1.5, this.size * 0.2), 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Organic petal
            const grad = ctx.createLinearGradient(0, -this.size, 0, this.size);
            grad.addColorStop(0, this.gradientColors[0]);
            grad.addColorStop(1, this.gradientColors[1]);

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(0, -this.size);
            ctx.bezierCurveTo(this.size * 0.75, -this.size * 0.4, this.size * 0.85, this.size * 0.6, 0, this.size);
            ctx.bezierCurveTo(-this.size * 0.85, this.size * 0.6, -this.size * 0.75, -this.size * 0.4, 0, -this.size);
            ctx.fill();
        }

        ctx.restore();
    }
}

// Initialize particles
const TOTAL_PARTICLES = 28;
for (let i = 0; i < TOTAL_PARTICLES; i++) {
    const p = new FloatingPetal();
    p.y = Math.random() * height; // distribute initially
    particles.push(p);
}

function burstPetals(count = 35) {
    for (let i = 0; i < count; i++) {
        particles.push(new FloatingPetal(true));
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, width, height);

    // Keep particles array bounded
    if (particles.length > 70) {
        particles.splice(0, particles.length - 60);
    }

    for (let p of particles) {
        p.update();
        p.draw();
    }
    requestAnimationFrame(animateParticles);
}

animateParticles();


// ==========================================
// 3. FLOWER HOVER & BOTANICAL MEANING TOOLTIP
// ==========================================

const tooltip = document.getElementById("flowerTooltip");
const tooltipName = document.getElementById("tooltipName");
const tooltipMeaning = document.getElementById("tooltipMeaning");
const bouquetStage = document.getElementById("bouquetStage");

function bindFlowerEvents(flowers) {
    flowers.forEach((flower) => {
        flower.addEventListener("mouseenter", (e) => {
            const name = flower.getAttribute("data-name");
            const meaning = flower.getAttribute("data-meaning");

            if (name && meaning) {
                tooltipName.textContent = name;
                tooltipMeaning.textContent = meaning;
                tooltip.classList.add("visible");
                sound.playHoverChime();
            }
        });

        flower.addEventListener("mousemove", (e) => {
            const stageRect = bouquetStage.getBoundingClientRect();
            const mouseX = e.clientX - stageRect.left;
            const mouseY = e.clientY - stageRect.top;

            let posX = mouseX + 15;
            let posY = mouseY - 45;

            if (posX + 220 > stageRect.width) {
                posX = mouseX - 225;
            }

            tooltip.style.left = `${posX}px`;
            tooltip.style.top = `${posY}px`;
        });

        flower.addEventListener("mouseleave", () => {
            tooltip.classList.remove("visible");
        });
    });
}

bindFlowerEvents(document.querySelectorAll(".flower-bloom"));


// ==========================================
// 4. RE-BLOOM CONTROLLER
// ==========================================

const replayBtn = document.getElementById("replayBtn");

replayBtn.addEventListener("click", () => {
    sound.init();
    sound.playBloomArpeggio();
    burstPetals(25);

    const currentSvg = document.getElementById("bouquetSvg");
    if (!currentSvg) return;

    currentSvg.classList.remove("bouquet-sway");
    const clone = currentSvg.cloneNode(true);
    currentSvg.parentNode.replaceChild(clone, currentSvg);

    // Reattach listeners to new DOM nodes
    bindFlowerEvents(clone.querySelectorAll(".flower-bloom"));

    const newTuckedCard = clone.querySelector("#tuckedCard");
    if (newTuckedCard) {
        newTuckedCard.addEventListener("click", openCardModal);
    }

    // Re-enable gentle breeze sway after bloom finishes
    setTimeout(() => {
        clone.classList.add("bouquet-sway");
    }, 3200);
});

// Enable sway after initial load
setTimeout(() => {
    const svg = document.getElementById("bouquetSvg");
    if (svg) svg.classList.add("bouquet-sway");
}, 3200);



// ==========================================
// 5. HEARTFELT GIFT NOTE CARD MODAL
// ==========================================

const tuckedCard = document.getElementById("tuckedCard");
const cardBtn = document.getElementById("cardBtn");
const cardModal = document.getElementById("cardModal");
const modalBackdrop = document.getElementById("modalBackdrop");
const closeCardBtn = document.getElementById("closeCardBtn");

const letterText = document.getElementById("letterText");
const letterEditArea = document.getElementById("letterEditArea");
const customMessageInput = document.getElementById("customMessageInput");
const editMessageBtn = document.getElementById("editMessageBtn");
const saveMessageBtn = document.getElementById("saveMessageBtn");
const sprinkleConfettiBtn = document.getElementById("sprinkleConfettiBtn");
const currentDateEl = document.getElementById("currentDate");

// Format date nicely
const now = new Date();
const formattedDate = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
});
if (currentDateEl) {
    currentDateEl.textContent = `Special Delivery • ${formattedDate}`;
}

// Load saved message if available
const savedMessage = localStorage.getItem("bouquet_custom_letter");
if (savedMessage) {
    letterText.innerHTML = savedMessage.replace(/\n/g, "<br>");
}

function openCardModal() {
    sound.init();
    sound.playCardChime();
    burstPetals(20);
    cardModal.classList.add("open");
}

function closeCardModal() {
    cardModal.classList.remove("open");
}

if (tuckedCard) tuckedCard.addEventListener("click", openCardModal);
if (cardBtn) cardBtn.addEventListener("click", openCardModal);
if (closeCardBtn) closeCardBtn.addEventListener("click", closeCardModal);
if (modalBackdrop) modalBackdrop.addEventListener("click", closeCardModal);

// Close on Escape key
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && cardModal.classList.contains("open")) {
        closeCardModal();
    }
});

// Edit & Save Message
editMessageBtn.addEventListener("click", () => {
    customMessageInput.value = letterText.innerText;
    letterText.style.display = "none";
    letterEditArea.style.display = "block";
    editMessageBtn.style.display = "none";
    saveMessageBtn.style.display = "inline-block";
    customMessageInput.focus();
});

saveMessageBtn.addEventListener("click", () => {
    const newMsg = customMessageInput.value.trim();
    if (newMsg) {
        letterText.innerHTML = newMsg.replace(/\n/g, "<br>");
        localStorage.setItem("bouquet_custom_letter", newMsg);
    }
    letterText.style.display = "block";
    letterEditArea.style.display = "none";
    editMessageBtn.style.display = "inline-block";
    saveMessageBtn.style.display = "none";
    sound.playTone(783.99, sound.ctx ? sound.ctx.currentTime : 0, 0.4);
    burstPetals(15);
});

// Sprinkle Petals from Card
sprinkleConfettiBtn.addEventListener("click", () => {
    sound.init();
    sound.playHoverChime();
    burstPetals(40);
});
