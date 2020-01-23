const throng = require('throng')
const Queue = require('bull')

// Connect to a local redis intance locally, and the Heroku-provided URL in production
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379'

// Spin up multiple processes to handle jobs to take advantage of more CPU cores
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
const workers = process.env.WEB_CONCURRENCY || 2

// The maxium number of jobs each worker should process at once. This will need
// to be tuned for your application. If each job is mostly waiting on network
// responses it can be much higher. If each job is CPU-intensive, it might need
// to be much lower.
const maxJobsPerWorker = 50

// helper function to scrape data from site passed as an argument
const scrape = require('./lib/scrape_site')
// helper function to get current date and time
const getDate = require('./lib/get_date')

// establish database connection
// use new version of URL parser
// use createIndex instead of deprecated ensureIndex
const db = require('./config/db')
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
mongoose.connect(db, {
  useNewUrlParser: true,
  useCreateIndex: true
})

// pull in Mongoose model for reports
const Report = require('./app/models/report')

function start () {
  // Connect to the named work queue
  const reportQueue = new Queue('Reports', REDIS_URL)

  reportQueue.process('scrape site', maxJobsPerWorker, async (job) => {
    // scrape product data from URL
    const productData = await scrape(job.data.url)

    // parse URL
    let parsedUrl = job.data.url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i)
    if (parsedUrl != null && parsedUrl.length > 2 && typeof parsedUrl[2] === 'string' && parsedUrl[2].length > 0) {
      parsedUrl = parsedUrl[2]
    } else {
      parsedUrl = null
    }

    // construct report object
    const reportObject = {
      title: `${getDate()} ${parsedUrl}`,
      url: job.data.url,
      products: productData,
      owner: job.data.owner
    }

    // create new Mongo report document using report object
    const report = await Report.create(reportObject)

    return report
  })
}

// Initialize the clustered worker process
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
throng({ workers, start })
