const urlModel = require("../models/urlModel")
const shortId = require('shortid')
const validator = require('valid-url')
const redis = require("redis")
const { promisify } = require('util')
const baseUrl = "http://localhost:3000/"

// <----------------------------Redis connection----------------------------------->

const redisConnect = redis.createClient(18533, "redis-18533.c246.us-east-1-4.ec2.cloud.redislabs.com",
    { no_ready_check: true })

redisConnect.auth("iZQWDNX2npnjZ7DN3Ez23wi1iZ7y2vXj", function (err) {
    if (err) throw err
})

redisConnect.on("connect", async function () {
    console.log("Connected to Redis..")
})

const GET_ASYNC = promisify(redisConnect.GET).bind(redisConnect)
const SET_ASYNC = promisify(redisConnect.SET).bind(redisConnect)


// <------------------------------Create ShortUrl----------------------------------->

const shortUrl = async function (req, res) {
    try {
        const data = req.body;
        let longUrl = data.longUrl;
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "Please Enter Longurl to create shorturl" })
        }
        if (Object.values(req.body) == 0) {
            return res.status(400).send({ status: false, message: "Please provide value" })
        }
        if (!longUrl)
            return res.status(400).send({ status: false, message: "Please provide LongUrl" });
        if (!validator.isWebUri(longUrl)) {
            return res.status(400).send({ status: false, message: "Not a valid url" })
        }
        let cachedLongUrl = await GET_ASYNC(`${longUrl}`)
        let Link = JSON.parse(cachedLongUrl)
        if (Link) {
            return res.status(200).send({ longUrl: Link.longUrl, shortUrl: Link.shortUrl, urlCode: Link.urlCode })
        }
        let urlFound = await urlModel.findOne({ longUrl: longUrl })
        if (urlFound) {
            return res.status(200).send({ status: true, message: "data already exist", data: { longUrl: urlFound.longUrl, shortUrl: urlFound.shortUrl, urlCode: urlFound.urlCode } })
        }
        const urlCode = shortId.generate(longUrl).toLowerCase();
        const shortUrl = baseUrl + urlCode;
        const url = { longUrl: longUrl, shortUrl: shortUrl, urlCode: urlCode };

        const Data = await urlModel.create(url)
        res.status(201).send({ status: true, data: { longUrl: Data.longUrl, shortUrl: Data.shortUrl, urlCode: Data.urlCode } });
        await SET_ASYNC(`${longUrl}`, JSON.stringify(Data))
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
};

// <-----------------------------------Get Url--------------------------------------->

const getUrl = async function (req, res) {
    try {

        let url = req.params.urlCode
        let cache = await GET_ASYNC(`${url}`)
        console.log(cache)
        console.log("send1")
        if (cache) {
            let cachedata = JSON.parse(cache)
            return res.status(301).redirect(cachedata.longUrl)
        }
        else {
            let data = await urlModel.findOne({ urlCode: url })
            console.log(data)
            if (!data) return res.status(404).send({ status: false, message: "url not found" })
            await SET_ASYNC(`${url}`, JSON.stringify(data))
            return res.status(302).redirect(data.longUrl)
        }
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { shortUrl, getUrl }
