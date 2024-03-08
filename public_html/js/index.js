import { $, $$ } from '/js/selectors.js';
import { throttle } from '/js/throttle_scroll.js';
import { confetti } from '/js/confetti.js';

// General Functions
const fnRequestAnimationFrame = (fnCallback) => {
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
const sphereListener = (o, sEvent, fn) => {
    if (o.addEventListener) {
        o.addEventListener(sEvent, fn, false);
    } else {
        o['on' + sEvent] = fn;
    }
};
const sphere = () => {
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

// SHOW THE SPHERE ONLY IF AUTHENTICATED
//sphereListener(window, 'load', sphere);

export const url = 'http://' + location.hostname + ':5000/' //localhost
//export const url = 'https://' + location.hostname + ':5000/' //production

// re-generate session token on page load every 15 mins
fetch(`${url}generate-token?purpose=session`).then(response => {
    return response.json()
}).then(data => {
    localStorage.setItem('session', data.token);
}).catch(error => {
    console.log(error);
})

// Function to authenticate every action that is either a private user action or authorisation, a blockchain transaction or revealing private info
const authenticateUser = async (user, secret_share) => {
    fetch(`${url}login`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: localStorage.getItem('session'),
            user: user,
            secret: secret_share,
            purpose: 'session'
        })
    }).then(response => response.json()).then(data => {
        if (data.userName === user) {
            return true
        } else {
            return false
        }
    }).catch(error => {
        console.log(error);
    })
} // this output's boolean

let FaceIDToken = localStorage.getItem('FaceIDToken') | null; // if it's null it means the FaceID token is missing.

const h3 = $('#CreateFaceContainer h3');

const hideGroups = () => {
    $$('.form-group').forEach((group) => {
        group.style.display = 'none';
    });
}

secret.addEventListener('click', e => {
    e.preventDefault();
    first_action.classList.add('hide');
    authentication.classList.remove('hide');
    user_authenticating.focus();
})

authentication.addEventListener('submit', e => {
    e.preventDefault();
    const user = user_authenticating.value;

    // LOGIN
    try {
        if (authenticateUser(user, secret_share.value)) {
            localStorage.setItem('authenticatedUser', user);
            authentication.classList.add('hide');
            $('.overlay').style.display = ''
        };
    } catch (e) {
        if (!(e instanceof Error)) {
            e = new Error(e);
        }
        console.error(e.message);
    }
})


// logout function
// logout.addEventListener('click', e => {
//     e.preventDefault();
//     localStorage.removeItem('authenticatedUser');
// })


const identity = () => {
    $('.overlay').style.display = 'flex'

    if (localStorage.getItem('retryUserCreation')) {
        register.classList.add('hide');
        first_action.classList.add('hide');
        CreateFaceContainer.classList.remove('hide');
        h3.style.color = '';
        h3.innerHTML = `You need to create the FaceID for user <b style="font-size: 18px">${localStorage.getItem('username')}</b>.`;
        createFace.disabled = false;
    } else {
        first_action.classList.remove('hide');
        CreateFaceContainer.classList.add('hide');
    }
}

registerBTN.addEventListener('click', e => {
    identity();
})

$('.freeuser').addEventListener('click', e => {
    identity();
})

close_overlay.addEventListener('click', e => {
    $('.overlay').style.display = 'none';
    first_action.style.display = '';
    register.classList.add('hide');
    authentication.classList.add('hide');
    h3.innerHTML = '';
})

createUser.addEventListener('click', e => {
    e.preventDefault();
    currentStep = 0;
    email.value = '';
    username.value = '';
    invitedByUser.value = '';
    hideGroups();
    $('.form-group:first-of-type').style.display = 'block';
    continueForm.value = 'Continue';
    backForm.style.display = 'none';
    register.classList.remove('hide');
    first_action.classList.add('hide');
    email.focus();
})

const urlParams = new URLSearchParams(window.location.search);
const invitedby = urlParams.get('invited_by');
invitedByUser.value = invitedby;

// CREATE ACCOUNT - MULTIPLE STEPS FORM
// Select all input elements in the form that are part of the step sequence
const inputs = Array.from($$('#email, #username, #invitedByUser, #terms')); // Adjust selector as needed
let currentStep = 0;
let emailVerified = false;
let sentEmail;

const verifyCode = (code) => {
    code15.classList.remove('hide');
    code15.focus();
    sendCode.classList.remove('hide');
    sendCode.disabled = false;
    if (sentEmail === email.value && code15.value) {
        fetch(`${url}verify-code?email=${email.value}&code=${code}`).then(verifyCodeResponse => {
            verifyCodeResponse.status == 400 ? messages.innerHTML = 'Email and code are required.' : null;
            verifyCodeResponse.status == 404 ? messages.innerHTML = 'Code is invalid or expired.' : null;
            verifyCodeResponse.status == 429 ? messages.innerHTML = 'Can only verify 10 codes in a window of 15 minutes. Try again later.' : null;
            verifyCodeResponse.status == 500 ? messages.innerHTML = 'Failed to verify code.' : null;

            if (verifyCodeResponse.status === 200) {
                sendCode.disabled = true;
                emailVerified = true;
                console.log('Verified: ' + email.value);
                messages.innerHTML = ''
                currentStep++;
                updateInputVisibility();
                $('#code15').classList.add('hide');
                sendCode.classList.add('hide');
                setTimeout(() => {
                    dob.showPicker()
                }, '100')
            }
        }).catch(error => {
            console.log(error);
            messages.innerHTML = 'Failed to verify code. Internal server error';
        })
    }
    //console.log('Step: ' + currentStep);
    if (currentStep === 0) {
        code15.focus()
    } else { inputs[currentStep].focus() }


    //console.log(inputs[currentStep]);
}

const checkInviter = (user) => {
    fetch(`${url}checkInviter?username=${user}`).then(response => {
        if (response.status == 400 || response.status == 404 || response.status == 500) {
            messages.innerHTML = `Check the link or username of the person that invited you.`
            continueForm.disabled = true;
        }
        if (response.status == 429) {
            messages.innerHTML = `Can only verify 10 usernames in a window of 15 minutes. Try again later.`
            continueForm.disabled = true;
        }
        return response.json()
    }).then(data => {
        if (data.status == 200) {
            console.log(`Referral user ${user} is valid.`);
            messages.innerHTML = '';
            messages.style.color = '';
        }
    });
}

// Function to update the visibility of inputs and the back button based on the current step
function updateInputVisibility() {

    // Hide all steps
    hideGroups();

    // terms and conditions step
    if (currentStep === 3) {
        continueForm.disabled = true;
        continueForm.style.filter = 'grayscale(1)';
        continueForm.value = 'Agree and Continue';
    }


    // Show only the relevant step based on `currentStep`
    // Assuming `inputs` array is correctly mapped to the form groups
    if (inputs[currentStep]) {
        const currentInputGroup = inputs[currentStep].closest('.form-group');
        if (currentInputGroup) {
            currentInputGroup.style.display = 'block';
        }
    }

    // Additional logic for specific steps as needed
    if (currentStep === 1) {
        $('.criteria').classList.add('block');
    } else {
        $('.criteria').classList.remove('block');
    }

    // Update continue and back button visibility
    continueForm.style.display = currentStep === inputs.length - 1 ? 'none' : 'inline-block';
    backForm.style.display = currentStep > 0 ? 'inline-block' : 'none';
}

const createAccount = () => {
    h3.innerHTML = 'Creating user account ...';

    const actions = (color, message) => {
        localStorage.removeItem('retryUserCreation');
        h3.style.color = color;
        createFace.textContent = 'Create FaceID';
        createFace.disabled = false;
        h3.innerHTML = message;
        confetti($('#confetti'), continueForm);
    }


    fetch(`${url}register-account`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: localStorage.getItem('email').toLowerCase(),
            username: localStorage.getItem('username'),
            invitedby: localStorage.getItem('invitedby').toLowerCase()
        })
    })
        .then(response => {
            if (response.status === 200) {
                h3.innerHTML = `User <b style="font-size: 18px">${localStorage.getItem('username')}</b> created successfully.`;
            };
            if (response.status === 409) {
                h3.innerHTML = 'Email already in use. Please clear cache and try again.';
            };
            if (response.status === 429) {
                h3.innerHTML = 'Can only create 10 accounts in a window of 15 minutes. Try again later.';
            };
            if (response.status === 500) {
                h3.innerHTML = 'Failed to save user data or create blockchain account. Try again later.';
            };
            return response.json();
        })
        .then(data => {
            console.log(data);

            if (data.message == 'Data saved successfully.') {
                actions('green', `User <b style="font-size: 18px">${localStorage.getItem('username')}</b> created successfully.`)
            } else {
                retryCreateAccount();
                console.log(data.result.message)
            }
        })
        .catch(error => {
            console.log(error);
            retryCreateAccount();
        });

}

const retryCreateAccount = () => {
    h3.innerHTML = `
    Something went wrong while trying to create the account.<br>
    Please try again later.`;
    h3.style.color = 'var(--main-color)';
    createFace.textContent = 'Retry';
    createFace.disabled = false;
}

createFace.addEventListener('click', e => {
    e.preventDefault();
    createFace.textContent === 'Retry' ? createAccount() : CreateFaceID();
});

const CreateFaceID = () => {
    // do something
    alert(`Soon. But not now... You'll have to enjoy the MVP without it.`);
}

// Check if current input is valid before proceeding to the next step
continueForm.addEventListener('click', async function (e) {
    e.preventDefault();

    messages.innerHTML = '';
    messages.style.color = '';
    code15.value = '';
    email.value !== '' ? sentEmail = email.value : null;

    if (currentStep === 3) {
        // Just to be safe, let's store the data for resuming later
        localStorage.setItem('email', email.value);
        localStorage.setItem('username', username.value);
        localStorage.setItem('invitedby', invitedByUser.value);
        // we set this to resume user registration process on first button #registerBTN
        localStorage.setItem('retryUserCreation', username.value);

        messages.innerHTML = '';
        register.classList.add('hide');
        CreateFaceContainer.classList.remove('hide');

        createAccount();
    }

    const currentInput = inputs[currentStep];

    if (currentStep === 0 && email.value) {
        // Check if the email exists before proceeding
        try {
            const response = await fetch(`${url}checkEmail?email=${email.value}`);
            const data = await response.json();
            if (data.message === 'Email exists.') {
                messages.innerHTML = `Email is already registered.`;
                return; // Stop the function here if the email exists
            } else {
                console.log(`Email is not registered.`);
                messages.innerHTML = ''; // Clear messages if the email check passed
            }
        } catch (error) {
            console.error('Failed to check email:', error);
            messages.innerHTML = 'An error occurred while checking the email.';
            return; // Stop the function here if there was an error checking the email
        }
    }

    if (currentInput.checkValidity()) {

        // email verification step
        if (currentStep === 0) {
            verifyCode(code15.value);
        } else {
            currentStep++;
            updateInputVisibility();
            code15.classList.remove('block');

            if (currentStep === 2) {
                checkInviter(invitedByUser.value)
            }
        }
    } else {
        // If the input is not valid, trigger the browser's default error message
        currentInput.reportValidity();
    }
});


// Handle the invitedBy functionality
invitedByUser.addEventListener('keyup', function (e) {
    e.preventDefault();
    checkInviter(invitedByUser.value)
    continueForm.disabled = false;
});

// Handle the back button functionality
code15.addEventListener('input', function (e) {
    e.preventDefault();
    if (code15.value.length === 6) {
        sentEmail = email.value;
        verifyCode(code15.value);
    }
});


// Handle the sendCode button functionality
sendCode.addEventListener('click', function (e) {
    e.preventDefault();
    sendCode.disabled = true;
    sentEmail = email.value;
    let timeLeft = 60;
    messages.innerHTML = 'Check your email.';
    messages.style.color = 'green';

    sendCode.style.background = 'gray';
    sendCode.textContent = 'Retry possible in 60s'; // Update the button text with the new time
    const countdown = setInterval(() => {
        sendCode.textContent = 'Retry possible in ' + timeLeft + 's'; // Update the button text with the new time
        timeLeft--; // Decrement the time left by 1
        if (timeLeft <= 0) {
            clearInterval(countdown); // Stop the countdown when it reaches 0
            sendCode.textContent = "Send code"; // Optionally, update the button text to indicate completion
            // You can also disable the button or trigger any other action here
            sendCode.disabled = false;
            sendCode.style.background = '';
        }
    }, 1000); // Set the interval to 1000 milliseconds (1 second)

    fetch(`${url}send-code?email=${email.value}`).then(generateCodeResponse => {
        generateCodeResponse.status == 400 ? messages.innerHTML = 'Email address is required.' : null;
        generateCodeResponse.status == 429 ? messages.innerHTML = 'Can only generate 5 codes in a window of 15 minutes. Try again later.' : null;
        generateCodeResponse.status == 500 ? messages.innerHTML = 'Failed to save validation code.' : null;
    }).catch(error => {
        console.log(error);
        messages.innerHTML = 'Failed to generate code. Internal server error';
    });
});


// Reset email storage
email.addEventListener('change', function (e) {
    e.preventDefault();
    emailVerified = false
});

// Handle the back button functionality
backForm.addEventListener('click', function (e) {
    e.preventDefault();
    sentEmail = email.value;
    messages.innerHTML = '';
    code15.value = '';
    sendCode.classList.remove('block');
    continueForm.value = 'Continue';
    continueForm.style.filter = '';
    continueForm.disabled = false;

    if (currentStep > 0) {
        currentStep--;
        updateInputVisibility();
    }
    if (currentStep === 1) {
        if (emailVerified !== email.value) {
            code15.classList.remove('block');
            sendCode.classList.remove('block');
        }
    }
    //console.log('Back current step: ' + currentStep)
});

// Initial form setup
updateInputVisibility();

function checkUsernameCriteria() {
    const minCharCheck = username.value.length >= 4;
    const maxCharCheck = username.value.length <= 12;
    const lowercaseNumbersCheck = /^[a-z1-5]+$/.test(username.value);
    continueForm.disabled = true;
    const checkUserIcon = $('.criteria img:last-of-type');

    let randomPositionInterval = null;
    function randomPosition() {
        // Ensure any existing interval is cleared before starting a new one
        if (randomPositionInterval !== null) {
            clearInterval(randomPositionInterval);
        }

        randomPositionInterval = setInterval(() => {
            // Generate random values for r1 and r2 within the range -23 to 23px
            const r1 = Math.floor(Math.random() * 47) - 23 + 'px'; // Random value between -23 and 23px for r1
            const r2 = Math.floor(Math.random() * 47) - 23 + 'px'; // Random value between -23 and 23px for r2

            // Update the transform style of the element
            checkUserIcon ? checkUserIcon.style.transform = `translate(${r1}, ${r2})` : null;
        }, 100); // Update every 100ms
    }

    function clearRandomPosition() {
        if (randomPositionInterval !== null) {
            clearInterval(randomPositionInterval);
            randomPositionInterval = null; // Reset the interval variable
        }
    }

    // Update the criteria checkmarks
    $('.min-char').style.filter = minCharCheck ? 'none' : 'grayscale(1)';
    $('.max-char').style.filter = maxCharCheck ? 'none' : 'grayscale(1)';
    $('.lowercaseNumbers').style.filter = lowercaseNumbersCheck ? 'none' : 'grayscale(1)';

    if (minCharCheck && maxCharCheck && lowercaseNumbersCheck) {
        randomPosition();
        // Placeholder for GET request to check availability
        fetch(`${url}checkUsernameAvailability?username=${username.value}`).then(response => {
            response.status == 429 ? messages.innerHTML = 'Can only verify 100 usernames in a window of 15 minutes. Try again later.' : null;
            return response.json()
        }).then(data => {
            data.status == 400 ? messages.innerHTML = 'Username must be 4-12 characters long, including lowercase letters or digits 1-5.' : null;

            if (data.account_name === username.value) {
                continueForm.disabled = true;
                messages.style.color = '';
                messages.innerHTML = 'Username <b>' + username.value + '</b> already exists.'
                console.log('Username ' + username.value + ' already exists.');
                clearRandomPosition();
                checkUserIcon.style.transform = '';
                $('.availability').style.filter = 'grayscale(1)';
            }

            // we assume that if the message contains unknown key it means the account does not exist for this user
            if (typeof data.message === 'string' && data.message.startsWith('unknown key')) {
                continueForm.disabled = false;
                console.log(`Username ${username.value} is available.`);
                messages.innerHTML = '';
                $('.availability').style.filter = 'none';
                clearRandomPosition();
                checkUserIcon.style.transform = ''
            }
        });

    } else {
        $('.availability').style.filter = 'grayscale(1)';
    }

    setTimeout(() => {
        clearRandomPosition();
        checkUserIcon.style.transform = ''
    }, '1200')
}

username.addEventListener('keyup', checkUsernameCriteria);

const throttledScrollHandler = throttle(function () {
    // Calculate the bottom position
    const scrollPosition = terms.scrollTop + terms.clientHeight;

    // Check if the user has scrolled to the bottom
    if (scrollPosition + 10 >= terms.scrollHeight) {
        continueForm.disabled = false;
        continueForm.style.filter = '';
    }
}, 50); // Adjust the limit (100ms) as needed

terms.addEventListener('scroll', throttledScrollHandler);