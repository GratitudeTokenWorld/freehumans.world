import { $, $$ } from '/js/selectors.js';

export const textPagination = (containerId, textContent) => {
    const container = $('#' + containerId);
    const mainDataContainer = container.querySelector('.main-data-container');
    const prevButton = container.querySelector('.prevBtn');
    const nextButton = container.querySelector('.nextBtn');

    const charsPerPage = 1800;
    let currentPage = 0;
    let pages = [];

    function updateButtons() {
        prevButton.style.display = currentPage === 0 ? 'none' : 'inline-block';
        nextButton.style.display = currentPage === pages.length - 1 ? 'none' : 'inline-block';
    }

    function paginateText() {
        pages = [];
        let remainingText = textContent;

        while (remainingText.length > 0) {
            const chunk = remainingText.slice(0, charsPerPage);
            const lastLineBreakIndex = chunk.lastIndexOf('\n');
            const breakIndex = lastLineBreakIndex !== -1 ? lastLineBreakIndex + 1 : charsPerPage;
            pages.push(remainingText.slice(0, breakIndex));
            remainingText = remainingText.slice(breakIndex).trim();
        }
    }

    function updatePageContent() {
        mainDataContainer.innerHTML = `<p>${pages[currentPage]}</p>`;
    }

    function prevPage() {
        if (currentPage > 0) {
            currentPage--;
            updatePageContent();
            updateButtons();
        }
    }

    function nextPage() {
        if (currentPage < pages.length - 1) {
            currentPage++;
            updatePageContent();
            updateButtons();
        }
    }

    // Initial setup
    paginateText();
    updatePageContent();
    updateButtons();

    // Event listeners
    prevButton.addEventListener('click', prevPage);
    nextButton.addEventListener('click', nextPage);

    // Update on window resize (not changing the logic here)
    window.addEventListener('resize', () => {
        currentPage = 0;
        paginateText();
        updatePageContent();
        updateButtons();
    });
};
