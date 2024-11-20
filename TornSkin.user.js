// ==UserScript==
// @name         New Userscript
// @namespace    bank.ynghoudini.skin
// @version      2024-11-19
// @description  Customize Torn's background
// @author       Bankhole & YngHoudini
// @match        https://www.torn.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=torn.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let backgroundImage =
        localStorage.getItem("backgroundImage") ||
        "https://4kwallpapers.com/images/walls/thumbs_3t/19127.jpg";
    let isMenuOpen = false;

    const injectHTML = () => {
    const targetElement = document.querySelector('.settings-menu');
    const element = `
    <li id="tornskin-menu" style="width: 100%; height: 34px; display: flex; align-items: center; cursor: pointer; transition: background-color 0.3s ease;">
        <div class="icon-wrapper" style="width: 32px; text-align: center; display: inline-block;">
            <!-- Using image for external SVG -->
            <img src="https://www.svgrepo.com/show/503001/camera.svg" width="28" height="34" style="padding-left: 5px; transition: filter 0.3s ease;" />
        </div>
        <div class="link-text" style="display: inline-block; color: #ccc; user-select: none; line-height: 34px; vertical-align: middle; font-family: Arial, Helvetica, sans-serif; font-size: 12px; transition: color 0.3s ease;">
            TornSkin
        </div>
    </li>
    `;
    targetElement.insertAdjacentHTML("afterbegin", element);
    const menuSpan = document.getElementById('tornskin-menu');
    if (menuSpan) {
        menuSpan.addEventListener('click', toggleMenu);
    }

    // Add hover effects using JavaScript by applying a class
    const tornskinMenu = document.getElementById('tornskin-menu');
    tornskinMenu.addEventListener('mouseenter', () => {
        tornskinMenu.style.backgroundColor = '#333';// Change background color on hover
        tornskinMenu.querySelector('.link-text').style.color = '#fff';// Change text color on hover
        tornskinMenu.querySelector('.icon-wrapper img').style.filter = 'brightness(1.2)';// Brighten the icon on hover
    });

    tornskinMenu.addEventListener('mouseleave', () => {
        tornskinMenu.style.backgroundColor = '';// Reset background color
        tornskinMenu.querySelector('.link-text').style.color = '#ccc';// Reset text color
        tornskinMenu.querySelector('.icon-wrapper img').style.filter = 'brightness(1)';// Reset icon brightness
    });
};




    const setBackground = () => {
        const targetElement = document.querySelector('.d');
        if (targetElement) {
            targetElement.style.backgroundImage = `url('${backgroundImage}')`;
            targetElement.style.backgroundSize = "cover";
            targetElement.style.backgroundAttachment = "fixed";
            targetElement.style.backgroundPosition = "center";
        }
    };

    const createMenu = () => {
        const existingPanel = document.getElementById('background-settings');
        if (!existingPanel) {
            const menu = `
            <div id="background-settings" style="position: fixed; top: 10px; left: 10px; background: rgba(22, 22, 22, 0.8); color: white; z-index: 99999999999999; border-radius: 5px; width: 300px; overflow-y: auto; display: none;">
                <div style="display: flex; justify-content: center; flex-direction: column">
                    <p>Background Settings</p>
                    <label for="bg-opacity">Opacity:</label>
                    <label for="bg-url">Image URL:</label>
                    <input type="text" id="bg-url" placeholder="Enter image URL" value="${backgroundImage}">
                    <button id="apply-bg">Set Background</button>

                    <div style="margin-top: 10px;">
                        <label for="bg-preview">Preview:</label>
                        <img id="bg-preview" src="${backgroundImage}" style="width: 100%; height: auto; border-radius: 5px;">
                    </div>

                    <label for="upload-images" style="margin-top: 10px;">Upload Images:</label>
                    <input type="file" id="upload-images" accept="image/*" multiple>
                    <button id="clear-slideshow" style="margin-top: 10px;">Clear Slideshow</button>

                    <label for="slideshow-toggle" style="margin-top: 10px;">Enable Slideshow:</label>

                    <label for="slideshow-interval">Slideshow Interval (ms):</label>
                    <button id="apply-slideshow" style="margin-top: 10px;">Apply Slideshow</button>

                    <div id="saved-images-container" style="margin-top: 20px; display: flex; flex-wrap: wrap; gap: 5px;">
                        <!-- Saved images will be displayed here -->
                    </div>
                </div>
            </div>
            `;
            document.body.insertAdjacentHTML("beforeend", menu);
        }
    };

    // Update preview and background settings
    const updatePreview = () => {
        const previewImg = document.getElementById('bg-preview');
        previewImg.src = backgroundImage; // Update the preview with the current background image
    };

    // Update the saved images gallery
    const updateSavedImages = () => {
        const savedImagesContainer = document.getElementById('saved-images-container');
        savedImagesContainer.innerHTML = ''; // Clear the current gallery
        const savedImages = JSON.parse(localStorage.getItem('savedImages')) || [];

        savedImages.forEach(image => {
            const imgElement = document.createElement('img');
            imgElement.src = image;
            imgElement.style.width = '80px';
            imgElement.style.height = 'auto';
            imgElement.style.borderRadius = '5px';
            imgElement.style.cursor = 'pointer';
            imgElement.addEventListener('click', () => {
                backgroundImage = image;
                localStorage.setItem('backgroundImage', backgroundImage);
                setBackground(); // Apply the new background image
                updatePreview(); // Update the preview
            });
            savedImagesContainer.appendChild(imgElement);
        });
    };

    // Handle background application from the input field
    const applyBackgroundFromInput = () => {
        const bgUrl = document.getElementById('bg-url').value;
        backgroundImage = bgUrl;
        localStorage.setItem('backgroundImage', backgroundImage);
        setBackground();
        updatePreview();
    };

    // Handle image uploads
    const handleImageUpload = (e) => {
        const files = e.target.files;
        for (let file of files) {
            const reader = new FileReader();
            reader.onload = (function(f) {
                return function(e) {
                    // Save the uploaded image URL in localStorage
                    const savedImages = JSON.parse(localStorage.getItem('savedImages')) || [];
                    savedImages.push(e.target.result);
                    localStorage.setItem('savedImages', JSON.stringify(savedImages));
                    updateSavedImages(); // Update saved images gallery
                };
            })(file);
            reader.readAsDataURL(file); // Convert file to a data URL
        }
    };

    // Event listeners for control panel actions
    document.getElementById('apply-bg')?.addEventListener('click', applyBackgroundFromInput);
    document.getElementById('upload-images')?.addEventListener('change', handleImageUpload);

    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key === "b") { // Ctrl + B to toggle
            const panel = document.getElementById("background-settings");
            if (panel) panel.style.display = panel.style.display === "none" ? "block" : "none";
        }
    });

    const toggleMenu = () => {
        isMenuOpen = !isMenuOpen;
        const panel = document.getElementById('background-settings');
        if (panel) {
            panel.style.display = isMenuOpen ? "block" : "none";
        }
    };

    injectHTML();
    setBackground();
    createMenu();
    updateSavedImages(); // Load the saved images when the page loads

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
