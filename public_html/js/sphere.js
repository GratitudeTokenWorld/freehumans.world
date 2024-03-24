// General Functions
export const fnRequestAnimationFrame = (fnCallback) => {
    const fnAnimFrame =
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        ((fnCallback) => {
            window.setTimeout(fnCallback, 1000 / 60);
        });

    fnAnimFrame(fnCallback);
};
// Add Event Listener
export const sphereListener = (o, sEvent, fn) => {
    if (o.addEventListener) {
        o.addEventListener(sEvent, fn, false);
    } else {
        o['on' + sEvent] = fn;
    }
};
export const sphere = () => {
    // const oStats = new Stats();
    // oStats.setMode(0);
    // oStats.domElement.style.position = 'absolute';
    // oStats.domElement.style.left = '0px';
    // oStats.domElement.style.top = '0px';
    // document.body.appendChild(oStats.domElement);

    // General Elements
    const oDoc = document;
    const nBody = oDoc.body;
    // Shortcuts
    const fPI = Math.PI;
    const fnMax = Math.max;
    const fnMin = Math.min;
    const fnRnd = Math.random;
    const fnRnd2 = () => 2.0 * fnRnd() - 1.0;
    const fnCos = Math.cos;
    const fnACos = Math.acos;
    const fnSin = Math.sin;
    // Sphere Settings
    const iRadiusSphere = 150;
    let iProjSphereX = 0;
    let iProjSphereY = 0;
    // Particle Settings
    const fMaxAX = 0.1;
    const fMaxAY = 0.1;
    const fMaxAZ = 0.1;
    const fStartVX = 0.001;
    const fStartVY = 0.001;
    const fStartVZ = 0.001;
    let fAngle = 0.0;
    let fSinAngle = 0.0;
    let fCosAngle = 0.0;

    window.iFramesToRotate = 2000.0;
    window.iPerspective = 250;
    window.iNewParticlePerFrame = 1;
    window.fGrowDuration = 200.0;
    window.fWaitDuration = 50.0;
    window.fShrinkDuration = 250.0;
    window.aColor = [255, 255, 255];

    const fVX = (2.0 * fPI) / window.iFramesToRotate;

    let oRadGrad = null;
    const ctxRender = particlesCanvas.getContext('2d');

    const oRender = { pFirst: null };
    const oBuffer = { pFirst: null };

    let w = 0;
    let h = 0;

    // gets/sets size
    const fnSetSize = () => {
        particlesCanvas.width = w = window.innerWidth;
        particlesCanvas.height = h = window.innerHeight;
        iProjSphereX = w / 2;
        iProjSphereY = h / 2;
        return { w: w, h: h };
    };

    fnSetSize();

    // window.onresize
    sphereListener(window, 'resize', fnSetSize);

    const fnSwapList = (p, oSrc, oDst) => {
        if (p) {
            // remove p from oSrc
            if (oSrc.pFirst === p) {
                oSrc.pFirst = p.pNext;
                if (p.pNext) p.pNext.pPrev = null;
            } else {
                p.pPrev.pNext = p.pNext;
                if (p.pNext) p.pNext.pPrev = p.pPrev;
            }
        } else {
            // create new p
            p = new Particle();
        }

        p.pNext = oDst.pFirst;
        if (oDst.pFirst) oDst.pFirst.pPrev = p;
        oDst.pFirst = p;
        p.pPrev = null;
        return p;
    };

    // Particle
    class Particle {
        // Current Position
        fX = 0.0;
        fY = 0.0;
        fZ = 0.0;
        // Current Velocity
        fVX = 0.0;
        fVY = 0.0;
        fVZ = 0.0;
        // Current Acceleration
        fAX = 0.0;
        fAY = 0.0;
        fAZ = 0.0;
        // Projection Position
        fProjX = 0.0;
        fProjY = 0.0;
        // Rotation
        fRotX = 0.0;
        fRotZ = 0.0;
        // double linked list
        pPrev = null;
        pNext = null;

        fAngle = 0.0;
        fForce = 0.0;

        fGrowDuration = 0.0;
        fWaitDuration = 0.0;
        fShrinkDuration = 0.0;

        fRadiusCurrent = 0.0;

        iFramesAlive = 0;
        bIsDead = false;

        fnInit = () => {
            this.fAngle = fnRnd() * fPI * 2;
            this.fForce = fnACos(fnRnd2());
            this.fAlpha = 0;
            this.bIsDead = false;
            this.iFramesAlive = 0;
            this.fX = iRadiusSphere * fnSin(this.fForce) * fnCos(this.fAngle);
            this.fY = iRadiusSphere * fnSin(this.fForce) * fnSin(this.fAngle);
            this.fZ = iRadiusSphere * fnCos(this.fForce);
            this.fVX = fStartVX * this.fX;
            this.fVY = fStartVY * this.fY;
            this.fVZ = fStartVZ * this.fZ;
            this.fGrowDuration = window.fGrowDuration + fnRnd2() * (window.fGrowDuration / 4.0);
            this.fWaitDuration = window.fWaitDuration + fnRnd2() * (window.fWaitDuration / 4.0);
            this.fShrinkDuration = window.fShrinkDuration + fnRnd2() * (window.fShrinkDuration / 4.0);
            this.fAX = 0.0;
            this.fAY = 0.0;
            this.fAZ = 0.0;
        };

        fnUpdate = () => {
            if (this.iFramesAlive > this.fGrowDuration + this.fWaitDuration) {
                this.fVX += this.fAX + fMaxAX * fnRnd2();
                this.fVY += this.fAY + fMaxAY * fnRnd2();
                this.fVZ += this.fAZ + fMaxAZ * fnRnd2();
                this.fX += this.fVX;
                this.fY += this.fVY;
                this.fZ += this.fVZ;
            }

            this.fRotX = fCosAngle * this.fX + fSinAngle * this.fZ;
            this.fRotZ = -fSinAngle * this.fX + fCosAngle * this.fZ;
            this.fRadiusCurrent = Math.max(0.01, window.iPerspective / (window.iPerspective - this.fRotZ));
            this.fProjX = this.fRotX * this.fRadiusCurrent + iProjSphereX;
            this.fProjY = this.fY * this.fRadiusCurrent + iProjSphereY;

            this.iFramesAlive += 1;

            if (this.iFramesAlive < this.fGrowDuration) {
                this.fAlpha = this.iFramesAlive * 1.0 / this.fGrowDuration;
            } else if (this.iFramesAlive < this.fGrowDuration + this.fWaitDuration) {
                this.fAlpha = 1.0;
            } else if (this.iFramesAlive < this.fGrowDuration + this.fWaitDuration + this.fShrinkDuration) {
                this.fAlpha = (this.fGrowDuration + this.fWaitDuration + this.fShrinkDuration - this.iFramesAlive) * 1.0 / this.fShrinkDuration;
            } else {
                this.bIsDead = true;
            }

            if (this.bIsDead) {
                fnSwapList(this, oRender, oBuffer);
            }

            this.fAlpha *= fnMin(1.0, fnMax(0.5, this.fRotZ / iRadiusSphere));
            this.fAlpha = fnMin(1.0, fnMax(0.0, this.fAlpha));
        };
    }

    const fnRender = () => {
        ctxRender.fillStyle = "#000";
        ctxRender.fillRect(0, 0, w, h);

        let p = oRender.pFirst;
        let iCount = 0;
        while (p) {
            ctxRender.fillStyle = "rgba(" + window.aColor.join(',') + ',' + p.fAlpha.toFixed(4) + ")";
            ctxRender.beginPath();
            ctxRender.arc(p.fProjX, p.fProjY, p.fRadiusCurrent, 0, 2 * fPI, false);
            ctxRender.closePath();
            ctxRender.fill();
            p = p.pNext;
            iCount += 1;
        }
    };

    const fnNextFrame = () => {
        //oStats.begin();
        fAngle = (fAngle + fVX) % (2.0 * fPI);
        fSinAngle = fnSin(fAngle);
        fCosAngle = fnCos(fAngle);

        let iAddParticle = 0;
        let iCount = 0;
        while (iAddParticle++ < window.iNewParticlePerFrame) {
            const p = fnSwapList(oBuffer.pFirst, oBuffer, oRender);
            p.fnInit();
        }

        let p = oRender.pFirst;
        while (p) {
            const pNext = p.pNext;
            p.fnUpdate();
            p = pNext;
            iCount++;
        }
        fnRender();

        //oStats.end();
        fnRequestAnimationFrame(() => fnNextFrame());
    };

    fnNextFrame();

    // const gui = new dat.GUI();
    // gui.add(window, 'fGrowDuration').min(10).max(500).step(1);
    // gui.add(window, 'fWaitDuration').min(10).max(500).step(1);
    // gui.add(window, 'fShrinkDuration').min(10).max(500).step(1);
    // gui.add(window, 'iPerspective').min(150).max(1000).step(1);
    // gui.add(window, 'iNewParticlePerFrame').min(1).max(20).step(1);
    // gui.add(window, 'iFramesToRotate').min(50).max(2500).step(50).onChange(() => {
    //     fVX = (2.0 * fPI) / window.iFramesToRotate;
    // });
    // gui.addColor(window, 'aColor').onChange(() => {
    //     window.aColor[0] = ~~window.aColor[0];
    //     window.aColor[1] = ~~window.aColor[1];
    //     window.aColor[2] = ~~window.aColor[2];
    // });
    // if (window.innerWidth < 1000) {
    //     gui.close();
    //     window.iNewParticlePerFrame = 5;
    // }

    // window.app = this;
};