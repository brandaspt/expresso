const sqlite3 = require("sqlite3")

const db = new sqlite3.Database("./database.sqlite")

db.serialize(() => {
    // Drop tables
    db.run("DROP TABLE IF EXISTS Employee")
    db.run("DROP TABLE IF EXISTS Timesheet")
    db.run("DROP TABLE IF EXISTS Menu")
    db.run("DROP TABLE IF EXISTS MenuItem")

    // Create tables
    // Employee
    db.run(
        `CREATE TABLE Employee (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    wage INTEGER NOT NULL,
    is_current_employee INTEGER DEFAULT 1)`,
        err => {
            if (err) {
                throw err
            } else {
                console.log("Employee table created")
            }
        }
    )

    // Timesheet
    db.run(
        `CREATE TABLE Timesheet (
    id INTEGER PRIMARY KEY,
    hours INTEGER NOT NULL,
    rate INTEGER NOT NULL,
    date TEXT NOT NULL,
    employee_id INTEGER NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES Employee(id))`,
        err => {
            if (err) {
                throw err
            } else {
                console.log("Timesheet table created")
            }
        }
    )

    // Menu
    db.run(
        `CREATE TABLE Menu (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL)`,
        err => {
            if (err) {
                throw err
            } else {
                console.log("Menu table created")
            }
        }
    )

    // MenuItem
    db.run(
        `CREATE TABLE MenuItem (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    inventory INTEGER NOT NULL,
    price INTEGER NOT NULL,
    menu_id INTEGER NOT NULL,
    FOREIGN KEY (menu_id) REFERENCES Menu(id))`,
        err => {
            if (err) {
                throw err
            } else {
                console.log("MenuItem table created")
            }
        }
    )
})
