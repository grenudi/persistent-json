const fs = require("fs");
const {encode, decode} = require("serialize-json");

const syncInitGlobal = function(name,data){
    if(!global[name]){
        global[name] = data;
    }
    return global[name];
}

let obj = syncInitGlobal("objobj",{test: 1});
let obj2 = syncInitGlobal("objobj",{});


// console.log("obj: ",obj.test);
// obj2.test = 2;
// console.log("obj2: ",obj.test);

// fs.writeFileSync(__dirname+"\\testFile", encode({}));
console.log(decode(fs.readFileSync(__dirname+"/testFile")));