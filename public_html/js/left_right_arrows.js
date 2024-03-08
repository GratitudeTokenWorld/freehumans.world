export const left_right_arrows = (element, prevButton, nextButton) => {

    const updateButtonVisibility = () => {
        prevButton.classList.toggle('hidden', element.scrollLeft === 0);
        nextButton.classList.toggle('hidden', element.scrollLeft >= element.scrollWidth - element.offsetWidth);
    };

    prevButton.addEventListener('click', e => {
        e.preventDefault();
        console.log('clicked Left button');
        element.scrollLeft -= (element.offsetWidth * 0.25) + 2;
        updateButtonVisibility();
    });

    nextButton.addEventListener('click', e => {
        e.preventDefault();
        console.log('clicked Right button');
        element.scrollLeft += (element.offsetWidth * 0.25) + 2;
        updateButtonVisibility();
    });

    updateButtonVisibility(); // Initial check on load

    // Optional: Recheck when window is resized
    window.addEventListener('resize', updateButtonVisibility);
}