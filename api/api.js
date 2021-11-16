const express = require("express")
const employeeRouter = require("./employees")
const menusRouter = require("./menus")

const router = express.Router()

router.use("/employees", employeeRouter)
router.use("/menus", menusRouter)

module.exports = router
