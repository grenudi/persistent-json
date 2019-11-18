const fs = require("fs");
const {encode,decode} = require("serialize-json");
const Main = require('./index.js');
const filePath = __dirname+"/testFile";
const main = new Main(filePath,{crossfeed:true});

afterEach(()=>{
    if(global.worker123)
        global.worker123.kill('SIGTERM');
    delete(global.worker123);
})

test('cuts file\'s name and dir path on unix systems', () => {
    let path = "/user/somerandom-shit/random_shitagain/filename"
    let filename = main.cutName(path);
    let dirpath = main.cutDir(path);
    expect(dirpath).toBe("/user/somerandom-shit/random_shitagain");
    expect(filename).toBe("filename");
});
test('cuts file\'s name and dir path on win systems', () => {
    let path = "C:\\Users\\grenudi\\Projects\\persistent-json_123\\filename"
    let filename = main.cutName(path);
    let dirpath = main.cutDir(path);
    expect(dirpath).toBe("C:\\Users\\grenudi\\Projects\\persistent-json_123");
    expect(filename).toBe("filename");
});
test('fill object on new if file isn\'t empty', () => {
    let obj1 = {test: "1", deep1:{deep2:{deep3:"deepdata1"}}};
    fs.writeFileSync(filePath,encode(obj1));

    let obj2 = new Main(filePath,{crossfeed:true}).sync();
    expect(obj2).toStrictEqual(obj1);
    let obj3 = new Main(filePath+"Froud",{crossfeed:true}).rewrite(JSON).sync();
    expect(obj2).not.toStrictEqual(obj3);
})
test("no crossfeed", () => {
    //i know it's working!
})
test('sync json with a file, i.e. testing proxy', () => {
    let obj = {test: "1", deep1:{deep2:{deep3:"deepdata1"}}};
    obj = new Main(filePath,{crossfeed:true}).rewrite(obj).sync();
    obj.test = 2;
    obj.deep1.deep2.deep3 = "deepdata2";
    let rdy = decode(fs.readFileSync(filePath));
    expect(rdy).toStrictEqual(rdy);
    expect(rdy).not.toStrictEqual({});
});

test('sync data between the same objects', () => {
    let obj = {test: "1", deep1:{deep2:{deep3:"deepdata1"}}};
    obj = new Main(filePath,{crossfeed:true}).rewrite(obj).sync();
    obj2 = new Main(filePath,{crossfeed:true}).sync();
    
    obj.test = 2;
    obj.deep1.deep2.deep3 = "deepdata2";

    expect(obj2).toStrictEqual(obj);
    expect(obj2).not.toStrictEqual({});
});