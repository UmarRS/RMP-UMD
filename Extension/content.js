let activePopupsCount = 0; // Global variable to track active popups

// Inserts an icon next to the professor's name and adds a click event listener for fetching RMP info
function insertRateMyProfessorIcon() {
  const instructorElements = document.querySelectorAll(
    'td[data-property="instructor"] .email'
  );

  if (instructorElements.length === 0) {
    console.log("Professor elements not found yet.");
    return false;
  }

  instructorElements.forEach((element) => {
    if (!element.classList.contains("rmp-icon-added")) {
      const iconElement = document.createElement("img");
      const iconPath = chrome.runtime.getURL("Icons/um16xtest.png");
      iconElement.setAttribute("src", iconPath); // Set the path to your icon image
      iconElement.setAttribute("style", "cursor:pointer; margin-right:5px;");
      iconElement.classList.add("rmp-icon");

      // Prepend the icon to the professor's name
      element.parentNode.insertBefore(iconElement, element);

      // Add click event listener to the icon
      iconElement.addEventListener("click", function () {
        let professorName = element.textContent.trim(); // Get the professor's name
        professorName = professorName.split(", ").reverse().join(" "); // Reformatted: "Patricia Graybeal"

        openRmpPopup(professorName); // Fetch and display RMP info
      });

      element.classList.add("rmp-icon-added"); // Mark as processed
    }
  });

  return true;
}

// Fetches RMP info for the given professor name and displays it in a popup
function openRmpPopup(professorName) {
  chrome.runtime.sendMessage(
    { action: "getProfessorInfo", name: professorName },
    (response) => {
      // Check for an error from the message passing
      if (chrome.runtime.lastError) {
        // Log the error or handle it as needed
        console.error(
          "Error fetching professor info:",
          chrome.runtime.lastError.message
        );
        // Optionally, you can still attempt to display some form of error message to the user here
        return; // Exit the function to avoid further processing
      }

      // Assuming no error, proceed to process the response
      if (response.status === "success") {
        displayRmpDataPopup(response.data);
      } else {
        console.error("Failed to fetch RMP data:", response.message);

        displayErrorPopup("Professor not found/No data available.");
      }
    }
  );
}

// Displays an error message in a popup for when professor data is not found
function displayErrorPopup(message) {
  // Create a div for the popup
  const popup = document.createElement("div");
  popup.setAttribute(
    "style",
    `
    position: fixed;
    top:50%;
    left:40%;
    background-color: white;
    font-family: Helvetica, sans-serif;
    font-size: 14px;
    padding: 5px;
    border-radius: 10px;
    z-index: 1000;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  `
  );

  // Create a message element
  const messageElement = document.createElement("p");
  messageElement.textContent = message;

  // Append the message and close button to the popup
  popup.appendChild(messageElement);

  // Append the popup to the body
  document.body.appendChild(popup);

  // Function to update the popup position based on mouse coordinates
  function updatePopupPosition(event) {
    const xOffset = 20; // Adjust the horizontal offset
    const yOffset = 20; // Adjust the vertical offset
    popup.style.left = `${event.clientX + xOffset}px`;
    popup.style.top = `${event.clientY + yOffset}px`;
  }

  // Attach event listener for mousemove to update popup position
  document.addEventListener("mousemove", updatePopupPosition);

  // Automatically close the popup after 3 seconds
  setTimeout(() => {
    document.body.removeChild(popup);
    // Remove the mousemove event listener when the popup is closed
    document.removeEventListener("mousemove", updatePopupPosition);
  }, 3000);

  // Trigger the initial position update to prevent a jump
  updatePopupPosition(event);
}

// Function to interpolate between two red and green based on rating and difficulty level
function getColorForValue(value, isForRating = true) {
  const max = 5;
  const factor = value / max; // Normalize value to [0, 1]

  // Direct linear interpolation for red and green components
  let red, green;
  if (isForRating) {
    // For rating: Green increases with value, Red decreases
    green = Math.round(255 * factor);
    red = 255 - green;
  } else {
    // For difficulty: Red increases with value, Green decreases
    red = Math.round(255 * factor);
    green = 255 - red;
  }

  return `rgb(${red},${green},0)`;
}



// Displays the RMP data in a popup
function displayRmpDataPopup(data) {
  const iconElement = document.createElement("img");
  const iconPath = chrome.runtime.getURL("Icons/umdlogo.png");
  iconElement.setAttribute("src", iconPath);

  const popup = document.createElement("div");
  popup.style.position = "fixed";
  popup.style.top = "30%";
  popup.style.left = "50%";
  popup.style.fontFamily = "Helvetica, sans-serif";
  popup.style.fontSize = "14px";
  popup.style.color = "#FFCB05";
  popup.style.borderRadius = "25px";
  popup.style.zIndex = "1000";
  popup.style.boxShadow = "0 4px 8px rgba(0,0,0,0.5)";
  popup.style.border = "1px solid #898989";
  popup.style.backgroundColor = "#00274C";
  popup.style.opacity = "0"; // Initially set opacity to 0
  popup.style.width = "400px";
  popup.style.padding = "20px";
  popup.style.transition = "opacity 0.4s ease-in-out, transform 0.4s ease-in-out"; // Add transition for opacity, small-to-big.
  popup.style.transform = "scale(0.5)"; // Initially set scale to 0.5
  const xOffset = 20 * activePopupsCount; // Adjust these values as needed
  const yOffset = 20 * activePopupsCount;
  popup.style.left = `calc(50% + ${xOffset}px)`;
  popup.style.top = `calc(30% + ${yOffset}px)`;

  // Increment activePopupsCount
  activePopupsCount++;

  let isDragging = false;
  let offsetX, offsetY;

  popup.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - popup.getBoundingClientRect().left;
    offsetY = e.clientY - popup.getBoundingClientRect().top;
    popup.style.zIndex = "1001"; // Bring the popup to the front while dragging
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      const newX = e.clientX - offsetX;
      const newY = e.clientY - offsetY;

      popup.style.left = newX + "px";
      popup.style.top = newY + "px";
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    popup.style.zIndex = "1000"; // Return the popup to its original z-index
  });

  const buttonStyle = `
    background-color: #00274C;
    color: #FFCB05;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    text-transform: uppercase;
    font-weight: bold;
    font-family: Helvetica, sans-serif;
    text-align: center;
    transition: background-color 0.3s, color 0.3s;
    display: block;
    margin: 10px auto 0;
    width: auto;
  `;

  popup.innerHTML = `
    <h2 style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <span>${data.name}</span>
      <div style="display: flex; align-items: center;">
        <img src="${iconPath}" alt="Logo" style="width: 50px; height: 50px; margin-right: 20px;">
      <span style="margin-left: auto;">Rate My Professor</span>
    </h2>
    <div style="margin-bottom: 10px; border-bottom: 1px solid white;">
      <p><strong style="color: #FFCB05;">Rating:</strong> <span class="data-element" style="color: ${getColorForValue(data.rating, true)};">${data.rating}/5</span></p>
    </div>
    <div style="margin-bottom: 10px; border-bottom: 1px solid white;">
      <p><strong style="color: #FFCB05;">Number of Ratings:</strong> <span class="data-element" style="color: #EFF0F1;">${data.numberOfRatings}</span></p>
    </div>
    <div style="margin-bottom: 10px; border-bottom: 1px solid white;">
      <p><strong style="color: #FFCB05;">Difficulty Level:</strong> <span class="data-element" style="color: ${getColorForValue(data.difficultyLevel, false)};">${data.difficultyLevel}/5</span></p>
    </div>
    <div style="margin-bottom: 10px; border-bottom: 1px solid white;">
      <p><strong style="color: #FFCB05;">Would Take Again:</strong> <span class="data-element" style="color: #EFF0F1;">${data.takeAgainPercentage}</span></p>
    </div>
    <div style="margin-bottom: 20px;">
      <p><strong style="color: #FFCB05;">Most Recent Review:</strong> <span class="data-element" style="color: #EFF0F1;">${data.mostRecentReview}</span></p>
    </div>
  `;

  const closeButton = document.createElement("button");
  closeButton.style.cssText = buttonStyle;
  closeButton.textContent = "Close";

  closeButton.onclick = () => {
    popup.style.opacity = "0"; // Start fading out
    popup.style.transform = "scale(0.5)"; // Start scaling down
    setTimeout(() => {
      popup.remove(); // Remove the popup after the fade-out animation
      // Decrement activePopupsCount
      activePopupsCount--;
    }, 300); // Adjust the duration as needed
  };

  popup.appendChild(closeButton);

  document.body.appendChild(popup);

  // Use a setTimeout to trigger the fade-in effect
  setTimeout(() => {
    popup.style.opacity = "1";
    popup.style.transform = "scale(1)";
  }, 10);
}

// Use a MutationObserver to wait for the elements to be available and insert the icon
const observer = new MutationObserver((mutations, obs) => {
  // Always try to insert icons on mutation, do not disconnect
  insertRateMyProfessorIcon();
});

// Observe the body for changes in child elements
observer.observe(document.body, { childList: true, subtree: true });

// Initial check in case the elements are already there before the observer starts
insertRateMyProfessorIcon();
