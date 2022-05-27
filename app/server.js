require("dotenv").config();
const app = require('./src/index');

const port = process.env.NODE_DOCKER_PORT || 3000;

const server = app.mainApp.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});

module.exports = server