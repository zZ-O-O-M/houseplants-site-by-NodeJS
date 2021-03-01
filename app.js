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

app.get('/plant', (req, res) => {
    res.render('pages/user-pages/user-plant', {title: "Папопротник"});
});

// Admin links
app.get('/admin', (req, res) => {
    res.render('pages/admin-pages/admin-main', {title: "Растения (вид админа)"});
});

app.get('/admin/add-plant', (req, res) => {
    res.render('pages/admin-pages/admin-add-plant', {title: "Добавить растение (вид админа)"});
});

app.get('/admin/edit-plant', (req, res) => {
    res.render('pages/admin-pages/admin-edit-plant', {title: "Редактировать растение (вид админа)"});
});

// Listen on environment port or 5000
app.listen(port, () => console.log(`Listen on port ${port}`))