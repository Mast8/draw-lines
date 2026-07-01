document.getElementById('drawBtn').addEventListener('click', startDrawing);

// Draw an initial shape on load
window.onload = startDrawing;

// Global variables to handle animation tracking
let animationId = null; 

function startDrawing() {
    // If a previous animation is running, cancel it
    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    const canvas = document.getElementById('shapeCanvas');
    const ctx = canvas.getContext('2d');
    const sides = parseInt(document.getElementById('sideCount').value);
    
    if (isNaN(sides) || sides < 3) {
        alert("Please enter a number of lines/sides greater than or equal to 3.");
        return;
    }

    // Generate a random nice color for this specific shape
    const randomHue = Math.floor(Math.random() * 360);
    const strokeColor = `hsl(${randomHue}, 80%, 50%)`;
    const fillColor = `hsl(${randomHue}, 80%, 50%, 0.15)`;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 180;
    
    // Generate all the points for the shape upfront
    const points = [];
    for (let i = 0; i <= sides; i++) {
        const angle = (i * 2 * Math.PI / sides) - (Math.PI / 2);
        points.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        });
    }

    let currentStep = 0;
    const totalSteps = 60; // How smooth/slow the drawing is per line (60 frames)
    let currentLine = 0;

    function animate() {
        // Clear canvas slightly to allow redrawing, but keep it clean
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 1. Draw all previously completed lines
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i <= currentLine; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        
        // 2. Animate the *current* line growing toward the next vertex
        if (currentLine < sides) {
            const startPt = points[currentLine];
            const endPt = points[currentLine + 1];
            
            // Calculate progress fraction (0.0 to 1.0)
            const progress = currentStep / totalSteps; 
            
            // Linear interpolation to find the current line tip
            const currentX = startPt.x + (endPt.x - startPt.x) * progress;
            const currentY = startPt.y + (endPt.y - startPt.y) * progress;
            
            ctx.lineTo(currentX, currentY);
            
            ctx.lineWidth = 4;
            ctx.strokeStyle = strokeColor;
            ctx.stroke();
            
            currentStep++;
            
            // Once the line reaches the destination vertex, move to the next line
            if (currentStep > totalSteps) {
                currentStep = 0;
                currentLine++;
            }
            
            // Request the next frame of the animation
            animationId = requestAnimationFrame(animate);
        } else {
            // 3. Animation finished! Close the path and fill it in.
            ctx.closePath();
            ctx.lineWidth = 4;
            ctx.strokeStyle = strokeColor;
            ctx.fillStyle = fillColor;
            ctx.fill();
            ctx.stroke();
        }
    }

    // Kick off the animation loop
    animate();
}