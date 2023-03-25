const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const url = 'https://github.com/trending/javascript';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  // Scrape repository details
  const repoData = await page.evaluate(() => {
    const repoList = document.querySelectorAll('article.Box-row');

    const repos = [];

    repoList.forEach((repo) => {
      const title = repo.querySelector('h1 a').textContent.trim();
      const description = repo.querySelector('p')?.textContent.trim() || '';
      const url = `https://github.com${repo.querySelector('h1 a').getAttribute('href')}`;
      const stars = repo.querySelector('.octicon-star + span').textContent.trim();
      const forks = repo.querySelector('.octicon-repo-forked + span').textContent.trim();
      const language = repo.querySelector('[itemprop="programmingLanguage"]')?.textContent.trim() || '';

      repos.push({
        title,
        description,
        url,
        stars,
        forks,
        language,
      });
    });

    return repos;
  });

  // Click on developers and select JavaScript language
  const devButton = await page.$('.select-menu-button[title="Language"]');
  await devButton.click();

  const jsOption = await page.waitForSelector('.select-menu-item[data-value="javascript"]');
  await jsOption.click();

  // Scrape developer details
  const devData = await page.evaluate(() => {
    const devList = document.querySelectorAll('.explore-pjax-container .user-list-item');

    const devs = [];

    devList.forEach((dev) => {
      const name = dev.querySelector('h2').textContent.trim();
      const username = dev.querySelector('.username').textContent.trim();
      const repoName = dev.querySelector('.repo-snipit').textContent.trim();
      const repoDesc = dev.querySelector('.repo-snipit-description').textContent.trim();

      devs.push({
        name,
        username,
        repo: {
          name: repoName,
          description: repoDesc,
        },
      });
    });

    return devs;
  });

  // Store the extracted data in a JSON object
  const data = {
    repositories: repoData,
    developers: devData,
  };

  // Console log the JSON object
  console.log(JSON.stringify(data, null, 2));

  await browser.close();
})();
