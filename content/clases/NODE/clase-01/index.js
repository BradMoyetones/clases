import http from "node:http"
import fs from "node:fs/promises"
import path from "node:path"

async function createFileAndWrite(filePath, content) {
    try {
        await fs.writeFile(filePath, content, { encoding: 'utf8', flag: 'w' });
        console.log(`File "${filePath}" created/overwritten successfully.`);
    } catch (error) {
        console.error(`Error creating/writing to file "${filePath}":`, error);
    }
}


async function proccessRequest(req) {
    let body = "";

    // Leer body (por si el usuario envía algo)
    for await (const chunk of req) {
        body += chunk;
    }

    const info = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: body || null
    };

    return info
}


function parsePart(part) {
    const [rawHeaders, rawContent] = part.split('\r\n\r\n');
    const headers = rawHeaders.split('\r\n').reduce((acc, line) => {
        const [key, value] = line.split(':').map(x => x.trim());
        acc[key.toLowerCase()] = value;
        return acc;
    }, {});

    const contentDisposition = headers['content-disposition'];
    const nameMatch = /name="(.+?)"/.exec(contentDisposition);
    const filenameMatch = /filename="(.+?)"/.exec(contentDisposition);

    return {
        name: nameMatch?.[1] ?? null,
        filename: filenameMatch?.[1] ?? null,
        content: rawContent.trim()
    };
}


// Creamos el servidor
const server = http.createServer(async (req, res) => {

    let info = await proccessRequest(req)
    
    const contentType = req.headers["content-type"];
    const boundary = "--" + contentType.split("boundary=")[1];

    const parts = info.body
            ?.split(boundary)
            .filter(p => p.trim() !== "" && p.trim() !== "--");

    const formData = {};

    for (const part of parts) {
        const parsed = parsePart(part);
        if (!parsed) continue;

        formData[parsed.name] = parsed.filename
            ? { filename: parsed.filename, content: parsed.content }
            : parsed.content;
    }

    info.body = formData

    await createFileAndWrite(path.join(process.cwd(), "request-log.json"), JSON.stringify(info, null, 2))

    // Construimos un objeto con todos los códigos de respuesta HTTP
    const payload = {
        responseTypes: Object.entries(http.STATUS_CODES).map(([code, message]) => {
            return { code, message }
        })
    }

    // Indicamos que respondemos correctamente y en JSON
    res.writeHead(200, {
        "Content-Type": "application/json"
    })

    // Enviamos la respuesta
    res.end(JSON.stringify(payload))
})

// Levantamos el servidor
server.listen(3000, "127.0.0.1", () => {
    console.log("Listening on http://127.0.0.1:3000")
})
