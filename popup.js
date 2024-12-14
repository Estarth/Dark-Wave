document.addEventListener("DOMContentLoaded", () => {
    const toggleDarkMode = document.getElementById("toggleDarkMode");
    const intensityRange = document.getElementById("intensityRange");
    const intensityValue = document.getElementById("intensityValue");
  
    // Initialize the popup with saved state
    chrome.storage.sync.get(['darkModeEnabled', 'intensity'], function(result) {
      const enabled = result.darkModeEnabled || false;
      const intensity = result.intensity || 50;
  
      toggleDarkMode.checked = enabled;
      intensityRange.value = intensity;
      intensityValue.textContent = `${intensity}%`;
    });
  
    // Event Listener for Dark Mode Toggle
    toggleDarkMode.addEventListener("change", () => {
      const enabled = toggleDarkMode.checked;
      console.log('Toggle changed:', enabled);
      chrome.storage.sync.set({ darkModeEnabled: enabled }, function() {
        console.log('Dark mode state saved:', enabled);
      });
  
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        console.log('Executing script on tab:', tabs[0].id);
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: toggleDarkModeScript,
          args: [enabled, intensityRange.value]
        });
      });
    });
  
    // Event Listener for Intensity Slider
    let debounceTimeout;
    intensityRange.addEventListener("input", (event) => {
      const intensity = event.target.value;
      intensityValue.textContent = `${intensity}%`;
  
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        chrome.storage.sync.set({ intensity: intensity }, () => {
          console.log('Intensity saved:', intensity);
        });
      }, 300); // Adjust the delay as needed
  
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: setDarkModeIntensityScript,
          args: [intensity]
        });
      });
    });
  });
  
  // Functions to Inject into the Page
  function toggleDarkModeScript(enabled, intensity) {
    const darkStyleId = "dark-mode-style";
    let darkStyle = document.getElementById(darkStyleId);
  
    if (!enabled && darkStyle) {
      darkStyle.remove();
    } else if (enabled) {
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
  }
  
  function setDarkModeIntensityScript(intensity) {
    const darkStyleId = "dark-mode-style";
    let darkStyle = document.getElementById(darkStyleId);
  
    if (darkStyle) {
      const intensityValue = (100 - intensity) / 100;
      darkStyle.textContent = `
        html {
          filter: brightness(${intensityValue}) invert(1);
          background-color: black !important;
          color: white !important;
        }
      `;
    }
  }
  