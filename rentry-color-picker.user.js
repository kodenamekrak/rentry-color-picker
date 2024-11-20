// ==UserScript==
// @name Rentry Color Picker
// @description Adds color pickers to the rentry edit pages for the background colors
// @match https://rentry.co/*/edit
// @match https://rentry.org/*/edit
// @top-level-await
// ==/UserScript==

function componentToHex(c) {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(s) {
    const [r, g, b] = s.split('(')[1].split(')')[0].split(',').map(s => Number(s.trim()));
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

/**
 * @param {string} selector
 * @returns {HTMLElement}
 */
async function waitForElement(selector) {
    return new Promise((resolve) => {
        if(document.querySelector(selector)) {
            resolve(document.querySelector(selector));
        }
    
        const observer = new MutationObserver(() => {
            if(document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });
        observer.observe(document.body, {childList: true, subtree: true});
    });
}

const previewOuterContainer = await waitForElement('div.sub-body:nth-child(5)');
const previewInnerContainer = await waitForElement('.entry-text-container > div:nth-child(1)');
const metadataInput = await waitForElement('#metadata_text');

const setMetadataColor = (name, value) => {
    const index = metadataInput.value.search(name)
    // if the value is already in the metadata then set it
    // wierd regex stuff to keep the amount of spaces used the same
    if(index >= 0) {
        const regex = new RegExp(`[\\s\\S]{${index}}${name} *= *`);
        const valueStart = metadataInput.value.match(regex)[0].length;
        metadataInput.value = metadataInput.value.replace(metadataInput.value.substr(valueStart, 7), value);
    }
    // else just add it to the end
    else {
        metadataInput.value += `\n${name} = ${value}`;
    }
};

const inputContainer = document.createElement('div');
inputContainer.style.display = 'flex';
inputContainer.style.gap = '3px'
inputContainer.style.top = 0;
inputContainer.style.right = 0;
inputContainer.style.float = 'right';
inputContainer.style.marginTop = '2px';
inputContainer.style.marginRight = '2px';

previewOuterContainer.insertBefore(inputContainer, previewOuterContainer.children[0]);

const outerInput = document.createElement('input');
outerInput.type = 'color'
outerInput.value = rgbToHex(getComputedStyle(previewOuterContainer).backgroundColor);
outerInput.onchange = () => {
    previewOuterContainer.style.backgroundColor = outerInput.value;
    setMetadataColor('CONTAINER_OUTER_FOREGROUND_COLOR', outerInput.value);
};
inputContainer.append(outerInput);

const innerInput = document.createElement('input');
innerInput.type = 'color'
innerInput.value = rgbToHex(getComputedStyle(previewInnerContainer).backgroundColor);
innerInput.onchange = () => {
    previewInnerContainer.style.backgroundColor = innerInput.value;
    setMetadataColor('CONTAINER_INNER_BACKGROUND_COLOR', innerInput.value);
}
inputContainer.append(innerInput);