const puppeteer = require('puppeteer')

async function scrape (site) {
  try {
    // return an object with site-specific arguments based on the URL domain
    const getSiteArguments = url => {
      if (!url) {
        throw new Error('Missing site argument.')
      }

      const domain = url.toString().match(/^(?:\/\/|[^/]+)*/g)[0]

      switch (domain) {
        case 'https://www.eastdane.com':
          return {
            pageMatch: /baseIndex=(\d+)$/,
            pageIterator: 100,
            baseUrl: domain,
            nextUrl: 'https://www.eastdane.com/brands-club-monaco/br/v=1/48853.htm#/?f=merchandiseCategory=%26filterContext=48853%26limit=100%26baseIndex=',
            waitSelector: '.product-list',
            productSelector: '.hproduct.product',
            nameSelector: '.description',
            urlSelector: '.url',
            priceSelector: '.retail-price',
            saleSelector: '.sale-price-high'
          }
        case 'https://shop.nordstrom.com':
          return {
            pageMatch: /page=(\d+)$/,
            pageIterator: 1,
            baseUrl: domain,
            nextUrl: 'https://shop.nordstrom.com/brands/club-monaco--18278?page=',
            waitSelector: '._1rQQX',
            productSelector: '._1AOd3.QIjwE',
            nameSelector: '._5lXiG._1sMDh._2PDR1',
            urlSelector: '._5lXiG._1sMDh._2PDR1',
            priceSelector: '.YbtDD._3bi0z ._3wu-9',
            saleSelector: '.YbtDD._18N5Q ._3wu-9'
          }
        case 'https://www.shopbop.com':
          return {
            pageMatch: /baseIndex=(\d+)$/,
            pageIterator: 100,
            baseUrl: domain,
            nextUrl: 'https://www.shopbop.com/club-monaco/br/v=1/10148.htm?view=100&baseIndex=',
            waitSelector: '.content',
            productSelector: '.hproduct.product',
            nameSelector: '.title',
            urlSelector: '.url',
            priceSelector: '.retail-price',
            saleSelector: '.sale-price-high'
          }
        default:
          throw new Error('Incorrect site argument.')
      }
    }

    // scrape product data from site and recursively checks the next page (if paginated)
    const extractProducts = async url => {
      const siteArguments = await getSiteArguments(url)

      const page = await browser.newPage()
      await page.goto(url, { timeout: 0 })
      // wait for selector to load on page
      await page.waitForSelector(siteArguments.waitSelector, { timeout: 0 })
      // scrape product data from current page
      const productsOnPage = await page.evaluate(siteArguments =>
        Array.from(document.querySelectorAll(siteArguments.productSelector)).map(product => {
          const sale = product.querySelector(siteArguments.saleSelector)
          const price = product.querySelector(siteArguments.priceSelector).innerText

          return {
            name: product.querySelector(siteArguments.nameSelector).innerText,
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
    const browser = await puppeteer.launch({ headless: false })

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
