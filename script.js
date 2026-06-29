document.getElementById('drawBtn').addEventListener('click', drawShape);

// Draw an initial shape on load
window.onload = drawShape;

function drawShape() {
    const canvas = document.getElementById('shapeCanvas');
    const ctx = canvas.getContext('2d');
    
    // Get user input and ensure it's a valid number
    const sides = parseInt(document.getElementById('sideCount').value);
    
    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (isNaN(sides) || sides < 3) {
        alert("Please enter a number of lines/sides greater than or equal to 3.");
        return;
    }

    // Settings for the shape
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 180; // Size of the figure
    
    ctx.beginPath();
    
    // Loop through each line/vertex
    for (let i = 0; i <= sides; i++) {
        // Calculate the angle for the current point in radians
        // Subtracting Math.PI / 2 points the first vertex straight up
        const angle = (i * 2 * Math.PI / sides) - (Math.PI / 2);
        
        // Calculate (x, y) coordinates using trigonometry
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        if (i === 0) {
            ctx.moveTo(x, y); // Move to the starting point
        } else {
            ctx.lineTo(x, y); // Draw a line to the next point
        }
    }
    
    // Styling the drawn figure
    ctx.closePath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#007bff';
    ctx.fillStyle = 'rgba(0, 123, 255, 0.1)';
    
    ctx.fill();
    ctx.stroke();
}