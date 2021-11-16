const express = require("express")
const sqlite3 = require("sqlite3")
const timesheetsRouter = require("./timesheets")

// Middleware
const validateBody = (req, res, next) => {
    const { name, position, wage } = req.body.employee
    if (!name || !position || !wage) {
        res.status(400).json({ error: "Missing required fields" })
    } else {
        req.body.employee.isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1
        next()
    }
}

// Connect to database
const db = new sqlite3.Database(process.env.TEST_DATABASE || "./database.sqlite")

const router = express.Router()

router.param("employeeId", (req, res, next, id) => {
    db.get(`SELECT * FROM Employee WHERE id = ${id}`, (err, employee) => {
        if (err) {
            next(err)
        } else if (employee) {
            req.employee = employee
            next()
        } else {
            res.status(404).json({ error: "Employee not found" })
        }
    })
})

// /api/employees/:employeeId/timesheets
router.use("/:employeeId/timesheets", timesheetsRouter)

// Routes
// GET all employees
router.get("/", (req, res, next) => {
    db.all("SELECT * FROM Employee WHERE is_current_employee=1", (err, employees) => {
        if (err) {
            next(err)
        } else {
            res.status(200).json({ employees })
        }
    })
})

// POST new employee
router.post("/", validateBody, (req, res, next) => {
    const { name, position, wage, isCurrentEmployee } = req.body.employee
    db.run(
        `INSERT INTO Employee (name, position, wage, is_current_employee) VALUES (?, ?, ?, ?)`,
        [name, position, wage, isCurrentEmployee],
        function (err) {
            if (err) {
                next(err)
            } else {
                db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (err, employee) => {
                    if (err) {
                        next(err)
                    } else {
                        res.status(201).json({ employee })
                    }
                })
            }
        }
    )
})

// GET employee by id
router.get("/:employeeId", (req, res, next) => {
    res.status(200).json({ employee: req.employee })
})

// UPDATE employee by id
router.put("/:employeeId", validateBody, (req, res, next) => {
    const { name, position, wage, isCurrentEmployee } = req.body.employee
    db.serialize(() => {
        db.run(
            `UPDATE Employee SET name = ?, position = ?, wage = ?, is_current_employee = ? WHERE id = ?`,
            [name, position, wage, isCurrentEmployee, req.employee.id],
            err => {
                if (err) next(err)
            }
        )
        db.get(`SELECT * FROM Employee WHERE id = ${req.employee.id}`, (err, employee) => {
            if (err) next(err)
            res.status(200).json({ employee })
        })
    })
})

// DELETE employee by id
router.delete("/:employeeId", (req, res, next) => {
    db.serialize(() => {
        db.run(`UPDATE Employee SET is_current_employee = 0 WHERE id = ${req.employee.id}`, err => {
            if (err) next(err)
        })
        db.get(`SELECT * FROM Employee WHERE id = ${req.employee.id}`, (err, employee) => {
            if (err) {
                next(err)
            } else {
                res.status(200).json({ employee })
            }
        })
    })
})

module.exports = router
