let express = require('express');
const mysql = require('mysql')

let app = express();
let bodyParser = require('body-parser')

let urlEncodedParser = bodyParser.urlencoded({extended: false})

// Set port
const port = process.env.PORT || 5000

// MySQL
const pull = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'plants'
});

// Set template engine
app.set('view engine', 'ejs')

// Set static files link
app.use('/public', express.static('public'));


/* Set site links */

// User links
app.get('/', (req, res) => {
    let plants;

    pull.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connected as id ${connection.threadId}`)

        // query (sqlString, callback)
        connection.query('SELECT * FROM plant', (err, rows) => {
            connection.release() // return the connection to pool

            if (!err) {
                res.render('pages/user-pages/user-main', {title: "Растения", plants: rows});
            } else {
                console.log(err)
            }
        })
    })

});

app.get('/plant/:id', (req, res) => {
    pull.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connected as id ${connection.threadId}`)

        // query (sqlString, callback)
        connection.query('SELECT * FROM plant WHERE id = ?', [req.params.id], (err, plantRows) => {
            let plant_info = plantRows[0]

            connection.query('SELECT * FROM plant_type WHERE id = ?', [plant_info.plant_type], (err, typesRows) => {
                let plant_type_info = typesRows[0]

                connection.query('SELECT * FROM window_type WHERE id = ?', [plant_info.window_type], (err, windowRows) => {
                    let window_type_info = windowRows[0]

                    res.render('pages/user-pages/user-plant', {
                        title: plant_info.name,
                        plant: plant_info,
                        plant_type: plant_type_info,
                        window_type: window_type_info
                    });
                })
            })
        })
    })
})

/* ***** ADMIN ******/

// Admin links
app.get('/admin', (req, res) => {

    pull.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connected as id ${connection.threadId}`)

        // query (sqlString, callback)
        connection.query('SELECT * FROM plant', (err, rows) => {
            connection.release() // return the connection to pool

            if (!err) {
                res.render('pages/admin-pages/admin-main', {title: "Растения (вид админа)", plants: rows});
            } else {
                console.log(err)
            }
        })
    })
});

app.get('/admin/add-plant', (req, res) => {
    pull.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connected as id ${connection.threadId}`)

        connection.query('SELECT * FROM plant_type', (err, all_types_rows) => {
            let all_plant_types_info = all_types_rows;

            connection.query('SELECT * FROM window_type', (err, all_window_types_rows) => {
                res.render('pages/admin-pages/admin-add-plant', {
                    title: "Добавить растение (вид админа)",
                    all_plant_types: all_plant_types_info,
                    all_window_types: all_window_types_rows
                });
            })
        })
    })

});

app.get('/admin/edit-plant/:id', (req, res) => {

    // Get all plant types
    pull.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connected as id ${connection.threadId}`)

        connection.query('SELECT * FROM plant WHERE id = ?', [req.params.id], (err, plat_rows) => {
            let plant_info = plat_rows[0]

            connection.query('SELECT * FROM plant_type', (err, all_types_rows) => {
                let all_plant_types_info = all_types_rows;

                connection.query('SELECT * FROM window_type', (err, all_window_types_rows) => {
                    res.render('pages/admin-pages/admin-edit-plant', {
                        title: plant_info.name,
                        plant: plant_info,
                        all_plant_types: all_plant_types_info,
                        all_window_types: all_window_types_rows
                    });
                })
            })
        })
    })
});


// Admin actions

app.post('/admin/edit-action-plant/:id', urlEncodedParser, (req, res) => {
    pull.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connected as id ${connection.threadId}`)
        console.log(req.body)
        let sql_query = 'UPDATE plant SET name = ?, requirements = ?, plant_type = ?, window_type = ? WHERE id = ?'
        let data = [req.body.name, req.body.requirements, req.body.plant_type, req.body.window_type, req.params.id]

        connection.query(sql_query, data, (err, result) => {
            return res.redirect('/admin');
        })
    })
});

app.post('/admin/add-action-plant', urlEncodedParser, (req, res) => {
    pull.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connected as id ${connection.threadId}`)

        let sql_query = 'INSERT INTO plant (name, requirements, plant_type, window_type) VALUES(?,?,?,?)'
        let data = [req.body.name, req.body.requirements, req.body.plant_type, req.body.window_type]

        connection.query(sql_query, data, (err, result) => {
            return res.redirect('/admin');
        })
    })
});

app.get('/admin/delete-action-plant/:id', (req, res) => {
    pull.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connected as id ${connection.threadId}`)
        connection.query('DELETE FROM plant WHERE id =?', [req.params.id], (err, plat_rows) => {
            return res.redirect('/admin');
        })
    })
});

// Listen on environment port or 5000
app.listen(port, () => console.log(`Listen on port ${port}`))

