const urlModel = require("../models/urlModel")
const shortId = require('shortid')
const validUrl = require('valid-url')


const shortUrl = async function (req, res) {
    try {

        let url = req.body.longUrl
        if (Object.keys(req.body) == 0 || typeof (url) != "string")
            return res.status(400).send({ status: false, message: "Please provide data" })
        if (Object.values(req.body) == 0)
            return res.status(400).send({ status: false, message: "Please provide value" })
        if (!url) return res.status(400).send({ status: false, message: "Please provide url" })

        if (!validUrl.isWebUri(url)) return res.status(400).send({ status: false, message: "invalid Url" })

        let baseUrl = "localhost:3000"
        let check = await urlModel.findOne({ longUrl: url })
        if(check){return res.status(200).send({status:true,msg:"Data already exist",check})}
        if (!check) {
            let id = shortId.generate(url).toLowerCase()
            let shortUrl = baseUrl + "/" + id
            const savedata = await urlModel.create({
                longUrl: url, shortUrl: shortUrl, urlCode: id
            })
           
            let final = await urlModel.findById(savedata._id).select({_id:0, __v:0})
           
            return res.status(201).send({ status: true, data: final})

        }
        return res.status(200).send({ status: true, message: check })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

}

const getData = async function(req,res){
    try {
        let url = req.params
        console.log(url)
        // if(!url) return res.status(400).send({status:false, message: "invalid url"})
        let data = await urlModel.findOne({urlCode: url.urlCode})
        console.log(data)
        if(!data) return res.status(404).send({status: false, message: "url is not present"})
        console.log(data.longUrl)
        res.status(302).redirect(data.longUrl)
    } catch (error) {
        return res.status(500).send({status: false, message: error.message})
    }
    
}

module.exports = { shortUrl }