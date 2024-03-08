import { $, $$ } from '/js/selectors.js';

export const web3 = () => {

    $('#configForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const canvas = $('#simulationCanvas');
        const ctx = canvas.getContext('2d');

        let config = {}

        let updateConfig = () => {
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
            ctx.fillText(`Web 3 Users: ${particles.length}`, 10, 10); // Positioned in the top-left corner
        }

        class Particle {
            constructor(size) {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = size;
                this.target = null;
                this.state = 'neutral';
                this.currentFillColor = config.fillColor;
                this.spendingTimer = 0;
                this.withdrawTimer = 0;
                this.maxSize = config.maxParticleSize; // Cache max size for each particle
                this.reselectTimer = 0;
                this.reselectInterval = this.randomInterval(config.reselectionInterval[1], config.reselectionInterval[2]);
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

                        shareAmount = parseFloat((this.size * sharePercentage).toFixed(config.precision));
                        potentialSizeAfterSharing = parseFloat((potentialTarget.size + shareAmount).toFixed(config.precision));

                    } while (this === potentialTarget || potentialSizeAfterSharing > config.maxParticleSize);

                    if (this.size >= shareAmount && potentialSizeAfterSharing <= config.maxParticleSize) {
                        this.size -= shareAmount;
                        potentialTarget.size = potentialSizeAfterSharing;
                        this.target = potentialTarget;

                        totalShared = parseFloat((totalShared + shareAmount).toFixed(config.precision));
                        totalGained = parseFloat((totalGained + shareAmount).toFixed(config.precision));

                        this.color = 'lime';
                        this.drawLine = true;

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

                    // SLOW AND PRECISE particle orientation/movement
                    // const stepSize = distance / (1000 / config.movementSpeed / 60);
                    // const stepX = (dx / distance) * stepSize;
                    // const stepY = (dy / distance) * stepSize;
                    // this.x += stepX;
                    // this.y += stepY;


                    // FAST AND OVERSHOOTING particle orientation/movement
                    if (distance > 0) {
                        const stepSize = config.movementSpeed / distance;
                        this.x += dx * stepSize;
                        this.y += dy * stepSize;
                    }
                }
            }


            interact() {
                if (this.target) {
                    const dx = this.x - this.target.x;
                    const dy = this.y - this.target.y;
                    const distanceSquared = dx * dx + dy * dy;
                    const combinedSize = this.size + this.target.size;

                    if (distanceSquared < combinedSize * combinedSize) {
                        // Define both sharePercentage and gainPercentage
                        const sharePercentage = Math.random() * (config.shareRange.max - config.shareRange.min) + config.shareRange.min;
                        const gainPercentage = Math.random() * (config.gainRange.max - config.gainRange.min) + config.gainRange.min;

                        if (Math.random() > 0.5) {
                            // Sharing tokens
                            const shareAmount = this.size * sharePercentage;
                            if (this.size >= shareAmount && this.target.size + shareAmount <= this.maxSize) {
                                this.size -= shareAmount;
                                this.target.size += shareAmount;
                                totalShared += shareAmount;
                                //totalGained = Math.max(totalGained - shareAmount, 0);

                                this.currentBorderColor = 'lime';
                                this.currentTextColor = 'lime';
                            }
                        } else {
                            // Gaining tokens
                            const gainAmount = this.target.size * gainPercentage;
                            if (this.target.size >= gainAmount && this.size + gainAmount <= this.maxSize) {
                                this.size += gainAmount;
                                this.target.size -= gainAmount;
                                totalGained += gainAmount;
                                //totalShared = Math.max(totalShared - gainAmount, 0);

                                this.currentBorderColor = 'red';
                                this.currentTextColor = 'red';
                            }
                        }
                        this.selectTarget();
                    }
                }
            }

            removeParticle() {
                const index = particles.indexOf(this);
                if (index > -1) {
                    particles.splice(index, 1);
                    totalBalance -= this.size;
                }
            }

            maintainBoundary() {
                if (this.x - this.size < 0) {
                    this.x = this.size;
                } else if (this.x + this.size > canvas.width) {
                    this.x = canvas.width - this.size;
                }

                if (this.y - this.size < 0) {
                    this.y = this.size;
                } else if (this.y + this.size > canvas.height) {
                    this.y = canvas.height - this.size;
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

            // Method to handle collisions with other particles
            handleCollisions() {
                particles.forEach(other => {
                    if (other !== this) {
                        const dx = this.x - other.x;
                        const dy = this.y - other.y;

                        // more efficient and no overlap
                        const distanceSquared = dx * dx + dy * dy;
                        const combinedSize = this.size + other.size;

                        if (distanceSquared < combinedSize * combinedSize) {
                            const distance = Math.sqrt(distanceSquared);
                            const overlap = (combinedSize - distance) / distance;
                            this.x += dx * overlap;
                            this.y += dy * overlap;
                            other.x -= dx * overlap;
                            other.y -= dy * overlap;
                        }


                        // with more overlap
                        // const distance = Math.sqrt(dx * dx + dy * dy);
                        // if (distance < this.size + other.size) {
                        //     // Simple collision response
                        //     this.x += dx / distance;
                        //     this.y += dy / distance;
                        //     other.x -= dx / distance;
                        //     other.y -= dy / distance;
                        // }
                    }
                });
            }
        }

        // Initial setup
        for (let i = 0; i < config.initialParticleSizes.length; i++) {
            const initialSize = config.initialParticleSizes[i];
            particles.push(new Particle(initialSize));
            totalBalance += initialSize; // Include the size of each initial particle in the total balance
        }

        function drawStatsBackground() {
            const rectWidth = 400;
            const rectHeight = 160;
            const rectX = 0;
            const rectY = 0;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.69)'; // Semi-transparent black
            ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
        }

        function addNewParticle() {
            if (particles.length < config.maxParticles) {
                const size = Math.random() * (config.sizeRange.max - config.sizeRange.min) + config.sizeRange.min;
                const newParticle = new Particle(size);
                particles.push(newParticle);
                totalBalance += size; // Update total balance when a new particle is added
            }
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
                const newParticleInterval = Math.round(Math.random() * (config.newParticleFrequency.max - config.newParticleFrequency.min) + config.newParticleFrequency.min);
                if (wave % newParticleInterval === 0) {
                    addNewParticle();
                }
            }

            const reselectInterval = (config.reselectionInterval[0] > 0) ? config.reselectionInterval[0] : Math.round(Math.random() * (config.reselectionInterval[2] - config.reselectionInterval[1]) + config.reselectionInterval[1]);

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