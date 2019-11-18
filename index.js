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
const {spawn} = require("child_process");
const enc = require("serialize-json").encode;
const dec = require("serialize-json").decode;

//write through worker
//read is sync in main
const syncInitGlobal = function(name,data){
    if(!global[name]){
        global[name] = data;
    }
    return global[name];
}

const main = function(filePath, options={}){

    let encode = options.encode;
    let decode = options.decode;

    if(!(encode? decode : !decode)) { throw Error("no encode or decode option")}

    encode = encode || JSON.stringify ;
    decode = decode || JSON.parse ;

    let main = this;

    this.write = function(data){
        console.warn("WRITING: ",data);
        fs.writeFile(filePath,encode(data),(err)=>{});
        //async write!
        // this.worker.send({cmd:"write", data:{ path:filePath, content: encode(data)}});
        // const child = spawn('node', ['timer.js'], {
        // detached: true,
        // stdio: 'ignore'
        // });

        // child.unref();
    }
    this.proxyHandle = {
        set(obj, prop, value) {
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
    this.rewrite = function(obj){
        global[filePath] = obj;
        Object.assign(global[filePath+"proxy"], new Proxy(global[filePath], this.proxyHandle));
        fs.writeFileSync(filePath,encode(global[filePath]));
        return this;
    }
//LOGIC///////////////////////////
    if(!options.crossfeed && global[filePath]){
        throw Error("this file is already in use by other object, and no crossfeed specified in options");
    }

    if(!global[filePath+"proxy"]){
        try{
            console.warn("READING: "+filePath);
            global[filePath] = decode(fs.readFileSync(filePath));
        }catch(err){
            console.warn("FAILED TO READ: \n"+err);
            global[filePath] = {};
            fs.writeFileSync(encode(global[filePath]));
        }
        global[filePath+"proxy"] = new Proxy(global[filePath], this.proxyHandle);
    } 
//GETTERS////////////////////////
    this.sync = function(){
        return global[filePath];
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

