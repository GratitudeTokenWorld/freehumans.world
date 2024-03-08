
import { $, $$ } from '/js/selectors.js';
import { defaultSounds } from '/js/sounds-preloading.js';
let sounds = defaultSounds('lucianape3', null, null)

export const tooltips = () => {
    const t = $('tooltip')
    let clickedItemID;
    let items = $$('item');
    const scrollbarW = window.innerWidth - $('body').offsetWidth
    items.forEach((el, i) => {
        const itemID = 'item-' + i;
        el.id = itemID;

        el.addEventListener('click', e => {
            clickedItemID = itemID;
            t.style = 'opacity: 1; transform: scale(1)'
            $('tooltip .buy').style.display = 'inline-block';
            // we only need this click event to pass ID of clicked item further
            const y = e.clientY;
            const x = e.clientX;

            if (y < (window.innerHeight / 2)) {
                t.style.top = `${y}px`;
                t.style.bottom = 'auto';
            } else {
                t.style.top = 'auto';
                t.style.bottom = `${window.innerHeight - y}px`;
            }

            if (window.innerWidth >= 690) {
                if (x < (window.innerWidth / 2)) {
                    t.style.left = `${x}px`;
                    t.style.right = 'auto';
                } else {
                    t.style.left = 'auto';
                    t.style.right = `${window.innerWidth - x - scrollbarW}px`;
                }
            }
            sounds[11].currentTime = 0;
            sounds[11].play();
        })
    });

    document.addEventListener('mousedown', e => {
        t.style = '';
        $('tooltip .buy').style.display = '';
        $('tooltip .sell').style.display = '';
        removeEventListener('mousedown', document)
    })

    document.addEventListener('touchmove', e => {
        t.style = '';
        $('tooltip .buy').style.display = '';
        $('tooltip .sell').style.display = '';
        removeEventListener('touchmove', document)
    })

    document.addEventListener('scroll', e => {
        t.style = '';
        $('tooltip .buy').style.display = '';
        $('tooltip .sell').style.display = '';
        removeEventListener('scroll', document)
    })


    // Purchase btn

    $('.buy').addEventListener('mousedown', e => {
        sounds[25].currentTime = 0;
        sounds[25].play();
        alert(clickedItemID)
    })

    $('.buy').addEventListener('touchstart', e => {
        sounds[25].currentTime = 0;
        sounds[25].play();
        alert(clickedItemID)
    })

    $('.sell').addEventListener('mousedown', e => {
        sounds[26].currentTime = 0;
        sounds[26].play();
        alert('sell')
    })

    $('.sell').addEventListener('touchstart', e => {
        sounds[26].currentTime = 0;
        sounds[26].play();
        alert('sell')
    }, { passive: true })

}