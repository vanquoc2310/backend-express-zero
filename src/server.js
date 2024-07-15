
require('dotenv').config();

const cors = require('cors');
const express = require('express')
const configViewEngine = require('./config/viewEngine');
const authRoutes = require('./routes/auth.js');
const webRoutes = require('./routes/web.js');
const sequelize = require('./models');

const app = express(); // app express
const port = process.env.PORT || 8081; //port
const hostname = process.env.HOST_NAME;

// config req.body
app.use(express.json()); // for json
app.use(express.urlencoded({extended: true})); // for form data
app.use(cors());

// config template engine
configViewEngine(app);


app.use('/api/auth', authRoutes);
app.use('/', webRoutes);
// const path = require('path');

// // Chỉ định thư mục build của React là thư mục tĩnh
// app.use(express.static(path.join(__dirname, '../smilecaredental/build')));

// // Route để trả về index.html cho tất cả các request không khớp với API routes
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../smilecaredental/build', 'index.html'));
// }); 

require('./cron/cron');

app.listen(port, hostname, () => {
    console.log(`Example app listening on port ${port}`);
})