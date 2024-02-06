// Function to extract professor URLs and log them
function extractProfessorURLs() {
    // Get all anchor tags on the page
    const anchors = document.querySelectorAll('a');
    const professorURLs = [];

    // Filter URLs that lead to professor profiles
    anchors.forEach(anchor => {
        const href = anchor.getAttribute('href');
        if (href && href.includes('/professor/')) {
            const fullURL = `https://www.ratemyprofessors.com${href}`;
            professorURLs.push(fullURL);
        }
    });

    // Log URLs to console
    console.log(professorURLs.join('\n'));

    // Create and download a text file with URLs (Uncomment for direct download in supported environments)
    // const blob = new Blob([professorURLs.join('\n')], { type: 'text/plain' });
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = 'professorURLs.txt';
    // document.body.appendChild(a); // Append the anchor for Firefox
    // a.click();
    // document.body.removeChild(a); // Clean up
}

// Call the function to execute
extractProfessorURLs();


/* Run this script in inspect element console after revealing all professors on page */