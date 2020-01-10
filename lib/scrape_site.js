const puppeteer = require('puppeteer')
const getSiteArguments = require('./get_site_arguments')

async function scrape (site) {
  try {
    // scrape product data from site and recursively checks the next page (if paginated)
    const extractProducts = async url => {
      const siteArguments = await getSiteArguments(url)

      const page = await browser.newPage()
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36')
      await page.goto(url, { timeout: 0 })
      // wait for selector to load on page
      await page.waitForSelector(siteArguments.waitSelector, { timeout: 0 })
      // scrape product data from current page
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

      await page.close()

      // recursively scrape the next page, terminate if no products on page
      if (productsOnPage.length < 1) {
        return []
      } else {
        const nextPageNumber = parseInt(url.match(siteArguments.pageMatch)[1], 10) + siteArguments.pageIterator
        const nextUrl = siteArguments.nextUrl + nextPageNumber

        return productsOnPage.concat(await extractProducts(nextUrl))
      }
    }

    // open the headless browser
    const browser = await puppeteer.launch({ headless: true })

    const firstUrl = site
    const products = await extractProducts(firstUrl)

    await browser.close()

    return products
  } catch (err) {
    // Catch and display errors
    console.log(err)
  }
};

module.exports = scrape
