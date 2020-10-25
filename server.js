require('dotenv').config();
//webserver stuff
const express = require('express');
const helmet = require('helmet');
const nunjucks = require('nunjucks');

//db stuff
const monk = require('monk');
const db = monk(process.env.MONGO_PASS);

const shortid = require('shortid');

db.then(() => {//connect to db
    console.log(`connected to mongo`);
});
const urls = db.get('urls');//make a collection called urls
urls.createIndex('short');//index by the short id
urls.createIndex('url');//index by the long url

//MIDDLEWARES
const app = express();//server
app.use(helmet());//some basic security
app.use(express.json());//allow json rendering
app.use(express.urlencoded({ extended: false}));//allow urlencoding
nunjucks.configure('views', {//set the render engine for nunjucks
    autoescape: true,
    express: app
});
app.use('/favicon.ico', express.static('./favicon.ico'));

//routes
app.get('/', (req, res)=>{//serve index
    res.render('index.njk')
});

function home(req, res){//home function for when we have data
    var short = req.short;
    res.render('index.njk', {short})//render and pass context 
}

app.post('/url', async (req, res, next) => {
    var url = req.body.LongURL;//get the long url from the POST
    if(url.search("http") != 0){
        url = "http://" + url;
    }
    //TODO: short words instead
    //TODO: custom short urls
    let newUrl = null;
    try { //check if long url is already in db
        newUrl = await urls.findOne({ url });
    }catch(err){
        console.log(err);
        res.status(500).json('poop');
    }
    if(!newUrl){//Long URL didn't exist in db
        let short = shortid.generate();
        while(short.match(/-|_/)){//no dashes or underscores
            short = shortid.generate();//generate a new id
        }
        const shortUrl = {//submit these fields into the db
            url,
            short,
            clicks:0,
        };
        newUrl = await urls.insert(shortUrl);
    }
    req.short = newUrl;//set url data before passing to be rendered
    return next();//render the page with new data
}, home);

app.post('/search', async (req, res, next) => {
    var short = req.body.shortURL;//get the short url from the POST
    if(!short){
        return res.redirect('/');
    }
    var domain = short.search("bzuckier.com/");//find the domain
    if(domain >=0 ){//if there is the domain
        short = short.substring(domain+13);//get rid of domain, just id
    }
    try { //get the short url data
        shortData = await urls.findOne({ short });
    }catch(err){
        console.log(err);
        res.status(500).json('poop');
    }
    if(!shortData){//short URL didn't exist in db
        return res.status(404).json("That is not a valid short URL.");
    }
    req.short = shortData;//set url data before passing to be rendered
    return next();//render the page with new data
}, home);

app.post('/api/', async (req, res) =>{//restful api that return short from long
    var url = req.body.LongURL;//get the long url from the POST
    if(url.search("http") != 0){
        url = "http://" + url;
    }
    var newUrl = null;
    try { //check if long url is already in db
        newUrl = await urls.findOne({ url });
    }catch(err){
        console.log(err);
        res.status(500).json('bad db');
    }
    if(!newUrl){//Long URL didn't exist in db
        let short = shortid.generate();
        while(short.match(/-|_/)){//no dashes or underscores
            short = shortid.generate();//generate a new id
        }
        const shortUrl = {//submit these fields into the db
            url,
            short,
            clicks:0,
        };
        newUrl = await urls.insert(shortUrl);
    }
    res.json("https://bzuckier.com/" + short);//return short url
});

app.get('/:short', async (req, res)=>{//url encoded param, will accept anything matching the pattern
    const short = req.params.short;//get the short id from the GET
    try {
        const url = await urls.findOne({ short });//find in db
        if (url) {
            await urls.update({id: url.id}, {$set: {clicks: url.clicks+1}});//update num clicks
            res.redirect(url.url);//send to the long url value
        } else { 
            res.status(404).json("That is not a valid short URL.");
        }
    } catch(err){
        console.log(err);
        res.status(500).json('poo');
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}...`));
