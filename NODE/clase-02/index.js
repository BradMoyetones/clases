import { miniExpress } from "./lib/mini-express.js";

const app = miniExpress();

app.use((req, res, next) => {
    console.log("Middleware global 1");
    next();
});

app.use((req, res, next) => {
    console.log("Middleware global 2");
    next();
});

function checkAuth(req, res, next) {
    console.log("Middleware de ruta /auth");
    next();
}

app.get("/", (req, res) => {
    res.end("Home");
});

app.get("/auth", (req, res, next) => {
    res.end("Ruta protegida");
}, checkAuth);

app.listen(3000, () => {
    console.log("Escuchando en http://localhost:3000");
});
