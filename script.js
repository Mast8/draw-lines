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

// NEW EVENT: Cycle color on button click
colorButton.addEventListener('click', () => {
    // Jump by 60 degrees to get a distinctly different neon color block
    currentHue = (currentHue + 60) % 360; 
    startDrawing();
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

let animationId = null; 

function startDrawing() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    const canvas = document.getElementById('shapeCanvas');
    const ctx = canvas.getContext('2d');
    
    const sides = parseInt(sideInput.value);
    const skip = parseInt(skipInput.value);
    const totalSteps = 130 - parseInt(speedInput.value); 
    const glowAmount = parseInt(glowInput.value);

    // Uses the currentHue updated by your button clicks
    const strokeColor = `hsl(${currentHue}, 95%, 60%)`;
    const fillColor = `hsl(${currentHue}, 95%, 60%, 0.08)`;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 200; 
    
    const points = [];
    for (let i = 0; i <= sides; i++) {
        const angle = ((i * skip) * 2 * Math.PI / sides) - (Math.PI / 2);
        points.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        });
    }

    let currentStep = 0;
    let currentLine = 0;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
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
        }
    }

    animate();
}