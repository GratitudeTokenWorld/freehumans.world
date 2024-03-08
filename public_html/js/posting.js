import { $, $$ } from '/js/selectors.js';
import { defaultSounds } from '/js/sounds-preloading.js';
let sounds = defaultSounds('lucianape3', null, null)

const postBTN = $('#post-btn')

export const posting = () => {
    const posting = $('#posting')
    postBTN ? postBTN.addEventListener('click', e => {
        let sounds = defaultSounds('lucianape3', null, null)
        // IDEA -  don't forget to set expiration date on static cached files of user content, for example 24H should be

        // $('#posting').innerHTML = `
        // <h2>GIGI</h2>
        // <p>Lorem ipsum dolor sit amet consectetur elit.</p>
        // <form id="posting-form">
        //     <textarea placeholder="Post what now? ..."></textarea>
        //     <button id="cancel-posting">CANCEL</button>
        //     <input id="post-now" type="submit">POST</button>
        // </form>
        // `

        posting.classList.toggle('block');
        posting.classList.contains('block') ? sounds[1].play() : sounds[2].play();
    }) : null;

    $('#posting-form') ? $('#posting-form').addEventListener('submit', e => {
        e.preventDefault()
    }) : null;

    $('#cancel-posting') ? $('#cancel-posting').addEventListener('click', e => {
        posting.classList.remove('block');
        sounds[2].play()
    }) : null

    $('#post-now') ? $('#post-now').addEventListener('click', e => {
        posting.classList.add('sendPostAnimation');
        sounds[16].play()
        setTimeout(function () {
            posting.classList.remove('block');
            posting.classList.remove('sendPostAnimation');
        }, 523);
    }) : null;

    $$('.send_message').forEach(el => {
        el.addEventListener('submit', e => {
            e.preventDefault()
            sounds = defaultSounds('lucianape3', null, null)
            sounds ? sounds[17].play() : null
        })
    })
}