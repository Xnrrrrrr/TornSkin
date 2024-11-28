// ==UserScript==
// @name         New Userscript
// @namespace    bank.ynghoudini.skin
// @version      2024-11-19
// @description  Customize Torn's background
// @author       Bankhole [3466924] & YngHoudini [2768894]
// @match        https://www.torn.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=torn.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const style = document.createElement('style');
            style.textContent = `
            .custom-slider {
                position: relative;
                width: 50px;
                height: 25px;
                background: #ccc;
                border-radius: 15px;
                cursor: pointer;
                transition: background 0.3s;
            }

            .custom-slider.active {
                background: #28a745;
            }

            .slider-thumb {
                position: absolute;
                top: 2px;
                left: 2px;
                width: 21px;
                height: 21px;
                background: white;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                transition: left 0.3s;
            }

            .custom-slider.active .slider-thumb {
                left: 25px;
            }

            .custom-dropdown {
                position: relative;
                width: 100%;
                background: linear-gradient(0deg, #333, #444);
                color: #ddd;
                border: 1px solid whitesmoke;
                border-radius: 5px;
            }

            .dropdown-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 5px 10px;
                cursor: pointer;
            }

            .dropdown-header:hover {
                background: #555;
                border-radius: 5px;
            }

            .dropdown-list {
                position: absolute;
                top: calc(100% - 2px);
                left: -1px;
                width: 100%;
                background: linear-gradient(0deg, #333, #444);
                border: 1px solid whitesmoke;
                border-top: none;
                border-radius: 0 0 5px 5px;
                max-height: 200px;
                overflow-y: auto;
                z-index: 999;
            }

            .dropdown-item-apply,
            .dropdown-item-clear {
                padding: 5px 10px;
                cursor: pointer;
            }

            .dropdown-item-apply:hover,
            .dropdown-item-clear:hover {
                background: #555;
            }

            .arrow {
                font-size: 12px;
                transition: transform 0.3s ease;
            }

            .arrow.open {
                transform: rotate(90deg);
            }`;

    document.head.appendChild(style);

    let backgroundImage = localStorage.getItem("backgroundImage");
    let isMenuOpen = false;
    let opacity = parseFloat(localStorage.getItem("bgOpacity")) || 1;
    let selectedImageApply;
    let savedBackgroundImages = JSON.parse(localStorage.getItem("savedBackgroundImages")) || [{name: "Default", url: "https://4kwallpapers.com/images/walls/thumbs_3t/19127.jpg"}];
    let slideshowTimer = JSON.parse(localStorage.getItem("slideshowTimer")) || 10000; // In ms; min = 10000
    let slideshowEnabled = localStorage.getItem("slideshowEnabled") === "true" || false;
    let slideshowInterval = null; // slideshow interval ID

    const injectHTML = () => {
        const targetElement = document.querySelector('.settings-menu');
        const element = `
        <li class="setting">
            <label for="tornskin-menu-state" class="setting-container">
                <div class="icon-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" class="default___XXAGt" filter="" fill="#fff" stroke="transparent" stroke-width="0" width="28" height="28" viewBox="-6 -4 34 30">
                        <path d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                    </svg>
                </div>
                <span class="setting-name">TornSkin</span>
                <div class="choice-container" id="tornskin-menu">
                    <input id="tornskin-menu-state" class="checkbox-css tornskin-menu" type="checkbox" />
                    <label class="marker-css" for="tornskin-menu-state"></label>
                    <div class="tornskin-menu" style=" position: absolute; top: 205.39px; left: 0; right: 0; bottom: 0px; background: transparent; z-index: 1;"></div>
                </div>
            </label>
        </li>
        `;
        targetElement.insertAdjacentHTML("beforeend", element);

        const menuSpan = document.querySelector('.tornskin-menu');
        if (menuSpan) {
            menuSpan.addEventListener('click', toggleMenu);
        }
        const checkbox = document.getElementById('tornskin-menu-state');
        updateCheckboxState(checkbox);

        document.addEventListener("keydown", (e) => {
            if (e.ctrlKey && e.key === "b") { // Ctrl + B to toggle
                const panel = document.getElementById("background-settings");
                if (panel) panel.style.display = panel.style.display === "none" ? "block" : "none";
                if (panel.style.display === "block") {
                    isMenuOpen = true;
                } else {
                    isMenuOpen = false;
                }
                updateCheckboxState(checkbox);
            }
        });
    }

    const updateCheckboxState = (checkbox) => {
        if (checkbox) {
            checkbox.checked = isMenuOpen;
        }
    };

    const setBackground = () => {
        const targetElement = document.querySelector('.d');
        if (targetElement) {
            targetElement.style.transition = "background-image 0.5s ease-in-out";
            targetElement.style.backgroundImage = `url('${backgroundImage}')`;
            targetElement.style.backgroundSize = "cover";
            targetElement.style.backgroundAttachment = "fixed";
            targetElement.style.backgroundPosition = "center";
        }
        const containers = document.querySelectorAll('.container');
        containers.forEach(container => {
            container.style.opacity = opacity;
        });

        // Added to make the title of pages more visible (needs to be centered and comply with light mode; don't got time for dat)
        // Need one for crimes/market page
        const titleElement = document.querySelector('.content-title');
        if (titleElement) {
            titleElement.style.background = "var(--title-black-gradient)";
            titleElement.style.borderRadius = "5px";
            titleElement.style.padding = "5px";
        }
    };

    const createMenu = () => {
        const existingPanel = document.getElementById('background-settings');
        if (!existingPanel) {
            const menu = `
            <div id="background-settings" style="position: fixed; top: 10px; left: 10px; background: var(--default-bg-panel-color); color: white; z-index: 99999999999999; border-radius: 5px; width: 250px; overflow-y: auto; display: none;">
                <div style="position: relative; display: flex; flex-direction: column; padding: 10px;">
                    <button id="close-menu" style="position: absolute; top: 5px; right: 5px; background: transparent; border: none; color: white; font-size: 22px; cursor: pointer;">&times;</button>
                    <p style="width: 100%; text-align: center; font-weight: bolder; font-size: 18px; margin-bottom: 10px; color: #999">Background Settings</p>

                    <div style="border: 1px whitesmoke solid; padding: 5px; margin-bottom: 10px; color: var(--default-color)">
                        <label for="opacity-slider" id="opacity-label" style="color: var(--default-color)">Torn Opacity: ${opacity}</label>
                        <input type="range" id="opacity-slider" min="0.4" max="1" step="0.05" value="${opacity}" style="width: 100%;">
                    </div>

                    <div style="border: 1px whitesmoke solid; padding: 5px; margin-bottom: 10px; display=flex; flex-direction: column;">
                        <label for="bg-name" color: style="color: var(--default-color)">Background Name:</label>
                        <input type="text" id="bg-name" placeholder="Enter background name" value="" style="margin-bottom: 10px; width: calc(100% - 6px); background: linear-gradient(0deg, #333, #444); color: #ddd; padding: 3px; border-radius: 5px; border: 1px solid whitesmoke;">

                        <label for="bg-url" style="color: var(--default-color)">Save an Image (URL):</label>
                        <input type="text" style="margin-bottom: 10px; width: calc(100% - 6px); background: linear-gradient(0deg, #333, #444); color: #ddd; padding: 3px; border-radius: 5px; border: 1px solid whitesmoke;" id="bg-url" placeholder="ex: https://example.com/image.jpg">
                        <p style="text-align: center; margin-bottom: 10px; color: var(--default-color)">OR</p>
                        <input style="margin-bottom: 10px;" type="file" id="upload-bg-images" accept="image/*">
                        <button id="remove-uploaded-file" style="margin-bottom: 10px; margin-top: -5px; color: #ff5555; cursor: pointer; width: 100%; display: none;">Remove File</button>

                        <button id="save-bg" style="padding-bottom: 10px; margin-bottom: 5px; cursor: pointer; color: #ccc; width: 100%; border-bottom: 1px whitesmoke dotted;">Save Background</button>

                        <div class="custom-dropdown" style="margin-bottom: 10px;">
                            <div class="dropdown-header" id="dropdown-header-apply">
                                <span id="selected-value-apply">Select Background</span>
                                <span class="arrow" id="dropdown-arrow-apply">▶</span>
                            </div>
                            <ul class="dropdown-list" id="dropdown-list-apply" style="display: none;">
                                ${savedBackgroundImages.map((image, index) => `<li class="dropdown-item-apply" data-value="${image.url}" id="dropdown-item-${index}-apply">${image.name}</li>`).join('')}
                            </ul>
                        </div>
                        <button id="apply-bg" style="padding-bottom: 10px; margin-bottom: 5px; cursor: pointer; color: #ccc; width: 100%; border-bottom: 1px whitesmoke dotted;">Apply Background</button>

                        <div class="custom-dropdown" style="margin-bottom: 10px;">
                            <div class="dropdown-header" id="dropdown-header-clear">
                                <span id="selected-value-clear">Remove a Background</span>
                                <span class="arrow" id="dropdown-arrow-clear">▶</span>
                            </div>
                            <ul class="dropdown-list" id="dropdown-list-clear" style="display: none;">
                                ${savedBackgroundImages.map((image, index) => `<li class="dropdown-item-clear" id="dropdown-item-${index}-clear">${image.name}</li>`).join('')}
                            </ul>
                        </div>
                        <button id="clear-selected-bg" style="padding-bottom: 10px; margin-bottom: 5px; cursor: pointer; color: #ccc; width: 100%; border-bottom: 1px whitesmoke dotted;">Clear Background</button>

                        <button id="clear-all-bgs" style="color: #ff5555; cursor: pointer; width: 100%;">Clear All Saved Backgrounds</button>
                    </div>
                    <div style="border: 1px whitesmoke solid; padding: 5px; margin-bottom: 10px; display=flex; flex-direction: column;">
                        <label for="slideshow-timer" style="color: var(--default-color)">Slideshow Timer (ms):</label>
                        <input id="slideshow-timer" type="number" value="${slideshowTimer}" min="10000" style="margin-bottom: 10px; width: calc(100% - 6px); background: linear-gradient(0deg, #333, #444); color: #ddd; padding: 3px; border-radius: 5px; border: 1px solid whitesmoke;">

                        <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
                            <label style="color: var(--default-color)">Toggle Slideshow:</label>
                            <div id="slideshow-toggle" class="custom-slider ${slideshowEnabled ? "active" : ""}">
                                <div class="slider-thumb"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML("beforeend", menu);

            document.getElementById('opacity-slider').addEventListener('input', updateOpacity);
            document.getElementById('close-menu').addEventListener('click', toggleMenu);
            document.getElementById('save-bg').addEventListener('click', saveBackground);
            document.getElementById('apply-bg').addEventListener('click', applySelectedBackground);
            document.getElementById('clear-selected-bg').addEventListener('click', clearSelectedBackground);
            document.getElementById('clear-all-bgs').addEventListener('click', clearSavedBackgrounds);
            document.getElementById('upload-bg-images').addEventListener('change', handleFileUpload);
            document.getElementById('remove-uploaded-file').addEventListener('click', removeUploadedFile);
            document.getElementById('slideshow-timer').addEventListener('input', updateSlideshowTimer);
            document.getElementById('slideshow-toggle').addEventListener('click', toggleSlideshow);

            // Apply Dropdown
            initDropdown({
                headerId: 'dropdown-header-apply',
                listId: 'dropdown-list-apply',
                arrowId: 'dropdown-arrow-apply',
                selectedValueId: 'selected-value-apply',
                itemClass: 'dropdown-item-apply',
                onItemSelect: (value, name) => {
                    selectedImageApply = value;
                    console.log(`Selected Apply Background: ${name}`);
                },
                re: false,
            });

            // Clear Dropdown
            initDropdown({
                headerId: 'dropdown-header-clear',
                listId: 'dropdown-list-clear',
                arrowId: 'dropdown-arrow-clear',
                selectedValueId: 'selected-value-clear',
                itemClass: 'dropdown-item-clear',
                onItemSelect: (value, name) => {
                    console.log(`Selected Clear Background: ${name}`);
                },
                re: false,
            });

            if (!savedBackgroundImages.length) {
                const dropdownListApply = document.getElementById('dropdown-list-apply');
                const selectedValueApply = document.getElementById('selected-value-apply');
                const dropdownListClear = document.getElementById('dropdown-list-clear');
                const selectedValueClear = document.getElementById('selected-value-clear');

                dropdownListApply.innerHTML = '<li class="dropdown-item"></li>';
                selectedValueApply.textContent = 'No backgrounds saved';
                dropdownListClear.innerHTML = '<li class="dropdown-item"></li>';
                selectedValueClear.textContent = 'No backgrounds saved';
            }

            addHoverEffect(
                document.getElementById('close-menu'),
                { transform: 'scale(1.3)' },
                { transform: 'scale(1)' }
            );

            addHoverEffect(
                document.getElementById('save-bg'),
                { color: '#fff', filter: 'brightness(1.2)' },
                { color: '#ccc', filter: 'brightness(1)' }
            );

            addHoverEffect(
                document.getElementById('apply-bg'),
                { color: '#fff', filter: 'brightness(1.2)' },
                { color: '#ccc', filter: 'brightness(1)' }
            );

            addHoverEffect(
                document.getElementById('clear-selected-bg'),
                { color: '#fff', filter: 'brightness(1.2)' },
                { color: '#ccc', filter: 'brightness(1)' }
            );

            addHoverEffect(
                document.getElementById('clear-all-bgs'),
                { color: '#d41919', filter: 'brightness(1.5)' },
                { color: '#ff5555', filter: 'brightness(1)' }
            );

            addHoverEffect(
                document.getElementById('remove-uploaded-file'),
                { color: '#d41919', filter: 'brightness(1.5)' },
                { color: '#ff5555', filter: 'brightness(1)' }
            );
        }
    };

    const updateOpacity = (e) => {
        opacity = e.target.value;
        localStorage.setItem("bgOpacity", opacity);
        const containers = document.querySelectorAll('.container');
        containers.forEach(container => {
            container.style.opacity = opacity;
        });

        // Update the HTML
        const label = document.getElementById('opacity-label');
        label.outerHTML = `<label for="opacity-slider" id="opacity-label" style="color: var(--default-color)">Torn Opacity: ${opacity}</label>`;
    };

    const saveBackground = () => {
        const bgName = document.getElementById('bg-name').value.trim();
        const bgUrl = document.getElementById('bg-url').value.trim();
        const bgUpload = document.getElementById('upload-bg-images').files[0];

        // Validate the inputs
        if (!bgName || (!bgUrl && !bgUpload)) {
            alert("Please provide a background name and either a URL or an uploaded image.");
            return;
        }

        if (bgUrl && bgUpload) {
            alert("Please provide a background url OR upload an image.");
            document.getElementById('bg-url').value = "";
            removeUploadedFile();
            return;
        }

        // Check if the name already exists
        if (savedBackgroundImages.some(image => image.name.toLowerCase() === bgName.toLowerCase())) {
            alert("A background with this name already exists. Please choose a different name.");
            document.getElementById('bg-name').value = "";
            return;
        }

        // Check if the URL already exists
        if (bgUrl && savedBackgroundImages.some(image => image.url === bgUrl)) {
            alert("This background URL is already saved.");
            document.getElementById('bg-url').value = "";
            return;
        }

        // Handle uploaded image
        if (bgUpload) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const uploadedImageUrl = e.target.result; // Base64 URL of the uploaded image

                // Check if uploaded image URL already exists
                if (savedBackgroundImages.some(image => image.url === uploadedImageUrl)) {
                    alert("This uploaded image is already saved.");
                    return;
                }

                // Add the uploaded image to the saved backgrounds
                savedBackgroundImages.push({ name: bgName, url: uploadedImageUrl });
                localStorage.setItem("savedBackgroundImages", JSON.stringify(savedBackgroundImages));
                updateBackgroundDropdown();
            };
            reader.readAsDataURL(bgUpload); // Convert the file to a Base64 URL
        } else if (bgUrl) {
            // Handle URL input
            savedBackgroundImages.push({ name: bgName, url: bgUrl });
            localStorage.setItem("savedBackgroundImages", JSON.stringify(savedBackgroundImages));
            updateBackgroundDropdown();
        }

        if (slideshowEnabled) {
            startSlideshow();
        }

        // Clear inputs
        document.getElementById('bg-name').value = "";
        document.getElementById('bg-url').value = "";
        removeUploadedFile();
    };

    const updateBackgroundDropdown = () => {
        const dropdownHeaderApply = document.getElementById('dropdown-header-apply');
        const dropdownListApply = document.getElementById('dropdown-list-apply');
        const dropdownArrowApply = document.getElementById('dropdown-arrow-apply');
        const selectedValueApply = document.getElementById('selected-value-apply');

        const dropdownHeaderClear = document.getElementById('dropdown-header-clear');
        const dropdownListClear = document.getElementById('dropdown-list-clear');
        const dropdownArrowClear = document.getElementById('dropdown-arrow-clear');
        const selectedValueClear = document.getElementById('selected-value-clear');


        if (savedBackgroundImages.length) {
            dropdownListApply.innerHTML = savedBackgroundImages
                .map((image, index) => `<li class="dropdown-item-apply" data-value="${image.url}" id="dropdown-item-${index}-apply">${image.name}</li>`).join('');
            dropdownListClear.innerHTML = savedBackgroundImages
                .map((image, index) => `<li class="dropdown-item-clear" id="dropdown-item-${index}-clear">${image.name}</li>`).join('');
            selectedValueApply.textContent = 'Select Background';
            selectedValueClear.textContent = 'Remove a Background';
        } else {
            dropdownListApply.innerHTML = '<li class="dropdown-item"></li>';
            selectedValueApply.textContent = 'No backgrounds saved';
            dropdownListClear.innerHTML = '<li class="dropdown-item"></li>';
            selectedValueClear.textContent = 'No backgrounds saved';
        }

        const updateDropdown = ({
            headerId,
            listId,
            arrowId,
            selectedValueId,
            itemClass,
            placeholderText,
            onItemSelect
        }) => {
            const dropdownHeader = document.getElementById(headerId);
            const dropdownList = document.getElementById(listId);
            const dropdownArrow = document.getElementById(arrowId);
            const selectedValue = document.getElementById(selectedValueId);

            // Update dropdown list items
            if (savedBackgroundImages.length) {
                if (headerId === 'dropdown-header-apply') {
                    dropdownList.innerHTML = savedBackgroundImages.map((image, index) => `<li class="dropdown-item-apply" data-value="${image.url}" id="dropdown-item-${index}-apply">${image.name}</li>`).join('');
                } else if (headerId === 'dropdown-header-clear') {
                    dropdownList.innerHTML = savedBackgroundImages.map((image, index) => `<li class="dropdown-item-clear" id="dropdown-item-${index}-clear">${image.name}</li>`).join('');
                }

                selectedValue.textContent = placeholderText;
            } else {
                dropdownList.innerHTML = `<li class="${itemClass}"></li>`;
                selectedValue.textContent = 'No backgrounds saved';
            }

            // Re-initialize the dropdown
            initDropdown({
                headerId,
                listId,
                arrowId,
                selectedValueId,
                itemClass,
                onItemSelect,
                re: true,
            });
        };

        // reset apply state
        selectedImageApply = null;

        // Update the "Apply Background" dropdown
        updateDropdown({
            headerId: 'dropdown-header-apply',
            listId: 'dropdown-list-apply',
            arrowId: 'dropdown-arrow-apply',
            selectedValueId: 'selected-value-apply',
            itemClass: 'dropdown-item-apply',
            placeholderText: 'Select Background',
            onItemSelect: (value, name) => {
                selectedImageApply = value;
                console.log(`Selected Apply Background: ${name}`);
            },
        });

        // Update the "Remove Background" dropdown
        updateDropdown({
            headerId: 'dropdown-header-clear',
            listId: 'dropdown-list-clear',
            arrowId: 'dropdown-arrow-clear',
            selectedValueId: 'selected-value-clear',
            itemClass: 'dropdown-item-clear',
            placeholderText: 'Remove a Background',
            onItemSelect: (value, name) => {
                console.log(`Selected Clear Background: ${name}`);
            },
        });
    };

    const applySelectedBackground = () => {
        if (selectedImageApply) {
            backgroundImage = selectedImageApply;
            localStorage.setItem("backgroundImage", backgroundImage);
            if (slideshowEnabled) {
                const slider = document.getElementById('slideshow-toggle');
                slider.classList.remove('active');
                stopSlideshow();
            } else {
                setBackground();
            }
        }
    };

    const clearSelectedBackground = () => {
        const selectedBackgroundName = document.getElementById('selected-value-clear').textContent;

        const targetIndex = savedBackgroundImages.findIndex(
            (background) => background.name.toLowerCase() === selectedBackgroundName.toLowerCase()
        );

        if (targetIndex === -1) return;

        const removedBackground = savedBackgroundImages.splice(targetIndex, 1)[0];
        localStorage.setItem("savedBackgroundImages", JSON.stringify(savedBackgroundImages));

        if (backgroundImage === removedBackground.url) {
            backgroundImage = "";
            localStorage.setItem("backgroundImage", backgroundImage);
            if (slideshowEnabled) {
                const slider = document.getElementById('slideshow-toggle');
                slider.classList.remove('active');
                stopSlideshow();
            } else {
                setBackground();
            }
        } else {
            if (savedBackgroundImages.length < 2 && slideshowEnabled) {
                const slider = document.getElementById('slideshow-toggle');
                slider.classList.remove('active');
                stopSlideshow();
            }
        }

        updateBackgroundDropdown();
    }

    const clearSavedBackgrounds = () => {
        const clearButton = document.getElementById('clear-all-bgs');
        if (!clearButton) return;

        // Replace the button with Yes and No options
        clearButton.outerHTML = `
        <div id="clear-confirmation" style="display: flex; justify-content: space-between; gap: 10px; margin-bottom: 5px;">
            <button id="confirm-clear" style="flex: 1; background: #ff5555; color: var(--default-color); border: none; cursor: pointer;">Yes</button>
            <button id="cancel-clear" style="flex: 1; background: #28a745; color: var(--default-color); border: none; cursor: pointer;">No</button>
        </div>`;

        // Add Yes/No buttons
        document.getElementById('confirm-clear').addEventListener('click', () => {
            savedBackgroundImages = [];
            localStorage.setItem("savedBackgroundImages", JSON.stringify(savedBackgroundImages));
            backgroundImage = "";
            localStorage.setItem("backgroundImage", JSON.stringify(backgroundImage));
            if (slideshowEnabled) {
                const slider = document.getElementById('slideshow-toggle');
                slider.classList.remove('active');
                stopSlideshow();
            } else {
                setBackground();
            }
            updateBackgroundDropdown();
            restoreClearButton();
    });

        document.getElementById('cancel-clear').addEventListener('click', restoreClearButton);
    };

    // Restore the original Clear Saved Backgrounds button
    const restoreClearButton = () => {
        const confirmationDiv = document.getElementById('clear-confirmation');
        if (confirmationDiv) {
            confirmationDiv.outerHTML = `<button id="clear-all-bgs" style="width: 100%; color: #ff5555; cursor: pointer;">Clear All Saved Backgrounds</button>`;
            document.getElementById('clear-all-bgs').addEventListener('click', clearSavedBackgrounds);

            addHoverEffect(
                document.getElementById('clear-all-bgs'),
                { color: '#d41919', filter: 'brightness(1.5)' },
                { color: '#ff5555', filter: 'brightness(1)' }
            );
        }
    };

    const toggleMenu = () => {
        isMenuOpen = !isMenuOpen;
        const panel = document.getElementById('background-settings');
        if (panel) {
            panel.style.display = isMenuOpen ? "block" : "none";
        }
        const checkbox = document.getElementById('tornskin-menu-state');
        updateCheckboxState(checkbox);
    };

    const addHoverEffect = (element, hoverStyles = {}, defaultStyles = {}) => {
        element.addEventListener('mouseenter', () => {
            Object.assign(element.style, hoverStyles);
        });

        element.addEventListener('mouseleave', () => {
            Object.assign(element.style, defaultStyles);
        });
    };

    const handleFileUpload = () => {
        const fileInput = document.getElementById('upload-bg-images');
        const removeButton = document.getElementById('remove-uploaded-file');

        if (fileInput.files.length > 0) {
            removeButton.style.display = 'block';
        } else {
            removeButton.style.display = 'none';
        }
    };

    const removeUploadedFile = () => {
        const fileInput = document.getElementById('upload-bg-images');
        const removeButton = document.getElementById('remove-uploaded-file');

        fileInput.value = "";
        removeButton.style.display = 'none';
    };

    const updateSlideshowTimer = (e) => {
        let value = parseInt(e.target.value, 10);

        // Validate the input to ensure it's at least 10000 ms
        if (isNaN(value) || value < 10000) {
            value = 10000;
        }

        slideshowTimer = value;
        localStorage.setItem("slideshowTimer", slideshowTimer);

        // Reflect the validated value in the input field
        e.target.value = value;

        // Restart the slideshow if it's running
        if (slideshowEnabled) {
            startSlideshow();
        }
    };

    const toggleSlideshow = () => {
        const slider = document.getElementById('slideshow-toggle');
        slideshowEnabled = !slideshowEnabled;
        localStorage.setItem("slideshowEnabled", slideshowEnabled);

        if (slideshowEnabled) {
            slider.classList.add('active');
            startSlideshow();
        } else {
            slider.classList.remove('active');
            stopSlideshow();
        }
    };

    const startSlideshow = () => {
        if (savedBackgroundImages.length < 2) {
            alert("You need at least 2 backgrounds to start a slideshow.");
            const slider = document.getElementById('slideshow-toggle');
            slider.classList.remove('active');
            stopSlideshow();
            return;
        }

        let currentIndex = 0;

        if (slideshowInterval) clearInterval(slideshowInterval);

        // Start the slideshow
        slideshowInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % savedBackgroundImages.length;
            backgroundImage = savedBackgroundImages[currentIndex].url;
            localStorage.setItem("backgroundImage", backgroundImage);
            setBackground();
        }, slideshowTimer);
    };

    const stopSlideshow = () => {
        if (slideshowInterval) clearInterval(slideshowInterval);
        slideshowEnabled = false;
        localStorage.setItem("slideshowEnabled", slideshowEnabled);

        backgroundImage = savedBackgroundImages[0]?.url || "";
        localStorage.setItem("backgroundImage", backgroundImage);
        setBackground();
    };

    const initSlideshow = () => {
        const slider = document.getElementById('slideshow-toggle');
        if (slideshowEnabled) {
            startSlideshow();
            slider.classList.add('active');
        }
    }

    const initDropdown = ({ headerId, listId, arrowId, selectedValueId, itemClass, onItemSelect, re }) => {
        const dropdownHeader = document.getElementById(headerId);
        const dropdownList = document.getElementById(listId);
        const dropdownArrow = document.getElementById(arrowId);
        const selectedValue = document.getElementById(selectedValueId);

        if (!re){
            // Toggle dropdown visibility
            dropdownHeader.addEventListener('click', () => {
                const isVisible = dropdownList.style.display === 'block';
                dropdownList.style.display = isVisible ? 'none' : 'block';
                dropdownArrow.classList.toggle('open', !isVisible);
            });
        }

        // Handle item selection
        document.querySelectorAll(`.${itemClass}`).forEach((item) => {
            item.addEventListener('click', (e) => {
                const value = e.target.getAttribute('data-value');
                const name = e.target.textContent;

                // Update selected value
                selectedValue.textContent = name;

                // Custom item select logic
                if (onItemSelect) onItemSelect(value, name);

                // Close dropdown
                dropdownList.style.display = 'none';
                dropdownArrow.classList.remove('open');
            });
        });

        // Close dropdown if clicked outside
        document.addEventListener('click', (e) => {
            if (!dropdownHeader.contains(e.target)) {
                dropdownList.style.display = 'none';
                dropdownArrow.classList.remove('open');
            }
        });

        return { dropdownHeader, dropdownList, dropdownArrow, selectedValue };
    };

    injectHTML();
    setBackground();
    createMenu();
    initSlideshow();
})();

//----------------------------------------------//
//              FixList                         //
//----------------------------------------------//    4 stev w luv

// control panel changes chat buttons from fixed position - bottom right ✅
// fix positoning on SVG ✅
// add check box to icon ❌
// add hover effect to SVG ❌
// add hover effect to TornSkin✅
// control panel resizes incorrectly into home button top right ❌
// add preview and select feature within control panel ❌
// modernize control panel - shadows etc ❌
// features to be added - background image preview ❌
// random background button on control panel ❌
// fade transition background option ❌
// reset button for backgrounds ❌
// button to choose between static background and image vs slideshow ❌
// control panel does not maintian  persistance upon webpage actions ❌

//----------------------------------------------//
//              Ideas                           //
//----------------------------------------------//    4 stev w h8

// keyboard shortcut to toggle panel
// could utilize a wallpaper API and give options to choose from for stock or slideshow
// ability to preview your wallpapers
// add to menu bar to drop down
// cursor theme
// performance optimizer - toggle that can reduce opacity for background, or reduce opacity for site itself
// resource intesive features ex. particle effects animated snow or something
// advanced settings panel
