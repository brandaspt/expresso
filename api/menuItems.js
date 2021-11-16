const express = require("express")
const sqlite3 = require("sqlite3")

// Middleware
const validateBody = (req, res, next) => {
    const { name, inventory, price } = req.body.menuItem
    if (!name || !inventory || !price) res.status(400).json({ error: "Missing required fields" })
    else next()
}

// Connect to database
const db = new sqlite3.Database(process.env.TEST_DATABASE || "./database.sqlite")

const router = express.Router({ mergeParams: true })

router.param("menuItemId", (req, res, next, id) => {
    db.get(`SELECT * FROM MenuItem WHERE id = ${id}`, (err, menuItem) => {
        if (err) {
            next(err)
        } else if (menuItem) {
            req.menuItem = menuItem
            next()
        } else {
            res.status(404).json({ error: "Menu Item not found" })
        }
    })
})

// Routes
// GET all menu items by menu id
router.get("/", (req, res, next) => {
    db.all(`SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`, (err, menuItems) => {
        if (err) next(err)
        else res.status(200).json({ menuItems })
    })
})

// POST a new menu item by menu id
router.post("/", validateBody, (req, res, next) => {
    const { name, description, inventory, price } = req.body.menuItem
    db.run(
        `INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES (?, ?, ?, ?, ?)`,
        [name, description, inventory, price, req.params.menuId],
        function (err) {
            if (err) next(err)
            else {
                db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (err, menuItem) => {
                    if (err) next(err)
                    else res.status(201).json({ menuItem })
                })
            }
        }
    )
})

// UPDATE a menu item by id
router.put("/:menuItemId", validateBody, (req, res, next) => {
    const { name, description, inventory, price } = req.body.menuItem
    db.serialize(() => {
        db.run(
            `UPDATE MenuItem SET name = ?, description = ?, inventory = ?, price = ?, menu_id = ? WHERE id = ?`,
            [name, description, inventory, price, req.params.menuId, req.params.menuItemId],
            err => {
                if (err) next(err)
            }
        )
        db.get(`SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`, (err, menuItem) => {
            if (err) next(err)
            else res.status(200).json({ menuItem })
        })
    })
})

// DELETE a menu item by id
router.delete("/:menuItemId", (req, res, next) => {
    db.run(`DELETE FROM MenuItem WHERE id = ${req.params.menuItemId}`, err => {
        if (err) next(err)
        else res.sendStatus(204)
    })
})

module.exports = router
