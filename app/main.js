const net = require("net");
const fs = require("fs")
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
 const server = net.createServer((socket) => {
    socket.on("data",(data) =>{
       const request = data.toString()
       const path = data.toString().split(" ")[1];
       if (path.startsWith('/echo')){
        const content = path.split('/echo/')[1];
        socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${content.length}\r\n\r\n${content}`);
       }
       else if(path.startsWith('/user-agent')){
        userAgent = request.split("\r\n")[2].split("User-Agent: ")[1];
        socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`)
       }
       else if(request.split(" ")[0].startsWith('P')){
        const directory = path.split("/files")[0]
        const fileName = path.split("/files/")[1];
        const requestBody = request.split('\r\n\r\n')[1];
        const fileContent = requestBody.toString();
        fs.mkdirSync((`${directory}/${fileName}`),(error)=>{
            if(error){
                console.log("error")
            }
            else{
                console.log("Directory successfully created")
            }
        });
        fs.writeFileSync(`${directory}/${fileName}`, fileContent,"utf-8");
        socket.write("HTTP/1.1 201 OK\r\n\r\n")

      }
       else if(path.startsWith('/files')){ 
         const directory = process.argv[3]
         const fileName = path.split("/files/")[1];
            if(fs.existsSync(`${directory}/${fileName}`)){
            const fileContent = fs.readFileSync(`${directory}/${fileName}`).toString();
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileContent.length}\r\n\r\n${fileContent}\r\n`); 
            }
            else{ 
                socket.write("HTTP/1.1 404 Not Found\r\n\r\n"); 
            }    
       }
       else {
       const responseStatus = path === "/" ? "200 OK" : "404 Not Found";
       socket.write(`HTTP/1.1 ${responseStatus}\r\n\r\n`);
       }
       socket.end()
      

    });
    socket.on("close", () => {
    socket.end();
    //server.close();
   });
 });

 server.listen(4221, "localhost");

