export const confetti = (el, btn) => {
    // Constants
    const confettiCount = 20;
    const sequinCount = 10;
    const gravityConfetti = 0.3;
    const gravitySequins = 0.55;
    const dragConfetti = 0.075;
    const dragSequins = 0.02;
    const terminalVelocity = 3;

    // Global variables
    const button = btn
    let disabled = false;
    const canvas = el
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let cx = ctx.canvas.width / 2;
    let cy = ctx.canvas.height / 2;
    let confetti = [];
    let sequins = [];
    const colors = [
        { front: '#7b5cff', back: '#6245e0' },
        { front: '#b3c7ff', back: '#8fa5e5' },
        { front: '#5c86ff', back: '#345dd1' }
    ];

    // Helper functions
    const randomRange = (min, max) => Math.random() * (max - min) + min;

    // Classes
    class Confetto {
        constructor() {
            this.color = colors[Math.floor(randomRange(0, colors.length))];
            this.dimensions = { x: randomRange(5, 9), y: randomRange(8, 15) };
            this.position = {
                x: randomRange(canvas.width / 2 - button.offsetWidth / 4, canvas.width / 2 + button.offsetWidth / 4),
                y: randomRange(canvas.height / 2 + button.offsetHeight / 2 + 8, canvas.height / 2 + (1.5 * button.offsetHeight) - 8)
            };
            this.rotation = randomRange(0, 2 * Math.PI);
            this.scale = { x: 1, y: 1 };
            this.velocity = { x: randomRange(-9, 9), y: -randomRange(6, 11) };
        }
        update() {
            this.velocity.x -= this.velocity.x * dragConfetti;
            this.velocity.y = Math.min(this.velocity.y + gravityConfetti, terminalVelocity);
            this.velocity.x += Math.random() > 0.5 ? Math.random() : -Math.random();
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
            this.scale.y = Math.cos(this.position.y * 0.09);
        }
    }

    class Sequin {
        constructor() {
            this.color = colors[Math.floor(randomRange(0, colors.length))].back;
            this.radius = randomRange(1, 2);
            this.position = {
                x: randomRange(canvas.width / 2 - button.offsetWidth / 3, canvas.width / 2 + button.offsetWidth / 3),
                y: randomRange(canvas.height / 2 + button.offsetHeight / 2 + 8, canvas.height / 2 + (1.5 * button.offsetHeight) - 8)
            };
            this.velocity = { x: randomRange(-6, 6), y: -randomRange(8, 12) };
        }
        update() {
            this.velocity.x -= this.velocity.x * dragSequins;
            this.velocity.y += gravitySequins;
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
        }
    }

    // Functions
    const initBurst = () => {
        for (let i = 0; i < confettiCount; i++) {
            confetti.push(new Confetto());
        }
        for (let i = 0; i < sequinCount; i++) {
            sequins.push(new Sequin());
        }
    };

    const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        confetti.forEach(confetto => {
            let width = confetto.dimensions.x * confetto.scale.x;
            let height = confetto.dimensions.y * confetto.scale.y;
            ctx.translate(confetto.position.x, confetto.position.y);
            ctx.rotate(confetto.rotation);
            confetto.update();
            ctx.fillStyle = confetto.scale.y > 0 ? confetto.color.front : confetto.color.back;
            ctx.fillRect(-width / 2, -height / 2, width, height);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            if (confetto.velocity.y < 0) {
                ctx.clearRect(canvas.width / 2 - button.offsetWidth / 2, canvas.height / 2 + button.offsetHeight / 2, button.offsetWidth, button.offsetHeight);
            }
        });
        sequins.forEach(sequin => {
            ctx.translate(sequin.position.x, sequin.position.y);
            sequin.update();
            ctx.fillStyle = sequin.color;
            ctx.beginPath();
            ctx.arc(0, 0, sequin.radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            if (sequin.velocity.y < 0) {
                ctx.clearRect(canvas.width / 2 - button.offsetWidth / 2, canvas.height / 2 + button.offsetHeight / 2, button.offsetWidth, button.offsetHeight);
            }
        });
        confetti = confetti.filter(confetto => confetto.position.y < canvas.height);
        sequins = sequins.filter(sequin => sequin.position.y < canvas.height);
        window.requestAnimationFrame(render);
    };

    const clickButton = () => {
        if (!disabled) {
            disabled = true;
            button.classList.add('loading');
            button.classList.remove('ready');
            setTimeout(() => {
                button.classList.add('complete');
                button.classList.remove('loading');
                setTimeout(() => {
                    initBurst();
                    setTimeout(() => {
                        disabled = false;
                        button.classList.add('ready');
                        button.classList.remove('complete');
                    }, 4000);
                }, 320);
            }, 1800);
        }
    };

    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        cx = ctx.canvas.width / 2;
        cy = ctx.canvas.height / 2;
    };

    // Event Listeners
    window.addEventListener('resize', resizeCanvas);
    document.body.onkeyup = e => {
        if (e.keyCode == 13 || e.keyCode == 32) {
            clickButton();
        }
    };

    // Initialize button text transition timings
    const textElements = button.querySelectorAll('.button-text');
    textElements.forEach(element => {
        let characters = element.innerText.split('');
        let characterHTML = '';
        characters.forEach((letter, index) => {
            characterHTML += `<span class="char${index}" style="--d:${index * 30}ms; --dr:${(characters.length - index - 1) * 30}ms;">${letter}</span>`;
        });
        element.innerHTML = characterHTML;
    });

    // Start animation
    initBurst();
    render();
}