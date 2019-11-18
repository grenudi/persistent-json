//export object with constructor
//1 take path to directory in constructor , return proxy of json file
//if file exists fill proxy with it's contents

/*
MANAGE efficiency:
- add key -> file remove line , add line 
- edit key -> rewrite file
- remove key - rewrite file
*/

//rewrite the whole thing on file streams
const fs = require("fs");
const {fork} = require("child_process");
const {encode, decode} = require("serialize-json");
JSON.encode = encode; JSON.decode = decode;

//write through worker
//read is sync in main
const syncInitGlobal = function(name,data){
    if(!global[name]){
        global[name] = data;
    }
    return global[name];
}

const main = function(filePath, options={}){
    let dir = this.cutDir(filePath);
    let file = this.cutName(filePath);

    let original;
    let proxy;

    let worker;

    worker = syncInitGlobal("worker123",'fork("worker.js")');
    original = syncInitGlobal(filePath, {});
    proxy = syncInitGlobal(filePath+"proxy", {});

    try{
        original = JSON.decode(fs.readFileSync(filePath, 'utf8'));
    }catch(err){
        console.error("FAILED TO READ: \n"+err);
        original = {};
        fs.writeFileSync(filePath,JSON.encode(original));
    }

    function updateFromFile(eventType, filename){
        switch(eventType){
            case 'rename': 
            break;
            case 'change': 
                original = JSON.parse(fs.readFileSync(path, 'utf8'));
            break;
        }
    }

    if(options.watch){
        watcher = watch(path, updateFromFile);
    }

    function handler(){}

    proxy = new Proxy(original, handler);

    this.rewrite = function(obj){
        original = obj;
        proxy = new Proxy(original, handler);
        this.write(filePath, obj);
        return this;
    }
    this.sync = function(){
        return proxy;
    }
}
main.prototype.write = function(path,obj){
    fs.writeFileSync(path, JSON.encode(obj));
}
main.prototype.isJson = function(path){
    
}
main.prototype.watch = function(path,cb){
    return fs.watch(path,{persistent: false}, cb);
}
main.prototype.cutName = function(path){
    const unix =  path.split("/");
    const win = path.split("\\");
    return win.length > 1 ? win[win.length-1] : unix[unix.length-1]
}
main.prototype.cutDir = function(path){
    const unix =  path.split("/");
    const win = path.split("\\");
    return win.length > 1 ? path.replace("\\"+win[win.length-1],"") : path.replace("/"+unix[unix.length-1],"");
}

module.exports = main;

