// This function will append "Hi" next to the professor's name when the element is available
function appendHiToProfessorName() {
  // Select all elements with the 'email' class inside 'td' with 'data-property="instructor"'
  const instructorElements = document.querySelectorAll(
    'td[data-property="instructor"] .email'
  );

  // Check if the elements are not found yet and log '1'
  if (instructorElements.length === 0) {
    console.log(1);
    return false; // Return false to indicate elements are not ready
  }

  // If elements are found, append "Hi"
  instructorElements.forEach((element) => {
    if (!element.classList.contains("hi-added")) {
      const hiElement = document.createElement("span");
      hiElement.textContent = " Hi";
      element.parentNode.insertBefore(hiElement, element.nextSibling);
      element.classList.add("hi-added"); // Mark as processed to avoid duplicate greetings
    }
  });

  return true; // Return true when processing is complete
}

// Use a MutationObserver to wait for the elements to be available
const observer = new MutationObserver((mutations, obs) => {
  const elementsReady = appendHiToProfessorName();
  if (elementsReady) {
    obs.disconnect(); // Stop observing when done
  }
});

// Observe the body for changes in child elements
observer.observe(document.body, { childList: true, subtree: true });

// Initial check in case the elements are already there before the observer starts
appendHiToProfessorName();
