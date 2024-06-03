const net = require("net");
const fs = require("fs");
const zlib = require("zlib");
console.log("Logs from your program will appear here!");

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString();
    //Extract URL from the request
    const path = data.toString().split(" ")[1];
    const fileName = path.split("/echo/")[1];
    if (path.startsWith("/echo")) {
      //HTTP Compression
      if (request.split("\r\n")[2].startsWith("Accept-Encoding: ")) {
        const compressionScheme = request
          .split("\r\n")[2]
          .split("Accept-Encoding: ")[1];
        if (compressionScheme.includes("gzip")) {
          const gzipEncodedData = zlib.gzipSync(fileName);
          socket.write(
            `HTTP/1.1 200 OK\r\nContent-Encoding: gzip\r\nContent-Type: text/plain\r\nContent-Length: ${gzipEncodedData.length}\r\n\r\n`,
          );
          socket.write(gzipEncodedData);
        } else {
          socket.write(
            `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 3\r\n\r\nbar`,
          );
        }
      } else {
        socket.write(
          `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${fileName.length}\r\n\r\n${fileName}`,
        );
      }
    }

    //Extract User Agent from the request
    else if (path.startsWith("/user-agent")) {
      userAgent = request.split("\r\n")[2].split("User-Agent: ")[1];
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`,
      );
    }

    //Post a file with the content as request body
    else if (request.split(" ")[0].startsWith("P")) {
      const directory = process.argv[3];
      const fileName = path.split("/files/")[1].toString();
      const requestBody = request.split("\r\n\r\n")[1];
      const fileContent = requestBody.toString();
      fs.writeFileSync(`${directory}/${fileName}`, fileContent, "utf-8");
      socket.write("HTTP/1.1 201 Created\r\n\r\n");
    }

    //Get a file with the specified url
    else if (path.startsWith("/files")) {
      const directory = process.argv[3];
      const fileName = path.split("/files/")[1];
      if (fs.existsSync(`${directory}/${fileName}`)) {
        const fileContent = fs
          .readFileSync(`${directory}/${fileName}`)
          .toString();
        socket.write(
          `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileContent.length}\r\n\r\n${fileContent}\r\n`,
        );
      } else {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      }
    } else {
      const responseStatus = path.startsWith("/") ? "200 OK" : "404 Not Found";
      socket.write(`HTTP/1.1 ${responseStatus}\r\n\r\n`);
    }
    socket.end();
  });
  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");
