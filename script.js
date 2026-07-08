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
sideInput.addEventListener('input', () => { updateSliders(); startDrawing(); });
skipInput.addEventListener('input', () => { skipVal.innerText = skipInput.value; startDrawing(); });
speedInput.addEventListener('input', () => {
    // Dynamically alter speed mid-animation
    totalSteps = 131 - parseInt(speedInput.value);
});
glowInput.addEventListener('input', () => { 
    glowAmount = parseInt(glowInput.value);
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
    const maxSkip = Math.max(1, Math.floor(parseInt(sideInput.value) / 2));
    skipInput.max = maxSkip;
    if (parseInt(skipInput.value) > maxSkip) {
        skipInput.value = maxSkip;
    }
    skipVal.innerText = skipInput.value;
}

// DRY Optimization: Reusable canvas state configurations
function applyCanvasStyles() {
    const strokeColor = `hsl(${currentHue}, 95%, 60%)`;
    ctx.shadowBlur = isAnimationComplete ? 0 : glowAmount; // Remove shadow blur calculation load if complete
    if (!isAnimationComplete) ctx.shadowColor = strokeColor;
    
    ctx.lineWidth = 4;
    ctx.strokeStyle = strokeColor;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
}

function startDrawing() {
    if (animationId) cancelAnimationFrame(animationId);
    isAnimationComplete = false;

    sides = parseInt(sideInput.value);
    skip = parseInt(skipInput.value);
    totalSteps = 131 - parseInt(speedInput.value); 
    glowAmount = parseInt(glowInput.value);

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

// Shared renderer for clean code structure
function renderFrame(completedLines, progress = 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    applyCanvasStyles();

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i <= completedLines; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }

    if (completedLines < sides && progress > 0) {
        const startPt = points[completedLines];
        const endPt = points[completedLines + 1];
        const currentX = startPt.x + (endPt.x - startPt.x) * progress;
        const currentY = startPt.y + (endPt.y - startPt.y) * progress;
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
    } else if (completedLines >= sides) {
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
        renderFrame(sides, 0); // Clean up the final render state
    }
}

exportButton.addEventListener('click', () => {
    // Optional check: Ensure points exist before trying to download a blank canvas
    if (points.length === 0) return;

    // Create a temporary, off-screen canvas matching your exact canvas dimensions
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    // Draw a solid dark background on the temporary canvas to preserve the neon contrast
    tempCtx.fillStyle = '#121214'; // Match this to your webpage container background color
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw your active canvas directly on top of that dark background
    tempCtx.drawImage(canvas, 0, 0);

    // Convert the merged image data into a downloadable PNG URL
    const imageURL = tempCanvas.toDataURL('image/png');

    // Create a temporary hidden link element to force-trigger the browser download download
    const downloadLink = document.createElement('a');
    downloadLink.href = imageURL;
    
    // Generate a clean, descriptive file name showing the shape settings
    const sidesName = sideInput.value;
    const skipName = skipInput.value;
    downloadLink.download = `geometric-art-${sidesName}sides-skip${skipName}.png`;

    // Programmatically click the link to save the file, then remove it from memory
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
});