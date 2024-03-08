
import { $, $$ } from '/js/selectors.js';

export const carousel = (cellCount) => {
    var carousel = $('.carousel');
    var cells = $$('.carousel div');
    var selectedIndex = 0;
    var cellWidth = carousel.offsetWidth;
    var rotateFn = 'rotateY';
    var radius, theta;
    // console.log( cellWidth, cellHeight );

    const opacitySet = (index) => {
        $$('.carousel div button').forEach((el, i) => {
            if (i === index) {
                el.style.opacity = '1';
            } else {
                el.style.opacity = '0.5';
            }

        })
    }

    function rotateCarousel() {
        var angle = theta * selectedIndex * -1;
        carousel.style.transform = 'translateZ(' + -radius + 'px) ' +
            rotateFn + '(' + angle + 'deg)';
    }

    const prev = () => {
        selectedIndex > 0 ? selectedIndex-- : selectedIndex = 0;
        rotateCarousel();
        opacitySet(selectedIndex)
        // HERE WE DO THE FINAL FETCH/UPDATE: SUBCATEGORY CONTENT
        console.log('Subcategory number: ' + selectedIndex)
    }

    const next = () => {
        selectedIndex < cellCount - 1 ? selectedIndex++ : selectedIndex = cellCount - 1;
        rotateCarousel();
        opacitySet(selectedIndex)
        // HERE WE DO THE FINAL FETCH/UPDATE: SUBCATEGORY CONTENT
        console.log('Subcategory number: ' + selectedIndex)
    }

    if (window.innerWidth <= 690) {
        $('#prevSubCat').addEventListener('touchstart', e => {
            prev()
        });

        $('#nextSubCat').addEventListener('touchstart', e => {
            next()
        });
    } else {
        $('#prevSubCat').addEventListener('mousedown', e => {
            prev()
        });

        $('#nextSubCat').addEventListener('mousedown', e => {
            next()
        });
    }

    function changeCarousel() {
        theta = 360 / cellCount;
        var cellSize = cellWidth;
        radius = Math.round((cellSize / 2) / Math.tan(Math.PI / cellCount));
        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            if (i < cellCount) {
                // visible cell
                cell.style.opacity = 1;
                var cellAngle = theta * i;
                cell.style.transform = rotateFn + '(' + cellAngle + 'deg) translateZ(' + radius + 'px)';
            } else {
                // hidden cell
                cell.style.opacity = 0;
                cell.style.transform = 'none';
            }
        }

        rotateCarousel();
    }

    changeCarousel()
}