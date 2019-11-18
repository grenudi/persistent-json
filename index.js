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

    let main = this;

    this.rewrite = function(obj){
        this.original = obj;
        this.proxy = global[this.path+"proxy"] = new Proxy(this.original, this.proxyHandle);
        this.write(this.original);
        return this;
    }
    this.sync = function(){
        return this.proxy;
    }
    this.write = function(data){
        this.worker.send({cmd:"write", data:{ path:this.path, content: JSON.encode(data)}});
    }
    this.proxyHandle = {
        set(obj, prop, value) {
            console.error("SETTING----------------------");
            main.write();
            Reflect.set(...arguments)
            return true;
        },
        deleteProperty(target, prop) {
            if (prop in target) {
              delete target[prop];
              main.write();
              return true;
            }
            return false;
        },
        defineProperty(target, key, descriptor) {
            target[key] = null;
            main.write();
            return true;
        }
    }

    this.path = filePath;
    this.original = syncInitGlobal(this.path, {});
    this.proxy = syncInitGlobal(this.path+"proxy", new Proxy(this.original, this.proxyHandle));
    this.worker; 

    if(!options.crossfeed && global[this.path]){
        throw Error("this file is already in use by other object, and no crossfeed specified in options");
    }

    if(!global.worker123){
        this.worker = global.worker123 = fork("worker.js");
    }else{
        this.worker = global.worker123;
    }

    try{
        this.original = global[filePath] = JSON.decode(fs.readFileSync(this.path, 'utf8'));
        this.proxy = global[filePath+"proxy"] = new Proxy(this.original, this.proxyHandle);
    }catch(err){
        console.warn("FAILED TO READ: \n"+err);
        this.original = {};
        fs.writeFileSync(this.path,JSON.encode(this.original));
    }

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

