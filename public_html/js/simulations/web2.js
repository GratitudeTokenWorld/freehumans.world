import { $, $$ } from '/js/selectors.js';

export const web2 = () => {

    $('#configForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const canvas = $('#simulationCanvas');
        const ctx = canvas.getContext('2d');

        let config = {}

        let updateConfig = () => {

            // const config = {
            //     ghosting: false,
            //     textColor: "rgb(255,255,255)",
            //     fillColor: "rgb(0,0,0)",
            //     particleTextColor: 'rgb(255,255,255)',
            //     borderColor: "rgb(255,255,255)",
            //     borderThickness: 1,
            //     lineThickness: 3, // Example line thickness
            //     initialParticleSizes: [1, 2, 3, 4],
            //     maxParticles: 1000, // Maximum number of particles allowed
            //     sizeRange: { min: 1, max: 23 }, // size range for new particles, additional to initial particles
            //     precision: 8, // Number of decimal places
            //     maxParticleSize: 2300, // Example maximum size
            //     enableMovement: true, // Set to false to disable movement
            //     movementSpeed: 0.5, // movement rate
            //     collisionResponse: 1, // Standard elastic collision response
            //     newParticleFrequency: { min: 1, max: 6 }, // Random interval for introduction of new particles, in frames, higher is slower
            //     reselectionInterval: [0, 3, 23], // [fixed, randomMin, randomMax]
            //     spendingAmount: [0, 0, 0, 23], // [minAmount, maxAmount, minInterval, maxInterval]
            //     withdrawAmount: [0, 0, 23, 23000], // [minPercent, maxPercent, minInterval, maxInterval]
            //     shareRange: { min: 0, max: 0, tokensMin: 0 }, // by every additional particle to the initial particles
            //     gainRange: { min: 0.01, max: 1 } // gain is only for the initial particles
            // }

            // Initialize nested objects first
            config.sizeRange = config.sizeRange || {};
            config.newParticleFrequency = config.newParticleFrequency || {};
            config.reselectionInterval = config.reselectionInterval || [];

            // Update config object with form values
            config.ghosting = $('#ghosting').checked;
            config.textColor = $('#textColor').value;
            config.fillColor = $('#fillColor').value;
            config.particleTextColor = $('#particleTextColor').value;
            config.borderColor = $('#borderColor').value;
            config.borderThickness = parseInt($('#borderThickness').value);
            config.lineThickness = parseInt($('#lineThickness').value);
            config.maxParticles = parseInt($('#maxParticles').value);
            config.sizeRange.min = parseInt($('#minSizeRange').value);
            config.sizeRange.max = parseInt($('#maxSizeRange').value);
            config.precision = parseInt($('#precision').value);
            config.maxParticleSize = parseInt($('#maxParticleSize').value);
            config.enableMovement = $('#enableMovement').checked;
            config.movementSpeed = parseFloat($('#movementSpeed').value);
            config.collisionResponse = parseInt($('#collisionResponse').value);
            config.newParticleFrequency.min = parseInt($('#newParticleFrequencyMin').value);
            config.newParticleFrequency.max = parseInt($('#newParticleFrequencyMax').value);
            config.reselectionInterval[0] = parseInt($('#reselectionIntervalFixed').value);
            config.reselectionInterval[1] = parseInt($('#reselectionIntervalRandomMin').value);
            config.reselectionInterval[2] = parseInt($('#reselectionIntervalRandomMax').value);

            // Parse and update initialParticleSizes
            config.initialParticleSizes = $('#initialParticleSizes').value.split(',').map(Number);

            // Parse and update spendingAmount
            const spendingAmountValues = $('#spendingAmount').value.split(',');
            config.spendingAmount = spendingAmountValues.map((val, index) => index > 1 ? parseInt(val) : parseFloat(val));

            // Parse and update withdrawAmount
            const withdrawAmountValues = $('#withdrawAmount').value.split(',');
            config.withdrawAmount = withdrawAmountValues.map((val, index) => index > 1 ? parseInt(val) : parseFloat(val));

            // Parse and update shareRange
            const shareRangeValues = $('#shareRange').value.split(',').map(parseFloat);
            config.shareRange = { min: shareRangeValues[0], max: shareRangeValues[1] };

            // Parse and update gainRange
            const gainRangeValues = $('#gainRange').value.split(',').map(parseFloat);
            config.gainRange = { min: gainRangeValues[0], max: gainRangeValues[1] };
        }

        // Function to resize the canvas to the viewport size with device pixel ratio
        function resizeCanvas() {
            const pixelRatio = window.devicePixelRatio || 1; // Get the device pixel ratio, falling back to 1

            // Adjust canvas size for the pixel ratio
            canvas.width = window.innerWidth * pixelRatio;
            canvas.height = window.innerHeight * pixelRatio;

            // Ensure canvas style size matches viewport size
            canvas.style.width = window.innerWidth + 'px';
            canvas.style.height = window.innerHeight + 'px';

            // Scale the context to ensure crisp drawing
            ctx.scale(pixelRatio, pixelRatio);
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const particles = [];
        let totalBalance = 0;
        let totalShared = 0;
        let totalGained = 0;
        let totalWithdrawn = 0;
        let totalSpent = 0;
        let wave = 0;

        // Configuration settings
        updateConfig()

        function drawParticleCounter() {
            ctx.font = '23px Arial';
            ctx.fillStyle = config.textColor;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(`Web 2 Users: ${particles.length}`, 10, 10); // Positioned in the top-left corner
        }

        class Particle {
            constructor(size, isInitial) {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = size;
                this.target = null;
                this.state = 'neutral';
                this.currentFillColor = config.fillColor;
                this.spendingTimer = 0;
                this.withdrawTimer = 0;
                this.reselectTimer = 0;
                this.reselectInterval = this.randomInterval(config.reselectionInterval[1], config.reselectionInterval[2]);
                this.isInitial = isInitial;  // Indicates whether the particle is one of the initial ones
            }

            update() {
                this.incrementTimers();
                this.checkWithdraw();
                this.checkSpend();

                if (this.reselectTimer >= this.reselectInterval) {
                    this.selectTarget();
                    this.reselectTimer = 0;
                    // Assign a new random interval for reselection
                    this.reselectInterval = this.randomInterval(config.reselectionInterval[1], config.reselectionInterval[2]);
                }
            }

            incrementTimers() {
                this.withdrawTimer++;
                this.spendingTimer++;
                this.reselectTimer++;
            }

            checkWithdraw() {
                const [minPercent, maxPercent, minInterval, maxInterval] = config.withdrawAmount;
                if (this.withdrawTimer >= this.randomInterval(minInterval, maxInterval)) {
                    this.withdrawTokens(minPercent, maxPercent);
                    this.withdrawTimer = 0;
                }
            }

            checkSpend() {
                const [minAmount, maxAmount, minInterval, maxInterval] = config.spendingAmount;
                if (this.spendingTimer >= this.randomInterval(minInterval, maxInterval)) {
                    this.spendTokens(minAmount, maxAmount);
                    this.spendingTimer = 0;
                }
            }

            randomInterval(minInterval, maxInterval) {
                return Math.round(Math.random() * (maxInterval - minInterval) + minInterval);
            }

            withdrawTokens(minPercent, maxPercent) {
                const withdrawPercentage = Math.random() * (maxPercent - minPercent) + minPercent;
                const withdrawAmount = this.size * withdrawPercentage;

                if (this.size >= withdrawAmount) {
                    this.size -= withdrawAmount;
                    totalBalance -= withdrawAmount;
                    totalWithdrawn += withdrawAmount;

                    // Check if the particle's size is zero or less and remove it if so
                    if (this.size <= 0) {
                        this.removeParticle();
                    }
                }
            }

            spendTokens(minAmount, maxAmount) {
                const spendAmount = Math.random() * (maxAmount - minAmount) + minAmount;

                if (this.size >= spendAmount) {
                    this.size -= spendAmount;
                    totalBalance -= spendAmount;
                    totalSpent += spendAmount;

                    // Check if the particle's size is zero or less and remove it if so
                    if (this.size <= 0) {
                        this.removeParticle();
                    }
                }
            }

            selectTarget() {
                if (particles.length > 1) {
                    let potentialTarget, shareAmount, potentialSizeAfterSharing;
                    const sharePercentage = Math.random() * (config.shareRange.max - config.shareRange.min) + config.shareRange.min;

                    do {
                        potentialTarget = particles[Math.floor(Math.random() * particles.length)];

                        // Ensure non-initial particles only target initial particles for sharing
                        if (!this.isInitial && !potentialTarget.isInitial) continue;

                        shareAmount = parseFloat((this.size * sharePercentage).toFixed(config.precision));
                        potentialSizeAfterSharing = parseFloat((potentialTarget.size + shareAmount).toFixed(config.precision));

                    } while (this === potentialTarget || potentialSizeAfterSharing > config.maxParticleSize);

                    if (this.size >= shareAmount && potentialSizeAfterSharing <= config.maxParticleSize) {
                        this.size -= shareAmount;
                        potentialTarget.size = potentialSizeAfterSharing;
                        this.target = potentialTarget;

                        totalShared += shareAmount;
                        totalGained -= Math.min(shareAmount, totalGained);

                        this.color = 'lime';
                        this.drawLine = true;

                        // Check if the particle shared all its size
                        if (this.size <= 0) {
                            this.removeParticle();
                        }
                    }
                }
            }

            drawLineToTarget() {
                if (this.drawLine && this.target) {
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(this.target.x, this.target.y);
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.lineWidth = config.lineThickness;
                    ctx.stroke();
                    this.drawLine = false;
                }
            }

            moveTowardTarget() {
                if (config.enableMovement && this.target) {
                    const dx = this.target.x - this.x;
                    const dy = this.target.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const stepSize = distance / (1000 / config.movementSpeed / 60);
                    const stepX = (dx / distance) * stepSize;
                    const stepY = (dy / distance) * stepSize;
                    this.x += stepX;
                    this.y += stepY;
                }
            }

            // The interaction logic should differentiate between initial and additional particles.
            // Only initial particles(this.isInitial === true) should have the ability to gain.
            // Only additional particles(this.isInitial === false) should have the ability to share.

            interact() {
                if (this.target) {
                    const dx = this.x - this.target.x;
                    const dy = this.y - this.target.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < this.size + this.target.size) {
                        // Sharing tokens (only additional particles)
                        if (!this.isInitial) {
                            const sharePercentage = Math.random() * (config.shareRange.max - config.shareRange.min) + config.shareRange.min;
                            const shareAmount = this.size * sharePercentage;
                            if (this.size >= shareAmount && this.target.size + shareAmount <= config.maxParticleSize) {
                                this.size -= shareAmount;
                                this.target.size += shareAmount;
                                totalShared += shareAmount;

                                this.currentBorderColor = 'lime'; // Change border color for sharing
                                this.currentTextColor = 'lime'; // Change text color for sharing
                            }
                        }

                        // Gaining tokens (only initial particles)
                        if (this.isInitial) {
                            const gainPercentage = Math.random() * (config.gainRange.max - config.gainRange.min) + config.gainRange.min;
                            const gainAmount = this.target.size * gainPercentage;
                            if (this.target.size >= gainAmount && this.size + gainAmount <= config.maxParticleSize) {
                                this.size += gainAmount;
                                this.target.size -= gainAmount;
                                totalGained += gainAmount;

                                this.currentBorderColor = 'red'; // Change border color for gaining
                                this.currentTextColor = 'red'; // Change text color for gaining
                            }
                        }
                    }

                    this.selectTarget();
                }
            }


            removeParticle() {
                const index = particles.indexOf(this);
                if (index > -1) {
                    particles.splice(index, 1);
                    totalBalance -= this.size;
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = config.fillColor; // Keep the fill color as it is
                ctx.fill();
                ctx.strokeStyle = this.currentBorderColor || config.borderColor; // Use the current border color
                ctx.lineWidth = config.borderThickness;
                ctx.stroke();
                ctx.font = '12px Arial';
                ctx.fillStyle = this.currentTextColor || config.particleTextColor; // Use the current text color
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(Math.round(this.size), this.x, this.y);
            }



            // Method to keep the particle within canvas boundaries
            maintainBoundary() {
                if (this.x - this.size < 0 || this.x + this.size > canvas.width) {
                    this.x = Math.max(this.size, Math.min(this.x, canvas.width - this.size));
                }
                if (this.y - this.size < 0 || this.y + this.size > canvas.height) {
                    this.y = Math.max(this.size, Math.min(this.y, canvas.height - this.size));
                }
            }

            // Method to handle collisions with other particles
            handleCollisions() {
                particles.forEach(other => {
                    if (other !== this) {
                        const dx = this.x - other.x;
                        const dy = this.y - other.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < this.size + other.size) {
                            // Simple collision response
                            this.x += dx / distance;
                            this.y += dy / distance;
                            other.x -= dx / distance;
                            other.y -= dy / distance;
                        }
                    }
                });
            }
        }

        // Initial setup
        for (let i = 0; i < config.initialParticleSizes.length; i++) {
            const initialSize = config.initialParticleSizes[i];
            particles.push(new Particle(initialSize, true)); // Pass true for isInitial
            totalBalance += initialSize;
        }

        function addNewParticle() {
            if (particles.length < config.maxParticles) {
                const size = Math.random() * (config.sizeRange.max - config.sizeRange.min) + config.sizeRange.min;
                particles.push(new Particle(size, false)); // Pass false for isInitial
                totalBalance += size;
            }
        }


        function drawStatsBackground() {
            const rectWidth = 400;
            const rectHeight = 160;
            const rectX = 0;
            const rectY = 0;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.69)'; // Semi-transparent black
            ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
        }

        function drawAverageParticleSize() {
            let totalSize = 0;
            particles.forEach(particle => totalSize += particle.size);
            const averageSize = totalSize / particles.length;

            ctx.font = '23px Arial';
            ctx.fillStyle = config.textColor;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(`Average Balance: ${averageSize.toFixed(2)} Tokens`, 10, 130); // Adjust position as needed
        }

        function drawTotalBalance() {
            ctx.font = '23px Arial';
            ctx.fillStyle = 'gold';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(`Network value: ${totalBalance.toFixed(2)} Tokens`, 10, 40); // Positioned below particle counter
        }

        function drawTotalShared() {
            ctx.font = '23px Arial';
            ctx.fillStyle = "lime";
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(`Shared: ${totalShared.toFixed(2)} Tokens`, 10, 70); // Positioned below particle counter
        }

        function drawTotalGained() {
            ctx.font = '23px Arial';
            ctx.fillStyle = "rgb(219, 70, 62)";
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(`Earned: ${totalGained.toFixed(2)} Tokens`, 10, 100); // Positioned below total shared
        }



        function simulate() {
            config.ghosting ? null : ctx.clearRect(0, 0, canvas.width, canvas.height);


            // Add a new particle at random intervals but within the maximum limit
            if (particles.length < config.maxParticles) {
                if (wave % Math.round(Math.random() * (config.newParticleFrequency.max - config.newParticleFrequency.min) + config.newParticleFrequency.min) === 0) {
                    addNewParticle();
                }
            }

            const [fixedInterval, randomMin, randomMax] = config.reselectionInterval;
            const reselectInterval = fixedInterval > 0 ? fixedInterval : Math.round(Math.random() * (randomMax - randomMin) + randomMin);

            particles.forEach(particle => {
                particle.update();

                if (wave % reselectInterval === 0) {
                    particle.selectTarget();
                }
                particle.moveTowardTarget();
                particle.interact();
                particle.drawLineToTarget();
                particle.maintainBoundary();
                particle.handleCollisions();
                particle.draw();
            });

            drawStatsBackground();
            drawParticleCounter();
            drawTotalBalance();
            drawTotalShared();
            drawTotalGained();
            drawAverageParticleSize();

            wave++;
            requestAnimationFrame(simulate);
        }

        simulate();
        console.log(config);

        // Call simulate function with updated config
        this.style.display = 'none';
    });
}