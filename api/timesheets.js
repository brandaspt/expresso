const express = require("express")
const sqlite3 = require("sqlite3")

// Middleware
const validateBody = (req, res, next) => {
    const { hours, rate, date } = req.body.timesheet
    if (!hours || !rate || !date) {
        res.status(400).json({ error: "Missing required fields" })
    } else {
        next()
    }
}

// Connect to database
const db = new sqlite3.Database(process.env.TEST_DATABASE || "./database.sqlite")

const router = express.Router({ mergeParams: true })

router.param("timesheetId", (req, res, next, id) => {
    db.get(`SELECT * FROM Timesheet WHERE id = ${id}`, (err, timesheet) => {
        if (err) {
            next(err)
        } else if (timesheet) {
            req.timesheet = timesheet
            next()
        } else {
            res.status(404).json({ error: "Timesheet not found" })
        }
    })
})

// GET all timesheets by employee id
router.get("/", (req, res, next) => {
    db.all(
        `SELECT * FROM Timesheet WHERE employee_id=${req.params.employeeId}`,
        (err, timesheets) => {
            if (err) {
                next(err)
            } else {
                res.status(200).json({ timesheets })
            }
        }
    )
})

// POST a new timesheet by employee id
router.post("/", validateBody, (req, res, next) => {
    const { hours, rate, date } = req.body.timesheet
    db.run(
        `INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES (?, ?, ?, ?)`,
        [hours, rate, date, req.params.employeeId],
        function (err) {
            if (err) {
                next(err)
            } else {
                db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (err, timesheet) => {
                    if (err) {
                        next(err)
                    } else {
                        res.status(201).json({ timesheet })
                    }
                })
            }
        }
    )
})

// UPDATE a timesheet
router.put("/:timesheetId", validateBody, (req, res, next) => {
    const { hours, rate, date } = req.body.timesheet
    db.serialize(() => {
        db.run(
            `UPDATE Timesheet SET hours = ?, rate = ?, date = ?, employee_id = ? WHERE id = ?`,
            [hours, rate, date, req.params.employeeId, req.params.timesheetId],
            function (err) {
                if (err) next(err)
            }
        )
        db.get(`SELECT * FROM Timesheet WHERE id = ${req.params.timesheetId}`, (err, timesheet) => {
            if (err) next(err)
            else {
                res.status(200).json({ timesheet })
            }
        })
    })
})

// DELETE a timesheet
router.delete("/:timesheetId", (req, res, next) => {
    db.run(`DELETE FROM Timesheet WHERE id = ${req.params.timesheetId}`, function (err) {
        if (err) next(err)
        else {
            res.sendStatus(204)
        }
    })
})

module.exports = router
