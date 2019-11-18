# À LA MODE

À LA MODE is a reporting tool that scrapes product data from fashion e-commerce sites and generates interactive web and CSV reports. This application is designed and built for use within the fashion wholesale industry.

Authenticated users can generate product reports from a selection of fashion e-commerce sites. Reports are presented in an interactive table format with the ability to sort and filter by any data column. Reports can also be exported in CSV format.

A future release will introduce the ability to schedule reports to run at configured time intervals and to send reports to specified email addresses.

This is the repository for the server application. For the client repository and deployed applications please see the links below.

## Setup and Installation
- ```Fork``` and ```clone``` this repository
- To contribute, please ```checkout``` to a new branch and submit ```pull``` requests
- Install depdendencies by running ```npm install```
  - *Depedencies can be found in the package.json file*
- To launch the app in your local browser, run ```npm run server```

## Links
- [Client Repo](https://github.com/dnnyp/alamode-client)
- [Deployed Client](https://dnnyp.github.io/alamode-client)
- [API Repo](https://github.com/dnnyp/alamode-api)
- [Deployed API](https://quiet-thicket-71875.herokuapp.com)

## Technologies Used
- HTML5
- CSS3/SASS
- React.js
- React Bootstrap
- react-bootstrap-table-2
- Express.js
- Node.js
- Axios
- Passport.js
- Node Osmosis
- MongoDB/Mongoose

## Future Features
- Ability to schedule reports
- Ability to send reports to an email address
- Additional e-commerce sites
- Additional product data columns

## Process
The idea for this reporting tool came from observing the manual effort done by my partner at her fashion job to create product reports from her accounts' websites. I also drew inspiration from my prior experience working on the project team for a new financial reporting tool. My initial wireframes and ERD were created using Balsamiq. I utilized a GitHub project board to manage and prioritze my features.

The back end application was built using Express.js and a MongoDB database. It uses Passport for authentication and Axios for making AJAX requests. A key feature of the back end is the ability to scrape data from a specified URL. I had to analyze how the data I wanted was organized on each of the e-commerce sites that my client application provides as an option. I needed to identify selectors that could be used to pull each piece of information I wanted. I originally went with Cheerio as my web scraping utility and spent quite some time trying to configure it's jsonframe plugin. I found it to be complicated for the purpose of my application and was able to find a simpler solution in Node Osmosis which did just the trick. I had to modify my Mongoose report model several times to reflect the type of product data that was available on the pages I was trying to scrape. I relied heavily on Postman to test my API endpoints including the web scraping functionality.

## ERD
![ERD](https://github.com/dnnyp/shop-scrape-app-client/blob/master/public/ERD.png?raw=true)

## API End Points
|  Verb |  URI | Usage |
|-------|--------|--------|
| POST | `/sign-up` |	Sign up a new user |
| POST | `/sign-in` | Sign in an existing user |
| PATCH | `/change-password` | Change user password |
| DELETE | `/sign-out` | Sign user out |
| GET | `/reports` | Get all reports |
| GET | `/reports/:id` | Get a single report |
| POST | `/reports` | Create a new report |
| PATCH | `/reports/:id` | Update a report title |
| DELETE | `/reports/:id` | Delete a report |

## User Stories
- As an unregistered user, I would like to sign up with email and password.
- As a registered user, I would like to sign in with email and password.
- As a signed in user, I would like to change password.
- As a signed in user, I would like to sign out.
- As a signed in user, I would like to create a report from a list of available e-commerce sites.
- As a signed in user, I would like to update my report's title.
- As a signed in user, I would like to delete my report.
- As a signed in user, I would like to see all reports.
- As a signed in user, I would like to export a report to CSV format.
- As a signed in user, I would like to see the following data for any report:
  - Report title
  - Report timestamps (created & updated)
  - Product name
  - Product price
  - Product sale price
- As a signed in user, I would like to sort and filter the products in a report.
- As a signed in user, I would like to navigate to the e-commerce site the report was generated from.
- As a signed in user, I would like to navigate to the product page on the e-commerce site for each product.
- As a signed in user, I would like to schedule a report to be executed at specified time intervals.
- As a signed in user, I would like to send reports to a specified email address.
