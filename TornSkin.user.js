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
        <li id="tornskin-menu" style="width: 100%; height: 34px; display: flex; align-items: center; justify-content: center; text-align: center; cursor: pointer;">
            <span style="pointer-events: none; color: #ccc;">TornSkin</span>
        </li>
        `;
        targetElement.insertAdjacentHTML("afterbegin", element);

        const menuSpan = document.getElementById('tornskin-menu');
        if (menuSpan) {
            menuSpan.addEventListener('click', toggleMenu);
        }
    }

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
            <div id="background-settings" style="position: fixed; top: 10px; left: 10px; background: rgba(22, 22, 22, 0.8); color: white; z-index: 99999999999999; border-radius: 5px; width: 250px; overflow-y: auto; display: none;">
                <div style="display: flex; justify-content: center; flex-direction: column">
                    <p>Background Settings</p>
                    <label for="bg-opacity">Opacity:</label>

                    <label for="bg-url">Image URL:</label>
                    <input type="text" id="bg-url" placeholder="Enter image URL" value="${backgroundImage}">
                    <button id="apply-bg">Set Background</button>

                    <label for="upload-images">Upload Images:</label>
                    <input type="file" id="upload-images" accept="image/*" multiple>
                    <button id="clear-slideshow">Clear Slideshow</button>

                    <label for="slideshow-toggle">Enable Slideshow:</label>

                    <label for="slideshow-interval">Slideshow Interval (ms):</label>
                    <button id="apply-slideshow">Apply Slideshow</button>
                </div>
            </div>
        `;
            document.body.insertAdjacentHTML("beforeend", menu);
        }
    };

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
})();

//----------------------------------------------//
//              FixList                         //
//----------------------------------------------//    4 stev w luv 

// control panel changes chat buttons from fixed position - bottom right
// control panel resizes incorrectly into home button top right
// modernize control panel - shadows etc
// features to be added - background image preview
// random background button on control panel
// fade transition background option
// reset button for backgrounds
// button to choose between static background and image vs slideshow

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
