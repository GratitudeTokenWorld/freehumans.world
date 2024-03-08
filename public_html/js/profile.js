import { $, $$ } from '/js/selectors.js';
//import { textPagination } from '/js/textContent.js';
import { pop_it } from '/js/shortMessage.js';
import { defaultSounds } from '/js/sounds-preloading.js';
import { filters } from '/js/filters.js';
import { left_right_arrows } from '/js/left_right_arrows.js';
// $$('.textContent').forEach(el => {
//     textPagination(el.id, el.querySelector(`.main-data-container p`).textContent)
// });

filters();

left_right_arrows($('#shared_board'), $('#prevButton'), $('#nextButton'));



$('#soundSwitch').addEventListener('change', e => {
    if ($('#soundSwitch').checked === true) {
        localStorage.setItem('sound', 1)
    } else {
        localStorage.removeItem('sound')
    }
})

//set checkbox based on localStorage
localStorage.getItem('sound') === '1' ? $('#soundSwitch').checked = true : $('#soundSwitch').checked = false;

const connect = $('#connect')
const block = $('#block')
const username = $('.username')

$('.profile_pic') ? $('.profile_pic').addEventListener('mousedown', e => {
    const sounds = defaultSounds('lucianape3', null, null)
    sounds ? sounds[7].play() : null
}) : null;

if (connect) {
    pop_it(connect, ['connecting', 'disconnect'], ['Disconnect', 'Connect'], ['/avatars/dyablohunter.webp', '/avatars/dyablohunter.webp'], '#000', ['Connected', 'Disconnected'], ['biip', 'biip-reverse'], 'lucianape3', true)
}

if (block) {
    pop_it(block, ['blocked'], ['Unblock', 'Block'], ['/img/banned.png', '/svgs/check.svg'], '#000', ['Blocked', 'Unblocked'], ['oops', 'oops-reverse'], 'lucianape3', true)
}

if (username) {
    pop_it(username, null, null, ['/avatars/dyablohunter.webp'], '#000', ['Username copied to clipboard'], ['copy3'], 'lucianape3', true)
}