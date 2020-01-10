// return an object with site-specific arguments based on the URL domain

module.exports = url => {
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
