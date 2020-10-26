<p align="center">
    <img src="https://github.com/BTZuckier/ShortURL/blob/main/icons/android-chrome-512x512.png" width=192>
</p>
<h1 align="center">URL Shrtnr</h1>

[URL Shrtnr](https://bzuckier.com) is a lightweight URL shortener service hosted on the [Google Cloud App Engine](https://cloud.google.com/appengine)

## Brief
[URL Shrtnr](https://bzuckier.com) is a lightweight URL shortener service with a RESTful API.

The backend is powered by [Node.js](https://nodejs.org/en/) + [Express](https://expressjs.com/) with a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) database.
The frontend uses the [Bootswatch](https://bootswatch.com/) [Darkly](https://bootswatch.com/darkly/) theme for [Bootstrap](https://getbootstrap.com/) with the templating engine [Nunjucks](https://mozilla.github.io/nunjucks/).

## Usage

Go to https://bzuckier.com and have a go.

## API
| Protocol  | Endpoint/Data |
| ------------- | ------------- |
| GET | /{ShortURL}  |
| POST JSON | api/[{"LongURL": "https://example.com/LongURL"}]  |

## Examples
`GET https://bzuckier.com/w44J3pFyP` redirects-> https://github.com/BTZuckier/ShortURL

`POST {"LongURL": "mongodb.com/cloud/atlas"}` to `bzuckier.com/api` -> `{"https://bzuckier.com/L5rJX9vAG"}`

## Features

### Basic Features
- [x] Fast and Lightweight
- [x] RESTful API to GET and POST short and long urls
- [x] Web application to use the service

### Advanced Features
- [x] Tracks URL clicks
- [ ] Progressive Web App
- [ ] Option to generate two short words instead of ID
- [ ] Option to provide custom short ID

### Features that will never be implemented
- [ ] Ads
- [ ] Premium

## Deploy Locally

Clone, then run `npm install` followed by `npm build` and then `npm start`.

## Dev Process
Initially I had created the frontend with Vue.js and Vuetify but it started getting too complicated for the scale of the app I was making. As such, I decided to swtich over to vanilla JS (with Nunjucks) and a Bootstrap theme.

As I state in the features section, I would have liked to make the service into a PWA and I also would have liked to include options when generating the short ID, both the ability to generate two short words (eg. bzuckier.com/sadLlama) and to create your own custom short ID.

## Explanation
The server works as follows. The first route is '/' which serves the index.html page in /views/. The main form on that page sends a POST to the server with the Long URL the user wants to shorten, and then the server responds with the same index.html page plus some data including the Long URL, short URL, and number of clicks. There is also a smaller search field that sends a POST with a short URL (either with the bzuckier domain or just the short ID) and the server similarly responds with the index.html page plus the same URL data as above.

When a user does a GET to any other route that starts with /, encoded as '/:short' the server takes that short ID and does a lookup in the database. If it doesn't exist then the user gets a 404 page. If it does exists, then the user is redirected to the Long URL associated with that shortID and the clicks value is incremented by one in the database.
