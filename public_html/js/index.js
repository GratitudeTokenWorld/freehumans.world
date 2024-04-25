import { $, $$ } from '/js/selectors.js';
import { throttle } from '/js/throttle_scroll.js';
import { confetti } from '/js/confetti.js';
//import { fnRequestAnimationFrame, sphereListener, sphere } from '/js/sphere.js';
// fnRequestAnimationFrame();
// sphereListener();
// sphere();
// SHOW THE SPHERE ONLY IF AUTHENTICATED
//sphereListener(window, 'load', sphere);

import { url, authenticateUser } from '/js/login.js';
import { credentials } from '/js/credentials.js';
credentials();

let FaceIDToken = localStorage.getItem('FaceIDToken') | null; // if it's null it means the FaceID token is missing.

const h3 = $('#CreateFaceContainer h3');

const hideGroups = () => {
    $$('.form-group').forEach((group) => {
        group.style.display = 'none';
    });
}

showLogin.addEventListener('click', e => {
    e.preventDefault();
    first_action.classList.add('hide');
    authentication.classList.remove('hide');
    user_authenticating.focus();
})

authentication.addEventListener('submit', async e => {
    e.preventDefault();
    const user = user_authenticating.value;
    loader.classList.add('show');

    // LOGIN
    authenticateUser(user, secret_share.value);

})


const identity = () => {
    $('.overlay').style.display = 'flex'

    if (localStorage.getItem('retryUserCreation')) {
        register_form.classList.add('hide');
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
    register_form.classList.add('hide');
    authentication.classList.add('hide');
    h3.innerHTML = '';
})

register.addEventListener('click', e => {
    e.preventDefault();
    currentStep = 0;
    email.value = '';
    username.value = '';
    invitedByUser.value = '';
    hideGroups();
    $('.form-group:first-of-type').style.display = 'block';
    continueForm.value = 'Continue';
    backForm.style.display = 'none';
    register_form.classList.remove('hide');
    first_action.classList.add('hide');
    email.focus();
})

const urlParams = new URLSearchParams(window.location.search);
const invitedby = urlParams.get('inviter');
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

importKey.addEventListener('change', e => {
    if (importKey.checked) {
        username.disabled = true;
        $('.PVT_Key').classList.remove('hide');
        $('.criteria').classList.remove('block');
        $('.username').classList.add('hide');
        PVT_Key.focus();
    } else {
        PVT_Key.value = '';
        username.disabled = false;
        $('.PVT_Key').classList.add('hide');
        $('.criteria').classList.add('block');
        $('.username').classList.remove('hide');
        username.focus();
    }
})

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

    const user = localStorage.getItem('username');

    let usernameOrKey;

    // we send either a username or a key
    if (user > 12) {
        usernameOrKey = { key: PVT_Key.value };
    } else if (user >= 4 && user <= 12) {
        usernameOrKey = { username: user };
    }


    fetch(`${url}register-account`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: localStorage.getItem('email').toLowerCase(),
            ...usernameOrKey,
            invitedby: localStorage.getItem('invitedby').toLowerCase()
        })
    })
        .then(response => {
            if (response.status === 200) {
                h3.innerHTML = `User <b style="font-size: 18px">${user}</b> created successfully.`;
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
                actions('green', `User <b style="font-size: 18px">${user}</b> created successfully.`)
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
        register_form.classList.add('hide');
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

        code15.classList.remove('block');
    }

    if (currentInput.checkValidity()) {
        if (currentStep === 0) {
            verifyCode(code15.value);
        } else {
            if (!importKey.checked || PVT_Key.checkValidity()) {
                currentStep++;
                updateInputVisibility();
            }

            if (currentStep === 2) {
                checkInviter(invitedByUser.value)
            }
        }
    } else {
        // If the input is not valid, trigger the browser's default error message
        currentInput.reportValidity();
    }

    if (importKey.checked) {
        $('.criteria').classList.remove('block');
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
    if ($('#importKey').checked) {
        $('.criteria').classList.remove('block');
    }
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

    if (importKey.checked) {
        $('.criteria').classList.remove('block');
    }
    //console.log('Back current step: ' + currentStep)
});

// Initial form setup
updateInputVisibility();

function checkUsernameCriteria() {
    const minCharCheck = username.value.length >= 4;
    const maxCharCheck = username.value.length <= 12;
    const lowercaseNumbersCheck = /^[a-z1-5]+$/.test(username.value);
    continueForm.disabled = true
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