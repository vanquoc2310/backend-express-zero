const path = require('path');
const express = require('express');

const configViewEngine = (app) => {
    //config template engine
    app.set('views', path.join('./src', 'views')); // Đặt đường dẫn tới thư mục chứa các file template.
    app.set('view engine', 'ejs');                   // Thiết lập EJS làm template engine mặc định.

    // config static files: img, css,...
    app.use(express.static(path.join('./src', 'public')));
}

module.exports = configViewEngine;