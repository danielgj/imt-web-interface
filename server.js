var connect = require('connect');
var serveStatic = require('serve-static');

var app = connect();


app.use(serveStatic('./app/', {'index': ['index.html']}));
app.listen(3030);
console.log("IMT Web Interface running on port 3030");