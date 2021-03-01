const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')

const app = express()
const port = process.env.PORT || 5000

app.use(bodyParser.urlencoded({extended: false}))

app.use(bodyParser.json())

// MySQL
const pull = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'plants'
});

// Get all plants
app.get('', (req, res) => {
    pull.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connected as id ${connection.threadId}`)

        // query (sqlString, callback)
        connection.query('SELECT * FROM plant', (err, rows) => {
            connection.release() // return the connection to pool

            if (!err) {
                res.send(rows)
            } else {
                console.log(err)
            }
        })
    })
})


// Get a plant by id
app.get('/:id', (req, res) => {
    pull.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connected as id ${connection.threadId}`)

        // query (sqlString, callback)
        connection.query('SELECT * FROM plant WHERE id = ?', [req.params.id], (err, rows) => {
            connection.release() // return the connection to pool

            if (!err) {
                res.send(rows)
            } else {
                console.log(err)
            }
        })
    })
})


// Delete a plant
app.delete('/:id', (req, res) => {
    pull.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connected as id ${connection.threadId}`)

        // query (sqlString, callback)
        connection.query('DELETE FROM plant WHERE id = ?', [req.params.id], (err, rows) => {
            connection.release() // return the connection to pool

            if (!err) {
                res.send(`Plant with the Record ID: ${req.params.id} has been removed`)
            } else {
                console.log(err)
            }
        })
    })
})


// Add a record
app.post('', (req, res) => {
    pull.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connected as id ${connection.threadId}`)

        const params = req.body

        // query (sqlString, callback)
        connection.query('INSERT INTO plants SET ?', params, [req.params.id], (err, rows) => {
            connection.release() // return the connection to pool

            if (!err) {
                res.send(`Plant with the Name: ${params.name} has been added`)
            } else {
                console.log(err)
            }
        })

        console.log(req.body)
    })
})


// Update a record
app.put('/:id', (req, res) => {
    pull.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connected as id ${connection.threadId}`)

        const {id, name, description, plant_type, window_type} = req.body

        // query (sqlString, callback)
        connection.query('UPDATE plants SET name = ? WHERE id =  ?', [name, id], [req.params.id], (err, rows) => {
            connection.release() // return the connection to pool

            if (!err) {
                res.send(`Plant with the Name: ${name} has been updated`)
            } else {
                console.log(err)
            }
        })

        console.log(req.body)
    })
})


// Listen on environment port or 5000
app.listen(port, () => console.log(`Listen on port ${port}`))