let express = require('express');
const mysql = require('mysql')

let app = express();

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
    let plant_info = [];
    let plant_type_info = [];
    let window_type_info = [];
    pull.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connected as id ${connection.threadId}`)

        // query (sqlString, callback)
        connection.query('SELECT * FROM plant WHERE id = ?', [req.params.id], (err, plantRows) => {
            if (err) {
                return console.log(err)
            }
            plant_info = plantRows[0]
            connection.query('SELECT * FROM plant_type WHERE id = ?', [plant_info.plant_type], (err, typesRows) => {
                plant_type_info = typesRows[0]
                
                connection.query('SELECT * FROM window_type WHERE id = ?', [plant_info.window_type], (err, windowRows) => {
                    window_type_info = windowRows[0]

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
    res.render('pages/admin-pages/admin-add-plant', {title: "Добавить растение (вид админа)"});
});

app.get('/admin/edit-plant', (req, res) => {
    let plant_types = [];
    let window_types = [];

    // Get all plant types
    pull.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connected as id ${connection.threadId}`)

        // query (sqlString, callback)
        connection.query('SELECT * FROM plant_type', (err, rows) => {
            connection.release() // return the connection to pool

            if (!err) {
                plant_types = rows;
            } else {
                console.log(err)
            }
        })
    })

    // Get all window types
    pull.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connected as id ${connection.threadId}`)

        // query (sqlString, callback)
        connection.query('SELECT * FROM window_type', (err, rows) => {
            connection.release() // return the connection to pool

            if (!err) {
                window_types = rows;
            } else {
                console.log(err)
            }
        })
    })
    console.log(plant_types)
    console.log(window_types)
    res.render('pages/admin-pages/admin-edit-plant', {
        title: "Редактировать растение (вид админа)", plant_types: plant_types,
        window_types: window_types
    });
});

// Listen on environment port or 5000
app.listen(port, () => console.log(`Listen on port ${port}`))

