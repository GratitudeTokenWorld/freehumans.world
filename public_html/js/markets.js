import { $, $$ } from '/js/selectors.js';
//import { pop_it } from '/js/shortMessage.js';
import { defaultSounds } from '/js/sounds-preloading.js';
//import { carousel } from '/js/carousel.js';

const sounds = defaultSounds('lucianape3', null, null);

const nftSchemaURL = '/schemas/nft_markets.json';
const regularSchemaURL = '/schemas/regular_markets.json';

let nftSchema;
let regularSchema;

const updateSubcategories = (object) => {
    const subcategoriesContainer = $('#subcategories');
    const subcategories = object.map((el, i) => `<button class='btn ${i === 0 ? 'selected' : ''}'>${el}</button>`).join('');
    subcategoriesContainer.innerHTML = subcategories;

    subcategoriesContainer.addEventListener('click', e => {
        if (e.target.tagName === 'BUTTON') {
            e.preventDefault();
            if (sounds) {
                sounds[0].currentTime = 0;
                sounds[0].play()
            }
            $$('#subcategories button').forEach(button => {
                button.classList.remove('selected');
            });
            e.target.classList.add('selected');
        }
    });
};


const marketType = $('.market_type');
const descr = $('#marketDescription');

const eventListeners = (type) => {
    $$(`#${type} img`).forEach((el, i) => {
        el.addEventListener('click', () => handleImageClick(el, type, i));
    });
};

const handleImageClick = (el, type, index) => {
    $(`#${type} .selected`).classList.remove('selected');
    el.classList.add('selected');
    marketType.textContent = el.title;
    let obj;
    if (type === 'nft') {
        obj = nftSchema
    } else if (type === 'regular') {
        obj = regularSchema
    }
    descr.textContent = obj[el.title].descr;
    updateSubcategories(obj[el.title].subcat);
    sounds[23].currentTime = 0;
    sounds[23].play()
};

const getSchema = async (location) => {
    try {
        const response = await fetch(location, {
            method: "GET"
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching schema:', error);
        throw error;
    }
};

const fetchData = async (type) => {
    try {
        nftSchema = await getSchema(nftSchemaURL);
        regularSchema = await getSchema(regularSchemaURL);

        const selectedTitle = $(`#${type} .selected`).title;
        marketType.textContent = selectedTitle;

        let obj;

        if (type === 'nft') {
            obj = nftSchema
        } else if (type === 'regular') {
            obj = regularSchema
        }
        descr.textContent = obj[selectedTitle].descr;
        updateSubcategories(obj[selectedTitle].subcat);

        eventListeners(type);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

fetchData('nft');

const marketSwitch = $('#marketTypeSwitch');


marketSwitch.addEventListener('change', () => {
    let switchType;

    if (marketSwitch.checked) {
        switchType = 'regular';
    } else {
        switchType = 'nft';
    }

    $$('.squareSelection div').forEach(el => {
        el.classList.toggle('selected')
    })

    fetchData(switchType);
});

const marketGridFilter = $('#grid_filter');

marketGridFilter.addEventListener('change', () => {
    const checkedID = $('#grid_filter input:checked').id;
    for (let index = 1; index <= 3; index++) {
        $('#market_items').classList.remove('grid' + index)
    }

    $('#market_items').classList.add(checkedID)

});
