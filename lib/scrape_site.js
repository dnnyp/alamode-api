const puppeteer = require('puppeteer')
const getSiteArguments = require('./get_site_arguments')

async function scrape (site) {
  try {
    // scrape product data from site and recursively checks the next page (if paginated)
    const extractProducts = async url => {
      try {
        console.log('Start of extractProducts')
        const siteArguments = await getSiteArguments(url)
        console.log('Site arguments: ', siteArguments)

        console.log('Opening new page')
        const page = await browser.newPage()
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36')
        console.log('Navigating to url ', url)
        await page.goto(url, { timeout: 0 })
        // wait for selector to load on page
        console.log('Waiting for page to load')
        await page.waitForSelector(siteArguments.waitSelector, { timeout: 0 })
        // scrape product data from current page
        console.log('Starting page scrape')
        const productsOnPage = await page.evaluate(siteArguments =>
          Array.from(document.querySelectorAll(siteArguments.productSelector)).map(product => {
            const sale = product.querySelector(siteArguments.saleSelector)
            const price = product.querySelector(siteArguments.priceSelector).innerText
            const name = product.querySelector(siteArguments.nameSelector).innerText

            return {
              name: name.includes('Club Monaco ') ? name.replace('Club Monaco ', '') : name,
              url: siteArguments.baseUrl + product.querySelector(siteArguments.urlSelector).getAttribute('href'),
              price: price,
              sale: !sale || sale.innerText === price ? 'N/A' : sale.innerText
            }
          }),
        siteArguments
        )
        console.log('Page scrape finished, closing page')

        await page.close()

        // recursively scrape the next page, terminate if no products on page
        if (productsOnPage.length < 1) {
          console.log('Recursive base case')
          return []
        } else {
          console.log('Incrementing page iterator')
          const nextPageNumber = parseInt(url.match(siteArguments.pageMatch)[1], 10) + siteArguments.pageIterator
          console.log('Generating next URL')
          const nextUrl = siteArguments.nextUrl + nextPageNumber

          console.log('Recursively concatenating page results')
          return productsOnPage.concat(await extractProducts(nextUrl))
        }
      } catch (err) {
        console.error(err)
      }
    }
    console.log('Opening headless browser')
    // open the headless browser
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    })

    const firstUrl = site
    console.log('Scraping first URL')
    const products = await extractProducts(firstUrl)

    console.log('Closing browser')
    await browser.close()

    return products
  } catch (err) {
    // Catch and display errors
    console.log(err)
  }
};

module.exports = scrape
