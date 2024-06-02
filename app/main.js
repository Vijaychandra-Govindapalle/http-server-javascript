const net = require("net");
const fs = require("fs");
const path = require("path");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const request = data.toString();
        const requestLine = request.split("\r\n")[0];
        const requestPath = requestLine.split(" ");

        if (requestPath.startsWith('/echo/')) {
            const content = requestPath.split('/echo/')[1];
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${content.length}\r\n\r\n${content}`);
        } else if (requestPath.startsWith('/user-agent')) {
            const userAgentLine = request.split("\r\n").find(line => line.startsWith("User-Agent:"));
            if (userAgentLine) {
                const userAgent = userAgentLine.split("User-Agent: ")[1];
                socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`);
            } else {
                socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
            }
        } else if (requestPath.startsWith('/files/')) {
            const directory = process.argv[3];
            const fileName = requestPath.split("/files/")[1];
            const fullFilePath = path.join(directory, fileName);

            if (fs.existsSync(fullFilePath)) {
                const fileContent = fs.readFileSync(fullFilePath);
                socket.write(`HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileContent.length}\r\n\r\n`);
                socket.write(fileContent);
            } else {
                socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
            }
        } else {
            const responseStatus = requestPath === "/" ? "200 OK" : "404 Not Found";
            socket.write(`HTTP/1.1 ${responseStatus}\r\n\r\n`);
        }

        socket.end();
    });

    socket.on("error", (err) => {
        console.error('Socket error:', err);
    });

    socket.on("end", () => {
        console.log('Client disconnected');
    });
});

server.listen(4221, "localhost", () => {
    console.log('Server listening on port 4221');
});
