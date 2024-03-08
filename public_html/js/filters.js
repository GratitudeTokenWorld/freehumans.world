import { $, $$ } from '/js/selectors.js';
import { defaultSounds } from '/js/sounds-preloading.js';


export const filters = () => {
    let form = $('#filters');

    let sounds = defaultSounds('lucianape3', null, null)
    // main media filters
    let checkedID = localStorage.getItem('mediaFilter') || 'mixed';
    // if we don't have the #market_location filter we assume we are not on the markets page, so we set to default, this has to be detected in a better and faster way maybe
    !$('#market_location') ? checkedID = 'mixed' : null;

    const updateTitle = () => {
        if ($('#timeline')) {
            $('.content_type').innerHTML = checkedID
        }
        if ($('#profilepage')) {
            $('.content_type').innerHTML = `<img src="/avatars/lucianape3.webp" /> ${checkedID}`
        }
    }

    const filterContent = (type) => {
        updateTitle()
        $$('.posts article').forEach(el => {
            if (type === 'mixed') {
                el.style.display = 'block'
            } else {
                if (type === el.dataset.type) {
                    el.style.display = 'block'
                } else {
                    el.style.display = 'none'
                }
            }
        })
    }

    if (checkedID) {
        $(`#${checkedID}`).checked = true;
        filterContent(checkedID);
    }

    const mixedSrc = '/svgs/mixed.svg'

    form.addEventListener('click', e => {
        if (window.innerWidth <= 690) {
            form.classList.add('expand');
            $('.mixed img').src = mixedSrc;
            if (sounds) {
                sounds[5].play()
            }

        } else {
            if (sounds) {
                sounds[19].currentTime = 0;
                sounds[19].play();
            }

        }
    })

    form.addEventListener('change', e => {
        const clickedInput = $('#filters input[name="filters"]:checked')

        checkedID = clickedInput.id;
        sounds = defaultSounds('lucianape3', null, null)

        localStorage.setItem('mediaFilter', checkedID)

        updateTitle()


        filterContent(checkedID);


        if (window.innerWidth <= 690) {
            if (sounds) {
                sounds[9].currentTime = 0;
                sounds[9].play();
            }

            form.classList.remove('expand');
            $('.mixed img').src = $('#filters input[name="filters"]:checked + label img').src
        }

    });

    // MARKETS CLICK
    $('#filters #markets+label').addEventListener('click', e => {
        window.location = '/markets.html'
    })

    if (window.innerWidth <= 690 && !$('.stats')) { // checking for stats element to see if we are on profile page
        $('main').addEventListener('click', e => {
            if (form.classList.contains('expand')) {
                if (sounds) {
                    sounds[9].currentTime = 0;
                    sounds[9].play();
                }

                form.classList.remove('expand');
                $('.mixed img').src = $('#filters input[name="filters"]:checked + label img').src
            }
        })
    }
}