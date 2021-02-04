# Lottery App API

> Lottery App API - NodeJs/Express backend for the lottery app.

## Description

The backend restful API with routes that provide JSON data to the frontend application. This API was developed with Node, Express and connects to a MongoDB database for CRUD operations. Two external APIs are used to get the drawing results and the upcoming jackpots.

## Features

Restful backend

## API Routes

| Web API                     | URL                        | Method | Description                                                |
| --------------------------- | -------------------------- | ------ | ---------------------------------------------------------- |
| Get Results                 | /api/v1/results            | GET    | Fetch all results from DB                                  |
| Check Results               | /api/v1/checkresults       | GET    | Check all results for open tickets                         |
| Numbers Played              | /api/v1/numbersplayed      | GET    | Fetch all numbers played                                   |
| Numbers Played by Id        | /api/v1/numbersplayed/:id  | GET    | Fetch specific ticket's numbers                            |
| Create Numbers Played       | /api/v1/numbersplayed      | POST   | Save new set of numbers played                             |
| Update Numbers Played       | /api/v1/numbersplayed/:id  | PATCH  | Save updated numbers played                                |
| Delete Numbers Played       | /api/v1/numbersplayed/:id  | DELETE | Delete specific ticket's numbers                           |
| Numbers Played/Winning Nbrs | /api/v1/drawsforticket/:id | GET    | Retrieve specific Numbers Played and Winning Numbers by Id |
| Winning Numbers             | /api/v1/winningnumbers     | GET    | Fetch winning numbers                                      |
| Upcoming Jackpots           | /api/v1/checkupcoming      | GET    | Fetch upcoming jackpots                                    |

## Technologies

- axios
- express
- mocha and chai
- mongoose
- node
- others...

## Dependencies

- All packages listed in package.json
- The app looks for the following values in a .env file.

  - NODE_ENV
  - PORT
  - MONGO_URI
  - NY_DATA_PB_URI
  - NY_DATA_MEGA_URI
  - NY_DATA_APP_TOKEN
  - MAGAYO_URI
  - MAGAYO_API_KEY

- An account setup at: https://data.ny.gov/
  - [Developer documentation](https://data.ny.gov/developers)
  - [Mega Millions information](https://dev.socrata.com/foundry/data.ny.gov/5xaw-6ayf)
  - [Powerball information](https://dev.socrata.com/foundry/data.ny.gov/d6yy-54nr)
- An account setup at: https://www.magayo.com/
  - [Documentation for next jackpots](https://www.magayo.com/lottery-docs/api/get-next-jackpot/)
  - NOTE: Free account is very limited, only 10 requests per calendar month
- A MongoDB either running locally or via MongoDB Atlas

## Links

- Project homepage: https://github.com/rhoofr/lottery-app-api
- Related projects:
  - Frontend: https://github.com/rhoofr/lottery-app

## License

> You can check out the full license [here](https://github.com/rhoofr/lottery-app-api/blob/main/LICENSE)

This project is licensed under the terms of the **MIT** license.
