document.getElementById('drawBtn').addEventListener('click', startDrawing);

// Dynamic UI updates for slider values
const sideInput = document.getElementById('sideCount');
const skipInput = document.getElementById('skipCount');
const sideVal = document.getElementById('sideVal');
const skipVal = document.getElementById('skipVal');

function updateSliders() {
    sideVal.innerText = sideInput.value;
    // The skip step shouldn't realistically exceed half the total sides to make sense mathematically
    const maxSkip = Math.max(1, Math.floor(parseInt(sideInput.value) / 2));
    skipInput.max = maxSkip;
    if (parseInt(skipInput.value) > maxSkip) {
        skipInput.value = maxSkip;
    }
    skipVal.innerText = skipInput.value;
}

sideInput.addEventListener('input', () => { updateSliders(); startDrawing(); });
skipInput.addEventListener('input', () => { skipVal.innerText = skipInput.value; startDrawing(); });
document.getElementById('speedCtrl').addEventListener('input', startDrawing);

// Draw an initial shape on load
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
    const totalSteps = 130 - parseInt(document.getElementById('speedCtrl').value); // Inverts slider so higher = faster

    // Generate random neon-leaning color
    const randomHue = Math.floor(Math.random() * 360);
    const strokeColor = `hsl(${randomHue}, 95%, 60%)`;
    const fillColor = `hsl(${randomHue}, 95%, 60%, 0.08)`;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 200; 
    
    // Generate star/polygon vertices using the skip factor
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
        
        // Setup glow styling properties
        ctx.shadowBlur = 15;
        ctx.shadowColor = strokeColor;
        ctx.lineWidth = 4;
        ctx.strokeStyle = strokeColor;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // 1. Draw all previously completed lines
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i <= currentLine; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        
        // 2. Animate the current line progressing
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
            // 3. Animation finished - Close, Fill and final Stroke
            ctx.closePath();
            ctx.fillStyle = fillColor;
            ctx.fill();
            ctx.stroke();
            
            // Reset shadows after finishing so it stays clean
            ctx.shadowBlur = 0;
        }
    }

    animate();
}