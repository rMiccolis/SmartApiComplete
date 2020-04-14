if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const app = express();

const indexRouter = require('./controllers/routes/index');
const authRouter = require('./controllers/routes/auth');
const userRouter = require('./controllers/routes/user');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use('/', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

const db = require('./models/db.js');

checkMysqlConnection()
    .then(() => console.log('Connected to Mysql'))
    .catch(error => console.log(error.message));


app.listen(process.env.PORT || 3000);

function checkMysqlConnection() {
    return new Promise((resolve, reject) => {
        resolve(db.query("SELECT 1"));
    });
}