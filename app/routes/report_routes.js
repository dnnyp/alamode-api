// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

const osmosis = require('osmosis')
const puppeteer = require('puppeteer')

// pull in Mongoose model for reports
const Report = require('../models/report')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

const getDate = require('../../lib/get_date')

// INDEX
// GET /reports
router.get('/reports', requireToken, (req, res, next) => {
  Report.find()
    .then(reports => {
      // `reports` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return reports.map(report => report.toObject())
    })
    // respond with status 200 and JSON of the reports
    .then(reports => res.status(200).json({ reports: reports }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /reports/5a7db6c74d55bc51bdf39793
router.get('/reports/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Report.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "example" JSON
    .then(report => res.status(200).json({ report: report.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /reports
router.post('/reports', requireToken, (req, res, next) => {
  const products = []

  let baseUrl = ''
  let selector = ''
  let setPattern = {}

  switch (req.body.url) {
    case 'https://www.eastdane.com/brands-club-monaco/br/v=1/48853.htm':
      baseUrl = 'https://www.eastdane.com'
      selector = '.hproduct.product'
      setPattern = {
        'name': '.description',
        'url': '.url@href',
        'price': '.retail-price',
        'sale': '.sale-price-high'
      }
      break
    case 'https://shop.nordstrom.com/brands/club-monaco--18278':
      baseUrl = 'https://shop.nordstrom.com'
      selector = '._1AOd3.QIjwE'
      setPattern = {
        'name': '._5lXiG._1sMDh._2PDR1',
        'url': '._5lXiG._1sMDh._2PDR1@href',
        'price': '.YbtDD._3bi0z ._3wu-9',
        'sale': '.YbtDD._18N5Q ._3wu-9'
      }
      break
    case 'https://www.shopbop.com/club-monaco/br/v=1/10148.htm':
      baseUrl = 'https://www.shopbop.com'
      selector = '.hproduct.product'
      setPattern = {
        'name': '.title',
        'url': '.url@href',
        'price': '.retail-price',
        'sale': '.sale-price-high'
      }
      break
    default:
      selector = ''
      setPattern = {}
  }

  // scrape data from URL
  osmosis
    .get(req.body.url)
    .find(selector)
    .set(setPattern)
    .data(function (product) {
      product.url = baseUrl + product.url
      if (product.name.includes('Club Monaco ')) {
        product.name = product.name.replace('Club Monaco ', '')
      }
      if (product.sale) {
        product.sale = product.price === product.sale ? 'N' : product.sale
      } else {
        product.sale = 'N'
      }
      products.push(Object.assign({}, product))
    })
    .done(() => {
      let parsedUrl = req.body.url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i)
      if (parsedUrl != null && parsedUrl.length > 2 && typeof parsedUrl[2] === 'string' && parsedUrl[2].length > 0) {
        parsedUrl = parsedUrl[2]
      } else {
        parsedUrl = null
      }
      const reportPojo = {
        title: `${getDate()} ${parsedUrl}`,
        url: req.body.url,
        products: products,
        owner: req.user.id
      }

      Report.create(reportPojo)
        // respond to succesful `create` with status 201 and JSON of new "report"
        .then(report => {
          res.status(201).json({ report: report.toObject() })
        })
        // if an error occurs, pass it off to our error handler
        // the error handler needs the error message and the `res` object so that it
        // can send an error message back to the client
        .catch(next)
    })
    .error(console.log)
})

// UPDATE
// PATCH /reports/5a7db6c74d55bc51bdf39793
router.patch('/reports/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.report.owner

  Report.findById(req.params.id)
    .then(handle404)
    .then(report => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, report)

      // pass the result of Mongoose's `.set` to the next `.then`
      return report.set(req.body.report).save()
    })
    // if that succeeded, return 200 and JSON
    .then(report => {
      res.status(200).json({ report: report.toObject() })
    })
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /reports/5a7db6c74d55bc51bdf39793
router.delete('/reports/:id', requireToken, (req, res, next) => {
  Report.findById(req.params.id)
    .then(handle404)
    .then(report => {
      // throw an error if current user doesn't own `report`
      requireOwnership(req, report)
      // delete the report ONLY IF the above didn't throw
      report.deleteOne()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
