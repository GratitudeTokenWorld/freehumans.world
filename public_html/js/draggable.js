import { $, $$ } from '/js/selectors.js';
import { defaultSounds } from '/js/sounds-preloading.js';
let sounds = defaultSounds('lucianape3', null, null)

export const draggableStuff = () => {
    document.addEventListener('DOMContentLoaded', () => {
        const bagsSpaceLimit = 20; // Define the limit for bags space
        let currentDraggedImg = null;
        let touchStartX = 0;
        let touchStartY = 0;
        let isDragging = false;

        // Function to calculate the position of an nft element
        const calculatePosition = (nftElement) => {
            const nfts = Array.from($$('bags_space nft')).slice(0, bagsSpaceLimit);
            return nfts.indexOf(nftElement) + 1;
        };

        // Common function to swap images and classes
        const swapImagesAndClasses = (sourceParent, targetParent) => {
            const draggedImg = sourceParent.querySelector('img');
            const targetImage = targetParent.querySelector('img');
            if (targetImage) sourceParent.appendChild(targetImage);
            targetParent.appendChild(draggedImg);

            [sourceParent.className, targetParent.className] = [targetParent.className, sourceParent.className];
            console.log(`Moved item to position ${calculatePosition(targetParent)}`);
        };

        // Common function to revert the image and its classList to the original position
        const revertImageAndClass = (sourceParent) => {
            const originalImg = sourceParent.querySelector('img');
            sourceParent.appendChild(originalImg);

            console.log(`Reverted image to original position`);
        };

        // Unified click handler for nft elements
        const handleNFTClick = (nftElement) => {
            if (nftElement.children.length > 0) { // Check if nft element has children
                console.log("NFT clicked", nftElement.id);
                $('tooltip .sell').style.display = 'inline-block';
                $('tooltip .buy').style.display = 'none';
                $('tooltip').style = 'opacity: 1; transform: scale(1); top: 63px; right: 10px';
            }
        };

        // PC drag-and-drop handlers
        const handleDragStart = (e) => {
            if (e.target.tagName === 'IMG' && e.target.parentElement.tagName === 'NFT') {
                currentDraggedImg = e.target;
                e.dataTransfer.setData('text/plain', e.target.parentElement.id);
                e.dataTransfer.effectAllowed = 'move';
                isDragging = true;
            }
            if (sounds) {
                sounds[25].currentTime = 0;
                sounds[25].play()
            }
        };

        const handleDragOver = (e) => {
            e.preventDefault(); // Necessary to allow dropping
        };

        const handleDrop = (e) => {
            e.preventDefault();
            const sourceParentId = e.dataTransfer.getData('text/plain');
            const sourceParent = document.getElementById(sourceParentId);
            const targetParent = e.target.closest('nft');

            if (targetParent) {
                const newPosition = calculatePosition(targetParent);
                if (newPosition <= bagsSpaceLimit) {
                    swapImagesAndClasses(sourceParent, targetParent);
                } else {
                    console.log(`Cannot move to position ${newPosition} - exceeds the limit.`);
                    revertImageAndClass(sourceParent);
                }
            }
            currentDraggedImg = null;
            isDragging = false;
            if (sounds) {
                sounds[30].currentTime = 0;
                sounds[30].play()
            }
        };

        let clonedImage = null; // To keep track of the cloned image for mobile drag

        // Function to create and position the cloned image
        const createClonedImage = (img) => {
            clonedImage = img.cloneNode(true);
            document.body.appendChild(clonedImage);
            clonedImage.style.position = 'absolute';
            clonedImage.style.pointerEvents = 'none'; // Ignore pointer events
            clonedImage.style.zIndex = '1000'; // Ensure it's on top
        };

        // Function to update the position of the cloned image
        const moveClonedImage = (touchX, touchY) => {
            if (clonedImage) {
                clonedImage.style.left = touchX - 32 + 'px';
                clonedImage.style.top = touchY - 32 + 'px';
            }
        };

        // Function to remove the cloned image
        const removeClonedImage = () => {
            if (clonedImage) {
                document.body.removeChild(clonedImage);
                clonedImage = null;
            }
        };

        // Touch handlers for mobile
        const handleTouchStart = (e) => {
            if (e.target.tagName === 'IMG' && e.target.parentElement.tagName === 'NFT') {
                currentDraggedImg = e.target;
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                e.preventDefault();
                isDragging = false;
            }

            if (currentDraggedImg) {
                createClonedImage(currentDraggedImg);
                moveClonedImage(e.touches[0].clientX, e.touches[0].clientY);
            }

            if (sounds) {
                sounds[25].currentTime = 0;
                sounds[25].play()
            }
        };

        const handleTouchMove = (e) => {
            if (currentDraggedImg) {
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                const xDiff = Math.abs(touchEndX - touchStartX);
                const yDiff = Math.abs(touchEndY - touchStartY);

                if (xDiff > 10 || yDiff > 10) { // Adjust this threshold as needed
                    isDragging = true;
                }
            }

            moveClonedImage(e.touches[0].clientX, e.touches[0].clientY);
        };

        const handleTouchEnd = (e) => {
            e.preventDefault();
            if (!isDragging && currentDraggedImg) {
                // Handle as a tap
                const targetElement = document.elementFromPoint(
                    e.changedTouches[0].clientX,
                    e.changedTouches[0].clientY
                );
                const targetParent = targetElement.closest('nft');
                if (targetParent) {
                    handleNFTClick(targetParent);
                }
            } else if (isDragging && currentDraggedImg) {
                // Handle as a drag
                const targetElement = document.elementFromPoint(
                    e.changedTouches[0].clientX,
                    e.changedTouches[0].clientY
                );
                const targetParent = targetElement.closest('nft');
                if (targetParent) {
                    const sourceParent = currentDraggedImg.parentElement;
                    const newPosition = calculatePosition(targetParent);
                    if (newPosition <= bagsSpaceLimit) {
                        swapImagesAndClasses(sourceParent, targetParent);
                    } else {
                        console.log(`Cannot move to position ${newPosition} - it exceeds the space available.`);
                        revertImageAndClass(sourceParent);
                    }
                }
            }

            currentDraggedImg = null;
            isDragging = false;

            removeClonedImage();

            if (sounds) {
                sounds[30].currentTime = 0;
                sounds[30].play()
            }
        };

        // Attach event listeners for both PC and mobile
        $$('bags_space nft img').forEach(img => {
            // PC event listeners
            img.setAttribute('draggable', 'true');
            img.addEventListener('dragstart', handleDragStart);
            img.addEventListener('dragover', handleDragOver);
            img.addEventListener('drop', handleDrop);

            // Mobile event listeners
            img.addEventListener('touchstart', handleTouchStart, { passive: false });
            img.addEventListener('touchmove', handleTouchMove, { passive: false });
            img.addEventListener('touchend', handleTouchEnd, { passive: false });
        });

        // Attach click event listeners to nft elements for PC and touchend for mobile
        $$('bags_space nft').forEach(nft => {
            nft.addEventListener('click', () => handleNFTClick(nft));
            nft.addEventListener('dragover', handleDragOver);
            nft.addEventListener('drop', handleDrop);
        });
    });

}
