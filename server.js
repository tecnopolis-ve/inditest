const app = require('./src/index');
const port = 3000;

const server = app.mainApp.listen(port, () => {
    console.log(`Escuchando en http://localhost:${port}`);
});

module.exports = server