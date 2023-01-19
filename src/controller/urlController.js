const urlModel = require("../models/urlModel")
const shortId = require('shortid')
const validUrl = require('valid-url')
const redis = require("redis")
const { promisify } = require('util')


const redisConnect = redis.createClient(19949, "redis-19949.c305.ap-south-1-1.ec2.cloud.redislabs.com")

redisConnect.auth("qCANTJJu9FQtVLa2NNxxCg4JxNe50Uyg", function (err) {
    if (err) throw err
})

redisConnect.on("connect", async function () {
    console.log("connected to redis..")
})


const shortUrl = async function (req, res) {
    try {

        let url = req.body.longUrl
        if (Object.keys(req.body) == 0 || typeof (url) != "string")
            return res.status(400).send({ status: false, message: "Please provide data" })
        if (Object.values(req.body) == 0)
            return res.status(400).send({ status: false, message: "Please provide value" })
        if (!url) return res.status(400).send({ status: false, message: "Please provide url" })

        if (!validUrl.isWebUri(url)) return res.status(400).send({ status: false, message: "invalid Url" })

        let baseUrl = "http://localhost:3000"
        let check = await urlModel.findOne({ longUrl: url })
        if (check) { return res.status(200).send({ status: true, msg: "Data already exist", check }) }
        if (!check) {
            let id = shortId.generate(url).toLowerCase()
            let shortUrl = baseUrl + "/" + id
            const savedata = await urlModel.create({
                longUrl: url, shortUrl: shortUrl, urlCode: id
            })

            let final = await urlModel.findById(savedata._id).select({ _id: 0, __v: 0 })

            return res.status(201).send({ status: true, data: final })

        }
        return res.status(200).send({ status: true, message: check })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

}

const GET_ASYNC = promisify(redisConnect.GET).bind(redisConnect)
const SET_ASYNC = promisify(redisConnect.SET).bind(redisConnect)

const geturl = async function (req, res) {
    try {

        let url = req.params.urlCode
        let cache = await GET_ASYNC(`${url}`)
        console.log(cache)
        console.log("send1")
        if(cache) {
            let cachedata = JSON.parse(cache)
            return res.status(302).redirect(cachedata.longUrl)}
        else{
            let data = await urlModel.findOne({urlCode: url})
            console.log(data)
            console.log("send2")
            if(!data) return res.status(404).send({status:false, message: "url not found"})
            await SET_ASYNC(`${url}`, JSON.stringify(data))
            return res.status(302).redirect(data.longUrl)
        }
       
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { shortUrl, geturl }