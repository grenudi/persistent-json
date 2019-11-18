const fs = require("fs");

process.on('message', (msg) => {
    switch(msg.cmd){
        case "write":
            try{
                fs.writeFileSync(msg.data.path, msg.data.content);
            }catch(err){
                process.send({cmd:"error",data:err});
            }
        break;
    }
    console.log('Message from parent:', msg);
});
