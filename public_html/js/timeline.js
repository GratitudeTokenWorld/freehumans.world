import { $, $$ } from '/js/selectors.js';
import { filters } from '/js/filters.js';
import { pop_it } from '/js/shortMessage.js';
filters()

// PAGE ACTIONS
$$('.connect_page button').forEach(el => {
    pop_it(el, ['connecting', 'disconnect'], ['Disconnect', 'Connect'], ['/avatars/dyablohunter.webp', '/avatars/dyablohunter.webp'], '#000', ['Connected', 'Disconnected'], ['biip', 'biip-reverse'], 'lucianape3', false)
})