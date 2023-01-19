const express = require('express')
const router = express.Router()
const urlController = require('../controller/urlController')

router.post('/url/shorten', urlController.shortUrl)
router.get("/:urlCode", urlController.getUrl)

router.all("/*", function (req, res) {
    res.status(404).send({ status: false, message: "invalid https request" })
})

module.exports = router

