const Main = require('./index.js');
const filePath = __dirname+"/testFile";
const main = new Main(filePath);

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
    let obj = {test: "1", deep1:{deep2:{deep3:"deepdata1"}}};
    obj1 = new Main(filePath).init(obj).sync();

    let obj2 = new Main(filePath).sync();
    expect(obj2).toStrictEqual(obj1);
    let obj3 = new Main(filePath+"Froud").rewrite(JSON).sync();
    expect(obj2).not.toStrictEqual(obj3);
})
test('sync json with a file, i.e. testing proxy', () => {
    let obj = {test: "1", deep1:{deep2:{deep3:"deepdata1"}}};
    obj = new Main(__dirname+"/testFile.json").rewrite(obj).sync();
    obj.test = 2;
    obj.deep1.deep2.deep3 = "deepdata2";

    expect(filename).toBe("filename");
});