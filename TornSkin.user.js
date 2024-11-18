// ==UserScript==
// @name         TornSkin
// @namespace    bank.TornSkin
// @version      1.0
// @description  Customize Torn's background capabilities
// @author       Bank
// @match        https://www.torn.com/*
// @grant        GM_addStyle
// ==/UserScript==

(() => {
	let backgroundImage =
		localStorage.getItem("backgroundImage") ||
		"https://4kwallpapers.com/images/walls/thumbs_3t/19127.jpg";
	// Single background URL
	let slideshowImages =
		JSON.parse(localStorage.getItem("slideshowImages")) || []; // Array of images for slideshow
	let opacity = parseFloat(localStorage.getItem("bgOpacity")) || 0.8; // Background opacity
	let slideshowEnabled = localStorage.getItem("slideshowEnabled") === "true"; // Toggle for slideshow
	let slideshowInterval =
		parseInt(localStorage.getItem("slideshowInterval")) || 5000; // Interval for slideshow
	let currentImageIndex = 0;
	let slideshowTimer;

	function applyStyles() {
		let activeBackground =
			slideshowEnabled && slideshowImages.length > 0
				? slideshowImages[currentImageIndex]
				: backgroundImage;

		GM_addStyle(`
            body {
                background: url(${activeBackground}) !important;
                background-size: cover !important;
                background-attachment: fixed !important;
                background-position: center !important;
                filter: opacity(${opacity});
            }
        `);
	}

	function startSlideshow() {
		if (slideshowTimer) clearInterval(slideshowTimer);
		if (slideshowEnabled && slideshowImages.length > 0) {
			slideshowTimer = setInterval(() => {
				currentImageIndex =
					(currentImageIndex + 1) % slideshowImages.length;
				applyStyles();
			}, slideshowInterval);
		}
	}

	function createControlPanel() {
		const panelHTML = `
        <div id="background-settings" style="position: fixed; top: 10px; left: 10px; background: rgba(0, 0, 0, 0.8); color: white; padding: 10px; z-index: 90000; border-radius: 5px; width: 250px; max-height: 80vh; height: auto; overflow-y: auto; margin-bottom: 0;">
            <h3 style="margin: 0 0 10px;">Background Settings</h3>
            <label for="bg-opacity">Opacity:</label>
            <input type="range" id="bg-opacity" min="0" max="1" step="0.05" value="${opacity}" style="width: 100%; margin-bottom: 10px;">

            <label for="bg-url">Image URL:</label>
            <input type="text" id="bg-url" placeholder="Enter image URL" style="width: 100%; margin-bottom: 10px;" value="${backgroundImage}">
            <button id="apply-bg" style="width: 100%; margin-bottom: 10px;">Set Background</button>

            <label for="upload-images">Upload Images:</label>
            <input type="file" id="upload-images" accept="image/*" multiple style="margin-bottom: 10px;">
            <button id="clear-slideshow" style="width: 100%; margin-bottom: 10px;">Clear Slideshow</button>

            <label for="slideshow-toggle">Enable Slideshow:</label>
            <input type="checkbox" id="slideshow-toggle" ${
				slideshowEnabled ? "checked" : ""
			} style="margin-bottom: 10px;">

            <label for="slideshow-interval">Slideshow Interval (ms):</label>
            <input type="number" id="slideshow-interval" value="${slideshowInterval}" style="width: 100%; margin-bottom: 10px;">
            <button id="apply-slideshow" style="width: 100%;">Apply Slideshow</button>
        </div>
    `;
		document.body.insertAdjacentHTML("beforeend", panelHTML);

		// Event listeners
		document.getElementById("bg-opacity").addEventListener("input", (e) => {
			opacity = parseFloat(e.target.value);
			localStorage.setItem("bgOpacity", opacity);
			applyStyles();
		});

		document.getElementById("apply-bg").addEventListener("click", () => {
			const url = document.getElementById("bg-url").value.trim();
			if (url) {
				backgroundImage = url;
				localStorage.setItem("backgroundImage", backgroundImage);
				slideshowEnabled = false;
				localStorage.setItem("slideshowEnabled", "false");
				applyStyles();
			}
		});

		document
			.getElementById("upload-images")
			.addEventListener("change", (e) => {
				const files = e.target.files;
				const readerPromises = [];
				for (let file of files) {
					const reader = new FileReader();
					readerPromises.push(
						new Promise((resolve) => {
							reader.onload = () => resolve(reader.result);
							reader.readAsDataURL(file);
						})
					);
				}
				Promise.all(readerPromises).then((images) => {
					slideshowImages = [...slideshowImages, ...images];
					localStorage.setItem(
						"slideshowImages",
						JSON.stringify(slideshowImages)
					);
				});
			});

		document
			.getElementById("clear-slideshow")
			.addEventListener("click", () => {
				slideshowImages = [];
				localStorage.removeItem("slideshowImages");
				applyStyles();
			});

		document
			.getElementById("slideshow-toggle")
			.addEventListener("change", (e) => {
				slideshowEnabled = e.target.checked;
				localStorage.setItem(
					"slideshowEnabled",
					slideshowEnabled.toString()
				);
				if (slideshowEnabled) startSlideshow();
			});

		document
			.getElementById("slideshow-interval")
			.addEventListener("input", (e) => {
				slideshowInterval = parseInt(e.target.value) || 5000;
				localStorage.setItem(
					"slideshowInterval",
					slideshowInterval.toString()
				);
				startSlideshow();
			});

		document
			.getElementById("apply-slideshow")
			.addEventListener("click", () => {
				if (slideshowEnabled) startSlideshow();
			});
	}

	// Initialize the script
	createControlPanel();
	applyStyles();
	if (slideshowEnabled) startSlideshow();
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
