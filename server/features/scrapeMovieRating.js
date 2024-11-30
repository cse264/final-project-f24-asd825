import puppeteer from 'puppeteer';

// Helper function to add a delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function scrapeMovieRatings(username) {
    const ratingMap = {
        '': 0,
        '½': 1,
        '★': 2,
        '★½': 3,
        '★★': 4,
        '★★½': 5,
        '★★★': 6,
        '★★★½': 7,
        '★★★★': 8,
        '★★★★½': 9,
        '★★★★★': 10
    };
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    let allMovies = []; // Array to store movies across all pages
    const userUrl = `https://letterboxd.com/${username}/films/`
    try {
        console.log('Navigating to the first page...');
        await page.goto(userUrl, { waitUntil: 'domcontentloaded' });

        console.log('Adding extra delay for the first page to ensure it loads fully...');
        await delay(1000); // Add an explicit delay of 5 seconds for the first page

        const waitForMovies = async () => {
            try {
                // Wait for elements to exist and ensure titles are populated
                await page.waitForFunction(
                    () =>
                        Array.from(document.querySelectorAll('ul')).some(
                            (el) => el.textContent.trim() !== ''
                        ),
                    { timeout: 60000 }
                );
                console.log('Titles loaded successfully.');
            } catch (error) {
                console.error('Error while waiting for titles:', error);
                throw error;
            }
        };

        while (true) {
            console.log('Waiting for movie titles and ratings...');
            await waitForMovies(); // Wait for titles to load on the current page

            console.log('Scraping movie titles and ratings...');
            const movies = await page.evaluate(() => {
                const movieElements = Array.from(document.querySelectorAll('.poster-container'));
                return movieElements.map(movieElement => {
                    const titleElement = movieElement.querySelector('.frame-title');
                    const ratingElement = movieElement.querySelector('.rating.-micro.-darker');

                    const title = titleElement ? ratingMap[titleElement.textContent.trim()] : 'No title';
                    const rating = ratingElement ? ratingElement.textContent.trim() : 'No rating';

                    return { title, rating };
                });
            });

            allMovies = allMovies.concat(movies); // Add the movies from the current page to the allMovies array
            console.log(`Scraped ${movies.length} movies from this page.`);

            // Check if there is a "Next" button (Older page)
            const nextButton = await page.$('a.next');
            if (!nextButton) {
                console.log('No more pages to scrape.');
                break; // If no next button, exit the loop
            }

            // Click the "Next" button to go to the next page
            console.log('Clicking the "Next" button to go to the next page...');
            const nextPageUrl = await page.$eval('a.next', (el) => el.href);
            await page.goto(nextPageUrl, { waitUntil: 'domcontentloaded' });

            // Add a delay between pages
            console.log('Waiting for 3 seconds before proceeding to the next page...');
            await delay(1000); // Wait for 3 seconds
        }

        return allMovies; // Return all scraped movie data from all pages
    } catch (error) {
        console.error('Error during scraping:', error);
        throw error; // Rethrow the error to handle it outside the function
    } finally {
        await browser.close();
    }
}
export default scrapeMovieRatings
