export function debounce(handler, time) {
    var timeout;
    return function () {
        var self = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            return handler.apply(self, args);
        }, time);
    };
}