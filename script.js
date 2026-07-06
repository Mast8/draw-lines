document.getElementById('drawBtn').addEventListener('click', startDrawing);

// UI Element selectors
const sideInput = document.getElementById('sideCount');
const skipInput = document.getElementById('skipCount');
const speedInput = document.getElementById('speedCtrl');
const glowInput = document.getElementById('glowCtrl');
const colorButton = document.getElementById('colorBtn'); 

const sideVal = document.getElementById('sideVal');
const skipVal = document.getElementById('skipVal');
const glowVal = document.getElementById('glowVal');

// Track the active color hue globally
let currentHue = 280; 
let animationId = null;
let isAnimationComplete = false; // Tracks if the shape is fully rendered

function updateSliders() {
    sideVal.innerText = sideInput.value;
    glowVal.innerText = glowInput.value;
    
    // Mathematically restrict skip factor up to half of the side count
    const maxSkip = Math.max(1, Math.floor(parseInt(sideInput.value) / 2));
    skipInput.max = maxSkip;
    if (parseInt(skipInput.value) > maxSkip) {
        skipInput.value = maxSkip;
    }
    skipVal.innerText = skipInput.value;
}

// FIXED EVENT: Changes color instantly without resetting the drawing progress
colorButton.addEventListener('click', () => {
    // Jump by 60 degrees to get a distinctly different neon color block
    currentHue = (currentHue + 60) % 360; 
    
    // If the animation is already finished, force a single redraw frame to apply the color instantly
    if (isAnimationComplete) {
        redrawStatic();
    }
});

// Event Listeners for real-time dynamic rendering
sideInput.addEventListener('input', () => { updateSliders(); startDrawing(); });
skipInput.addEventListener('input', () => { skipVal.innerText = skipInput.value; startDrawing(); });
speedInput.addEventListener('input', startDrawing);
glowInput.addEventListener('input', () => { updateSliders(); startDrawing(); });

window.onload = () => {
    updateSliders();
    startDrawing();
};

// Global variables to hold the current drawing state, allowing on-the-fly color updates
let points = [];
let sides = 0;
let skip = 0;
let totalSteps = 0;
let glowAmount = 0;
let currentStep = 0;
let currentLine = 0;

function startDrawing() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    isAnimationComplete = false;

    sides = parseInt(sideInput.value);
    skip = parseInt(skipInput.value);
    totalSteps = 130 - parseInt(speedInput.value); 
    glowAmount = parseInt(glowInput.value);

    const canvas = document.getElementById('shapeCanvas');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 200; 
    
    points = [];
    for (let i = 0; i <= sides; i++) {
        const angle = ((i * skip) * 2 * Math.PI / sides) - (Math.PI / 2);
        points.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        });
    }

    currentStep = 0;
    currentLine = 0;

    animate();
}

function animate() {
    const canvas = document.getElementById('shapeCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Generate fresh color values on every frame loop invocation
    const strokeColor = `hsl(${currentHue}, 95%, 60%)`;
    const fillColor = `hsl(${currentHue}, 95%, 60%, 0.08)`;
    
    ctx.shadowBlur = glowAmount;
    ctx.shadowColor = strokeColor;
    ctx.lineWidth = 4;
    ctx.strokeStyle = strokeColor;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i <= currentLine; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    
    if (currentLine < sides) {
        const startPt = points[currentLine];
        const endPt = points[currentLine + 1];
        
        const progress = currentStep / totalSteps; 
        
        const currentX = startPt.x + (endPt.x - startPt.x) * progress;
        const currentY = startPt.y + (endPt.y - startPt.y) * progress;
        
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        
        currentStep++;
        
        if (currentStep > totalSteps) {
            currentStep = 0;
            currentLine++;
        }
        
        animationId = requestAnimationFrame(animate);
    } else {
        ctx.closePath();
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        isAnimationComplete = true; // Mark as complete so color changes render instantly when idle
    }
}

// Helper function to redraw the final canvas state instantly when a user changes colors after execution completes
function redrawStatic() {
    const canvas = document.getElementById('shapeCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const strokeColor = `hsl(${currentHue}, 95%, 60%)`;
    const fillColor = `hsl(${currentHue}, 95%, 60%, 0.08)`;
    
    ctx.shadowBlur = glowAmount;
    ctx.shadowColor = strokeColor;
    ctx.lineWidth = 4;
    ctx.strokeStyle = strokeColor;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i <= sides; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
}