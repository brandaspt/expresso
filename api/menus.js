const express = require("express")
const sqlite3 = require("sqlite3")
const menuItemsRouter = require("./menuItems")

// Middleware
const validateBody = (req, res, next) => {
    const { title } = req.body.menu
    if (!title) res.status(400).json({ error: "Missing required fields" })
    else next()
}

// Connect to database
const db = new sqlite3.Database(process.env.TEST_DATABASE || "./database.sqlite")

const router = express.Router()

router.param("menuId", (req, res, next, id) => {
    db.get(`SELECT * FROM Menu WHERE id = ${id}`, (err, menu) => {
        if (err) {
            next(err)
        } else if (menu) {
            req.menu = menu
            next()
        } else {
            res.status(404).json({ error: "Menu not found" })
        }
    })
})

// /api/menus/:menuId/menu-items
router.use("/:menuId/menu-items", menuItemsRouter)

// Routes
// GET all menus
router.get("/", (req, res, next) => {
    db.all(`SELECT * FROM Menu`, (err, menus) => {
        if (err) next(err)
        else res.status(200).json({ menus })
    })
})

// POST a new menu
router.post("/", validateBody, (req, res, next) => {
    const { title } = req.body.menu
    db.run(`INSERT INTO Menu (title) VALUES ("${title}")`, function (err) {
        if (err) next(err)
        else {
            db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (err, menu) => {
                if (err) next(err)
                else res.status(201).json({ menu })
            })
        }
    })
})

// GET a menu by id
router.get("/:menuId", (req, res, next) => {
    res.status(200).json({ menu: req.menu })
})

// UPDATE a menu by id
router.put("/:menuId", validateBody, (req, res, next) => {
    const { title } = req.body.menu
    db.serialize(() => {
        db.run(`UPDATE Menu SET title = "${title}" WHERE id = ${req.params.menuId}`, err => {
            if (err) next(err)
        })
        db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId}`, (err, menu) => {
            if (err) next(err)
            else res.status(200).json({ menu })
        })
    })
})

// DELETE a menu by id
router.delete("/:menuId", (req, res, next) => {
    db.get(`SELECT * FROM MenuItem WHERE menu_id=${req.params.menuId}`, (err, menuItem) => {
        if (err) next(err)
        else if (menuItem) res.status(400).json({ error: "Menu has menu items" })
        else {
            db.run(`DELETE FROM Menu WHERE id = ${req.params.menuId}`, err => {
                if (err) next(err)
                else res.sendStatus(204)
            })
        }
    })
})

module.exports = router
