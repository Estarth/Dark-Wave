// Apply dark mode on initial load
chrome.storage.sync.get(['darkModeEnabled', 'intensity'], function(result) {
    if (result.darkModeEnabled) {
        applyDarkMode(result.intensity || 50);
    }
});

// Listen for changes in storage to update the dark mode dynamically
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
        if (changes.darkModeEnabled) {
            const enabled = changes.darkModeEnabled.newValue;
            if (enabled) {
                chrome.storage.sync.get('intensity', (result) => {
                    applyDarkMode(result.intensity || 50);
                });
            } else {
                removeDarkMode();
            }
        }
        if (changes.intensity) {
            const intensity = changes.intensity.newValue;
            applyDarkMode(intensity);
        }
    }
});

// Function to Apply Dark Mode
function applyDarkMode(intensity) {
    const darkStyleId = "dark-mode-style";
    let darkStyle = document.getElementById(darkStyleId);

    if (!darkStyle) {
        darkStyle = document.createElement("style");
        darkStyle.id = darkStyleId;
        document.head.appendChild(darkStyle);
    }

    const intensityValue = (100 - intensity) / 100;
    darkStyle.textContent = `
        html {
            filter: brightness(${intensityValue}) invert(1);
            background-color: black !important;
            color: white !important;
        }
    `;
}

// Function to Remove Dark Mode
function removeDarkMode() {
    const darkStyle = document.getElementById("dark-mode-style");
    if (darkStyle) {
        darkStyle.remove();
    }
}
  