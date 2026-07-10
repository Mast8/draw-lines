// Cache UI Elements globally to prevent repetitive DOM queries
const canvas = document.getElementById('shapeCanvas');
const ctx = canvas.getContext('2d');

const sideInput = document.getElementById('sideCount');
const skipInput = document.getElementById('skipCount');
const speedInput = document.getElementById('speedCtrl');
const glowInput = document.getElementById('glowCtrl');
const colorButton = document.getElementById('colorBtn'); 
const drawButton = document.getElementById('drawBtn');

const sideVal = document.getElementById('sideVal');
const skipVal = document.getElementById('skipVal');
const glowVal = document.getElementById('glowVal');

const exportButton = document.getElementById('exportBtn');

// Track the active state globally
let currentHue = 280; 
let animationId = null;
let isAnimationComplete = false;

let points = [];
let sides = 0;
let skip = 0;
let totalSteps = 0;
let glowAmount = 0;
let currentStep = 0;
let currentLine = 0;

// Setup Event Listeners
drawButton.addEventListener('click', startDrawing);

colorButton.addEventListener('click', () => {
    currentHue = (currentHue + 60) % 360; 
    if (isAnimationComplete) {
        renderFrame(sides, 0); // Instantly redraw full shape with new color
    }
});

// Live updates on slider interaction
sideInput.addEventListener('input', () => { 
    updateSliders(); 
    startDrawing(); 
});

skipInput.addEventListener('input', () => { 
    skipVal.innerText = skipInput.value; 
    startDrawing(); 
});

speedInput.addEventListener('input', () => {
    // Safely alter speed mid-animation, ensuring steps never drop below 1
    totalSteps = Math.max(1, 131 - parseInt(speedInput.value, 10));
});

glowInput.addEventListener('input', () => { 
    glowAmount = parseInt(glowInput.value, 10) || 0;
    glowVal.innerText = glowAmount;
    if (isAnimationComplete) renderFrame(sides, 0);
});

window.onload = () => {
    updateSliders();
    startDrawing();
};

function updateSliders() {
    sideVal.innerText = sideInput.value;
    
    // Mathematically restrict skip factor up to half of the side count
    const maxSkip = Math.max(1, Math.floor(parseInt(sideInput.value, 10) / 2));
    skipInput.max = maxSkip;
    if (parseInt(skipInput.value, 10) > maxSkip) {
        skipInput.value = maxSkip;
    }
    skipVal.innerText = skipInput.value;
}

// Reusable canvas state configurations
function applyCanvasStyles() {
    const strokeColor = `hsl(${currentHue}, 95%, 60%)`;
    ctx.shadowBlur = isAnimationComplete ? 0 : glowAmount; 
    if (!isAnimationComplete) ctx.shadowColor = strokeColor;
    
    ctx.lineWidth = 4;
    ctx.strokeStyle = strokeColor;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
}

function startDrawing() {
    if (animationId) cancelAnimationFrame(animationId);
    isAnimationComplete = false;

    sides = parseInt(sideInput.value, 10) || 3;
    skip = parseInt(skipInput.value, 10) || 1;
    // Defensive check to avoid 0 or negative steps
    totalSteps = Math.max(1, 131 - parseInt(speedInput.value, 10)); 
    glowAmount = parseInt(glowInput.value, 10) || 0;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 200; 
    
    points = [];
    // Changed loop to i < sides so we don't duplicate the start point or overrun array indices
    for (let i = 0; i < sides; i++) {
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

// Fixed rendering logic with reliable path closing and stroke execution
function renderFrame(completedLines, progress = 0) {
    if (points.length === 0) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    applyCanvasStyles();

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    // Draw fully completed lines
    for (let i = 1; i <= completedLines; i++) {
        // Use modulo to safely wrap back to the start point cleanly
        const pt = points[i % sides];
        ctx.lineTo(pt.x, pt.y);
    }

    // Handle actively animating line segment
    if (completedLines < sides) {
        const startPt = points[completedLines % sides];
        const endPt = points[(completedLines + 1) % sides];
        
        if (progress > 0 && endPt) {
            const currentX = startPt.x + (endPt.x - startPt.x) * progress;
            const currentY = startPt.y + (endPt.y - startPt.y) * progress;
            ctx.lineTo(currentX, currentY);
        }
        ctx.stroke(); // CRITICAL FIX: Ensure stroke happens even if progress is 0
    } else {
        ctx.closePath();
        ctx.fillStyle = `hsl(${currentHue}, 95%, 60%, 0.08)`;
        ctx.fill();
        ctx.stroke();
    }
}

function animate() {
    const progress = currentStep / totalSteps;
    renderFrame(currentLine, progress);

    if (currentLine < sides) {
        currentStep++;
        if (currentStep > totalSteps) {
            currentStep = 0;
            currentLine++;
        }
        animationId = requestAnimationFrame(animate);
    } else {
        isAnimationComplete = true;
        renderFrame(sides, 0); // Final solid pass
    }
}

exportButton.addEventListener('click', () => {
    if (points.length === 0) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.fillStyle = '#121214'; 
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, 0);

    const imageURL = tempCanvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = imageURL;
    
    downloadLink.download = `geometric-art-${sideInput.value}sides-skip${skipInput.value}.png`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
});