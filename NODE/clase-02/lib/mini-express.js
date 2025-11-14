import http from "node:http"

export function miniExpress() { 
    const routes = []
    const middlewares = [];

    function app (req, res) {
        let idx = 0;

        function runGlobals() {
            if (idx >= middlewares.length) {
                return runRoute(); 
            }

            const mw = middlewares[idx++];
            mw(req, res, runGlobals);
        }

        // Ejecutar el handler de la ruta
        function runRoute() {
            const method = req.method;
            const url = req.url;

            const route = routes.find(r => r.method === method && r.path === url);

            if (!route) {
                res.statusCode = 404;
                res.end("Not Found");
                return;
            }

            // Sistema de middlewares por ruta
            let rIndex = 0;
            const stack = [...route.middlewares, route.handler];

            function runStack() {
                const layer = stack[rIndex++];
                if (!layer) return; 
                layer(req, res, runStack); // igual que Express
            }

            runStack();
        }

        runGlobals();
    }

   // Registrar middlewares globales
    app.use = (mw) => {
        middlewares.push(mw);
    };

    // Registrar rutas
    app.get = (path, handler, ...routeMiddlewares) => {
        routes.push({
            method: "GET",
            path,
            handler,
            middlewares: routeMiddlewares
        });
    };

    app.post = (path, handler, ...routeMiddlewares) => {
        routes.push({
            method: "POST",
            path,
            handler,
            middlewares: routeMiddlewares
        });
    };

    app.listen = (port, cb) => {
        const server = http.createServer(app);
        server.listen(port, cb);
    };

    return app;
}