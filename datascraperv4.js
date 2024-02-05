const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Helper function to append data to a file
const appendToFile = (filePath, data) => {
  fs.appendFile(filePath, data + '\n', (err) => {
    if (err) throw err;
  });
};

// Function to scrape professor information
const scrapeProfessorInfo = async (urls) => {
  // Ensure the file is empty before starting
  const filePath = path.join(__dirname, 'professorInfoDB.txt');
  fs.writeFileSync(filePath, '');

  for (const url of urls) {
    try {
      const { data } = await axios.get(url, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      });
      const $ = cheerio.load(data);

      // Extracting the desired data
      const name = $('.NameTitle__Name-dowf0z-0').text().trim();
      const overallRating = $('.RatingValue__Numerator-qw8sqy-2').text().trim();
      const numRatings = $('.RatingValue__NumRatings-qw8sqy-0.jMkisx').text().trim().replace(/\D/g,''); // Remove non-digit characters for number
      const difficulty = $('.FeedbackItem__FeedbackNumber-uof32n-1.kkESWs').last().text().trim();
      const wouldTakeAgainRating = $('.FeedbackItem__FeedbackNumber-uof32n-1.kkESWs').first().text().trim();
      const mostRecentReview = $('.RatingsList__RatingsUL-hn9one-0 .Rating__StyledRating-sc-1rhvpxz-1 .Comments__StyledComments-dzzyvm-0').first().text().trim();

      // Preparing output in a simple CSV format
      const output = `"${name}","${overallRating}","${numRatings}","${difficulty}","${wouldTakeAgainRating}","${mostRecentReview}"`;

      // Appending to the file
      appendToFile(filePath, output);

    } catch (error) {
      console.error('An error occurred:', error.message);
    }
  }

  console.log('All data has been written to file successfully.');
};

// Array to add URLs for specific professors
const professorPageUrls = [
  'https://www.ratemyprofessors.com/professor/2852967', // Example professor
  'https://www.ratemyprofessors.com/professor/1853309'
];

scrapeProfessorInfo(professorPageUrls);