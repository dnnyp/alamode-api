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

function start () {
  // Connect to the named work queue
  const reportQueue = new Queue('Reports', REDIS_URL)

  reportQueue.process('scrape site', maxJobsPerWorker, async (job) => {
    // scrape product data from URL
    const productData = await scrape(job.data.url)
    return productData
  })
}

// Initialize the clustered worker process
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
throng({ workers, start })
