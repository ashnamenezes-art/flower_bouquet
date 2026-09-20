// Canvas Floating Petals Animation
const canvas = document.getElementById("petalsCanvas");
const ctx = canvas.getContext("2d");

let width, height;
let petals = [];

function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class Petal {
    constructor() {
        this.reset(true);
    }

    reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : -20;
        this.size = Math.random() * 12 + 10;
        this.speedX = Math.random() * 1.5 - 0.5;
        this.speedY = Math.random() * 1.2 + 0.8;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 1.5;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.swaySpeed = Math.random() * 0.02 + 0.01;
        this.swayOffset = Math.random() * Math.PI * 2;
        this.colorIndex = Math.floor(Math.random() * 3);
    }

    update() {
        this.swayOffset += this.swaySpeed;
        this.x += this.speedX + Math.sin(this.swayOffset) * 0.8;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        if (this.y > height + 20 || this.x < -30 || this.x > width + 30) {
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;

        // Colors: soft blush, deep rose, petal champagne
        const colors = [
            ["#ffaec5", "#e87a9e"],
            ["#ffd1df", "#f492b4"],
            ["#ffe6ed", "#f0a8c2"]
        ];

        const [startColor, endColor] = colors[this.colorIndex];
        const grad = ctx.createLinearGradient(0, -this.size, 0, this.size);
        grad.addColorStop(0, startColor);
        grad.addColorStop(1, endColor);

        ctx.fillStyle = grad;
        ctx.beginPath();
        // Delicate curved petal shape
        ctx.moveTo(0, -this.size);
        ctx.bezierCurveTo(this.size * 0.7, -this.size * 0.5, this.size * 0.8, this.size * 0.6, 0, this.size);
        ctx.bezierCurveTo(-this.size * 0.8, this.size * 0.6, -this.size * 0.7, -this.size * 0.5, 0, -this.size);
        ctx.fill();

        ctx.restore();
    }
}

// Populate petals
const PETAL_COUNT = 24;
for (let i = 0; i < PETAL_COUNT; i++) {
    petals.push(new Petal());
}

function animatePetals() {
    ctx.clearRect(0, 0, width, height);
    for (let petal of petals) {
        petal.update();
        petal.draw();
    }
    requestAnimationFrame(animatePetals);
}

animatePetals();

// Navigation transition
const openButton = document.getElementById("openButton");
const welcomeContainer = document.querySelector(".welcome-container");

openButton.addEventListener("click", function () {
    welcomeContainer.classList.add("fade-out");

    setTimeout(function () {
        window.location.href = "bouquet.html";
    }, 650);
});