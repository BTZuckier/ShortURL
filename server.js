require('dotenv').config();
const express = require('express');
const monk = require('monk');
const nunjucks = require('nunjucks');
const helmet = require('helmet');
const db = monk(process.env.MONGO_PASS);
const yup = require('yup');
const cors = require('cors');
const shortid = require('shortid');
db.then(() => {
    console.log(`connected to mongo`);
});
const urls = db.get('urls');
urls.createIndex('short');
// urls.createIndex('name');
// urls.insert([{a: 1}, {a:2}]).then(()=> {
//     console.log(`done`)
// })
const input = yup.object().shape({
    url: yup.string().trim().url().required(),
});

const app = express();
// app.use(express.urlencoded({extended: false}));
app.use(express.json())
app.use(helmet());
app.use(cors());

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

app.get('/', (req, res) => {
    res.render('index.njk');
});

app.post('/url', async (req, res, next) => {
    const url = req.body.LongURL;
    try {
        await input.validate({
            url,
        });
    } catch (err) {
        next(err);
        // res.status(500).json('ruh roh' + url);
    }
    const short = shortid.generate();
    const shortUrl = {
        url,
        short,
    };
    const inserted = await urls.insert(shortUrl);
    res.json(inserted);
});
app.use((err, req, res, next) => {
    res.status(500).json('ruh roh' + url);
});

app.get('/:short', async (req, res)=>{
    const short = req.params.short;
    try {
        const url = await urls.findOne({ short });
        if (url) {
            res.redirect(url.url);
        } else { 
            res.status(500).json('poo');
        }
    } catch(err){
        res.status(500).json('poo');
    }
});

app.listen(1337, () => console.log(`Started on port 1337`));