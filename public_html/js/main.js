import { $, $$ } from '/js/selectors.js';
import { pop_it } from '/js/shortMessage.js';
import { defaultSounds } from '/js/sounds-preloading.js';
import { posting } from '/js/posting.js';
import { smallRandom } from '/js/random.js';
import { debounce } from '/js/debouncer.js';
import { tooltips } from '/js/tooltips.js';
import { draggableStuff } from '/js/draggable.js';
$('#homepage') ? null : tooltips();
draggableStuff();
posting();

import { isAuthenticated } from '/js/isauth.js';
isAuthenticated();

let sounds = defaultSounds('lucianape3', null, null)


$$('.wheel').forEach(element => {
    element.addEventListener('wheel', (e) => {
        // Prevents vertical scrolling
        e.preventDefault();
        if ($('.arrow_indicators')) {
            $('#prevButton').style.display = 'none'; // hide this for now
            $('#nextButton').style.display = 'none'; // hide this for now
        }

        // Adjusts horizontal scroll position
        element.scrollLeft += e.deltaY;
    });
    element.addEventListener('touchmove', (e) => {
        if ($('.arrow_indicators')) {
            $('#prevButton').style.display = 'none'; // hide this for now
            $('#nextButton').style.display = 'none'; // hide this for now
        }
    });
});


$$('.messages').forEach(el => {
    el.addEventListener('click', e => {
        $('#messages-container').classList.add('showMessages');
        $('body').style.overflow = 'hidden';
        $('#dm .discussion').scrollTo(0, document.body.scrollHeight);
        sounds = defaultSounds('lucianape3', null, null)
        sounds ? sounds[3].play() : null;
    })
})

$('#markets_section') ? markets_section.addEventListener('click', e => { window.location = "/markets.html"; }) : null;

// NOTIFICATIONS
$('#notifications') ? $('#notifications').addEventListener('click', e => {
    $('#user-menu').classList.remove('show')
    $('slots').classList.remove('open')
    $('#notifications').classList.toggle('showNotifications')
    sounds = defaultSounds('lucianape3', null, null)
    if (sounds) {
        sounds[6].currentTime = 0;
        sounds[6].play();
    }
}) : null;

// BAG AND WALLET
$('bags') ? $('bags').addEventListener('click', e => {
    sounds = defaultSounds('lucianape3', null, null)
    if (sounds) {
        sounds[31].currentTime = 0;
        sounds[31].play();
    }
    $('slots').classList.toggle('open')
    $('#user-menu').classList.remove('show')
    $('#notifications').classList.remove('showNotifications')

    $('bag.used').addEventListener('click', e => {
        if (sounds) {
            sounds[26].currentTime = 0;
            sounds[26].play();
        }
    });

    $('keychain').addEventListener('click', e => {
        if (sounds) {
            sounds[28].currentTime = 0;
            sounds[28].play();
        }
    });
}) : null;

$('wallet') ? $('wallet').addEventListener('click', e => {
    $('#user-menu').classList.remove('show')
    $('#notifications').classList.remove('showNotifications')
    if (sounds) {
        sounds[27].currentTime = 0;
        sounds[27].play();
    }
}) : null;


// avatar click
$('#user-menu .avatar-container') ? $('#user-menu .avatar-container').addEventListener('click', e => {
    $('#user-menu').classList.toggle('show');
    $('slots').classList.remove('open')
    $('#notifications').classList.remove('showNotifications')
    sounds = defaultSounds('lucianape3', null, null)
    if (sounds && $('#user-menu').classList.contains('show')) {
        sounds[0].play()
    }
}) : null;


$('.messages_header header') ? $('.messages_header header').addEventListener('click', e => {
    $('.messages_from').style = 'left: 0'
}) : null;

$('#dm') ? $('#dm').addEventListener('click', e => {
    $('.messages_from').style = ''
}) : null;

$('#messages-container .close') ? $('#messages-container .close').addEventListener('click', e => {
    $('#messages-container').classList.remove('showMessages');
    $('body').style.overflow = ''
    sounds = defaultSounds('lucianape3', null, null)
    if (sounds) {
        sounds[4].play();
    }
}) : null;

$('#timelineLink') ? $('#timelineLink').addEventListener('click', e => { window.location = "/timeline.html"; }) : null;


// SEARCH FEATURE
$('#search-btn') ? $('#search-btn').addEventListener('click', e => {
    sounds = defaultSounds('lucianape3', null, null)
    if (sounds) {
        if (!$('.showSearch')) {
            sounds[18].play();
            searchThis.focus();
        } else { sounds[20].play(); }
    }
    $('body').classList.toggle('showSearch')
}) : null;


$$('.share2earn').forEach(el => {
    const text = [`You earned ${smallRandom(0.01, 5)} GRAT`];
    pop_it(el, null, null, ['/svgs/share.svg'], '#3e8fdb', text, ['share'], 'lucianape3', false)
})

$$('.like2give').forEach(el => {
    const text = [`You shared ${smallRandom(0.01, 5)} GRAT`];
    pop_it(el, null, null, ['/svgs/like.svg'], '#db463e', text, ['like'], 'lucianape3', false)
})

$('#profile') ? $('#profile').addEventListener('click', e => { window.location = "/profile.html"; }) : null;

$$('.timeline').forEach(el => {
    el.addEventListener('click', e => {
        window.location = "/timeline.html"
    })
});

$$('.comments').forEach(el => {
    el.addEventListener('click', e => {
        window.location = "/post.html";
    })
});




let mybutton = $("#scrollToTopBtn");

window.addEventListener("scroll", debounce(() => {
    if (document.body.scrollTop > 1000 || document.documentElement.scrollTop > 1000) {
        mybutton.classList.add('showTopBtn')
    } else {
        mybutton.classList.remove('showTopBtn')
    }
}, 100));

mybutton.addEventListener('click', e => {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE, and Opera
})




// logout function
logout.addEventListener('click', e => {
    e.preventDefault();
    localStorage.removeItem('session');
    localStorage.removeItem('authenticatedUser');
    localStorage.removeItem('authenticatedUserID');
    window.location = '/'
});