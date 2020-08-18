const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser')
const app = express();
const _ = require('underscore');
const fs = require('fs');
const PORT = process.env.PORT || 5000;
const uniqid = require('uniqid');

app.use(bodyParser.json());
//MySqul
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'noticias'
})

//Obtener la Fecha
function getDate() {
    const d = new Date();
    const output = `${d.getFullYear()}/${d.getMonth()}/${d.getDay()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}:${d.getMilliseconds()}`;
    console.log(output);
    return output;
}

//Check connect 
connection.connect(error => {
    (error) ? console.log(error) : console.log('Base de datos conectada');
});

//Agregar al acceso al CORS 
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


app.listen(PORT, () => {
    console.log(`Server en el puerto ${PORT}`);
});

///Inicio
app.get('/', (req, res) => {
    res.send('Bienvenido a mi API')
});



//-------------------Estas son las rutas CRUD de los NEWS--------------------------------------------------------------------------------/////


//Recuperar lista de noticias
app.get('/news', (req, res) => {
    const sql = ' SELECT * FROM news ORDER BY date DESC';
    connection.query(sql, (error, results) => {
        if (error) console.log(error);
        if (results.length > 0) {
            res.json({ results, value: true });
        } else {
            res.json({ value: false })
        }
    });
});

//Recuperar las noticias que ha escrito un usuario
//Consulta exemplo /news/user/rd4jzl04kdopnqyd
app.get('/news/user/?:id', (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM news WHERE userid = (SELECT id FROM users WHERE id = '${id}')`;
    connection.query(sql, (error, results) => {
        if (error) console.log(error);
        if (results.length > 0) {
            res.json({ results, value: true });
        } else {
            res.json({ value: false })
        }
    });
});

//Atraer una noticia por id
//Atraer una noticia por id /news/detail/3
app.get('/news/detail/?:id', (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM news WHERE id = '${id}'`;
    connection.query(sql, (error, results) => {
        if (error) console.log(error);
        if (results.length > 0) {
            res.json({ results, value: true });
        } else {
            res.json({ value: false })
        }
    });
});

//Actualizar una noticia
//Este es un ejemplo la solicitud /news/update/1
app.put('/news/update/:id', (req, res) => {
    const { id } = req.params;
    const { title, content, img, date, userid } = req.body;
    if (title && content && img && date && userid) {
        let sql = `UPDATE news SET ? WHERE ID = ${id}`;
        const usersOBJ = {
            title: title,
            content: content,
            img: img,
            date: date,
            userid: userid
        }
        connection.query(sql, usersOBJ, error => {
            (error) ? console.log(error) : res.json({ value: true });
        });
    }
});

//Envia una noticia
//Este es un ejemplo la solicitud /news/set/1
app.post('/news/set/', (req, res) => {
    const { title, content, img, userid } = req.body;
    if (title && content && img && userid) {
        let sql = `INSERT INTO news SET ?`;
        const usersOBJ = {
            title: title,
            content: content,
            img: img,
            date: getDate(),
            userid: userid
        }
        connection.query(sql, usersOBJ, error => {
            (error) ? console.log(error) : res.json({ value: true });
        });
    }
});

//Eliminar una noticia
//este es un ejemplo de la solicitud /news/delete/1
app.delete('/news/delete/:id', (req, res) => {
    const { id } = req.params;
    let sql = `DELETE FROM news WHERE ID = ${id}`;
    connection.query(sql, error => {
        (error) ? console.log(error) : res.json({ value: true });
    });
})

//-------------------Estas son las rutas CRUD de los USUARIOS--------------------------------------------------------------------------------/////


//validar la existencia del correo de un usuario en la base de datos
app.get('/users/validationemail/?:email', (req, res) => {
    const { email } = req.params;

    const sql = `SELECT id FROM users WHERE email = '${email}'`;
    connection.query(sql, (error, results) => {
        if (error) console.log(error);
        if (results.length > 0) {
            res.json({ value: true });
        } else {
            res.send({ value: false })
        }
    });
});

//validar la existencia del usuario en la base de datos
app.get('/users/validationuser/?:user', (req, res) => {
    const { user } = req.params;

    const sql = `SELECT id FROM users WHERE user = '${user}'`;
    connection.query(sql, (error, results) => {
        if (error) console.log(error);
        if (results.length > 0) {
            res.json({ value: true });
        } else {
            res.send({ value: false })
        }
    });
});

//validar el ingreso de los usuarios
//Ejemplo de una consulta users/validationlogin/user/password
app.get('/users/validationlogin/?:user/?:pass', (req, res) => {
    const { pass, user } = req.params;
    const sql = `SELECT id, access FROM users WHERE user = '${user}' and pass ='${pass}'`;
    connection.query(sql, (error, results) => {
    
        if (error) console.log(error);
        if (results.length > 0) {

            let data = JSON.stringify(results);
            data = JSON.parse(data);
            if (data[0].access === "true") {
                
                res.json({
                    results,
                    access: true,
                    value: true
                });

            } else {
                
                res.json({
                    access: false,
                    value: true
                });

            }
        } else {
            res.send({ value: false })
        }
    });
});

//Recuperar lista de usuarios
app.get('/users', (req, res) => {
    const sql = 'SELECT id, user, email, access FROM users';
    connection.query(sql, (error, results) => {
        if (error) console.log(error);
        if (results.length > 0) {
            res.json(results);
        } else {
            res.json({ value: false })
        }
    });
});

//recuperrar un Usuario por ID
app.get('/users/?:id', (req, res) => {
    const { id } = req.params;
    const sql = `SELECT id, user, email, access FROM users WHERE id = '${id}'`;
    connection.query(sql, (error, results) => {
        if (error) console.log(error);
        if (results.length > 0) {
            res.json({ results, value: true });
        } else {
            res.send({ value: false })
        }
    });
});

//Creando un usuario nuevo
app.post('/users', (req, res) => {
    const { user, pass, email, access } = req.body;
    console.log(req.body);
    if (user && pass && email) {
        let sql = `INSERT INTO users SET ?`;
        const usersOBJ = {
            id: uniqid(),
            user: user,
            email: email,
            pass: pass,
            access: access,
        }
        connection.query(sql, usersOBJ, error => {
            (error) ? console.log(error) : res.json({ value: true });
        });
    }
});

//Actualizar usuario
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const { user, pass, email, access } = req.body;
    if (user && pass && email) {
        let sql = `UPDATE users SET ? WHERE ID = '${id}'`;
        const usersOBJ = {
            user: user,
            email: email,
            pass: pass,
            access: access,
        }
        connection.query(sql, usersOBJ, error => {
            (error) ? console.log(error) : res.json({ value: true });
        });
    };
});

//Eliminar usuario
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    let sql = `DELETE FROM users WHERE ID = '${id}'`;
    connection.query(sql, error => {
        (error) ? console.log(error) : res.json({ value: true });
    });
})
