const app = require('./src/index');
const port = 3000;

app.mainApp.listen(port, () => {
    console.log(`Escuchando en http://localhost:${port}`);
});
