const fs = require("fs");

let que = [];

process.on('message', (msg) => {
    switch(msg.cmd){
        case "write":
            que.push(msg.data);
        break;
    }
    console.log('Message from parent:', msg);
});
