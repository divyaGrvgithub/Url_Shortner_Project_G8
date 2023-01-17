const express = require('express')
const router = express.Router()
const urlController = require('../controller/urlController')

router.post('/url/shorten', urlController.shortUrl)
router.get("/:urlCode", urlController.getData)

router.all("/*",function(req,res){
    res.status(400).send({status: false, message: "invalid https request"})
})

module.exports = router