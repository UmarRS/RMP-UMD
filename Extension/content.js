// Inserts an icon next to the professor's name and adds a click event listener for fetching RMP info
function insertRateMyProfessorIcon() {
  const instructorElements = document.querySelectorAll('td[data-property="instructor"] .email');

  if (instructorElements.length === 0) {
    console.log("Professor elements not found yet.");
    return false;
  }

  instructorElements.forEach((element) => {
    if (!element.classList.contains("rmp-icon-added")) {
      const iconElement = document.createElement("img");
      const iconPath = chrome.runtime.getURL("Icons/Icon16x.jpg");
      iconElement.setAttribute("src", iconPath); // Set the path to your icon image
      iconElement.setAttribute("style", "cursor:pointer; margin-right:5px;");
      iconElement.classList.add("rmp-icon");
      
      // Prepend the icon to the professor's name
      element.parentNode.insertBefore(iconElement, element);

      // Add click event listener to the icon
      iconElement.addEventListener("click", function() {
        let professorName = element.textContent.trim(); // Get the professor's name
        professorName = professorName.split(', ').reverse().join(' '); // Reformatted: "Patricia Graybeal"

        openRmpPopup(professorName); // Fetch and display RMP info
      });

      element.classList.add("rmp-icon-added"); // Mark as processed
    }
  });

  return true;
}

// Fetches RMP info for the given professor name and displays it in a popup
function openRmpPopup(professorName) {
  chrome.runtime.sendMessage({action: "getProfessorInfo", name: professorName}, response => {
    // Check for an error from the message passing
    if (chrome.runtime.lastError) {
      // Log the error or handle it as needed
      console.error("Error fetching professor info:", chrome.runtime.lastError.message);
      // Optionally, you can still attempt to display some form of error message to the user here
      return; // Exit the function to avoid further processing
    }

    // Assuming no error, proceed to process the response
    if (response.status === "success") {
      displayRmpDataPopup(response.data);
    } else {
      console.error("Failed to fetch RMP data:", response.message);
      // Here, you might also want to inform the user that the data couldn't be fetched
    }
  });
}

// Displays the RMP data in a popup
function displayRmpDataPopup(data) {
  const popup = document.createElement('div');
  popup.setAttribute('style', 'position:fixed; top:20%; left:50%; transform:translate(-50%, -50%); background-color:white; padding:20px; border-radius:10px; z-index:1000; box-shadow: 0 4px 8px rgba(0,0,0,0.1);');
  popup.innerHTML = `
    <h2>${data.name}</h2>
    <p>Rating: ${data.rating}</p>
    <p>Number of Ratings: ${data.numberOfRatings}</p>
    <p>Difficulty Level: ${data.difficultyLevel}</p>
    <p>Would Take Again: ${data.takeAgainPercentage}</p>
    <p>Most Recent Review: ${data.mostRecentReview}</p>
    <button onclick="this.parentElement.remove()">Close</button>
  `;
  document.body.appendChild(popup);
}

// Use a MutationObserver to wait for the elements to be available and insert the icon
const observer = new MutationObserver((mutations, obs) => {
  const elementsReady = insertRateMyProfessorIcon();
  if (elementsReady) {
    obs.disconnect(); // Stop observing when done
  }
});

// Observe the body for changes in child elements
observer.observe(document.body, { childList: true, subtree: true });

// Initial check in case the elements are already there before the observer starts
insertRateMyProfessorIcon();
