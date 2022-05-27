require('chai').should();
const util = require('../../util/utils');

describe('Test util/util.js', () => {
    describe('#objKeyArray', () => {
        it('the obj {a:1,b:2} should become [a,b]', () => {
            // data
            const obj = { a: 0, b: 1 };
            // run fn
            const array = util.objKeyArray(obj);
            // verify
            array.should.be.a('array');
            array.should.have.lengthOf(2);
            array[0].should.equal('a');
            array[1].should.equal('b');
        });
    });

    describe('#objValueArray', () => {
        it('the obj {a:1,b:2} should become [1,2]', () => {
            // data
            const obj = { a: 0, b: 1 };
            // run fn
            const array = util.objValueArray(obj);
            // verify
            array.should.be.a('array');
            array.should.have.lengthOf(2);
            array[0].should.equal(0);
            array[1].should.equal(1);
        });
    });

    describe('#arrayObjValue', () => {
        it('input [{ a: 10 }, { b: 20 }, { c: 30 }, { d: 40 }], should be [10, 20, 30, 40]', () => {
            // data
            const obj = [{ a: 10 }, { b: 20 }, { c: 30 }, { d: 40 }];
            // run fn
            const array = util.arrayObjValue(obj);
            // verify
            array.should.be.a('array');
            array.should.have.lengthOf(4);
            array[0].should.equal(10);
            array[1].should.equal(20);
            array[2].should.equal(30);
            array[3].should.equal(40);
        });
    });

    describe('#todayDate', () => {
        it("execute fn, the return data form should be like '2000-1-5' ", () => {
            // data
            const year = new Date().getFullYear();
            const month = new Date().getMonth();
            const date = new Date().getDate();
            // run fn
            const todayDate = util.todayDate();
            // verify
            todayDate.should.be.a('string');
            todayDate.should.equal(`${year}-${month}-${date}`);
        });
    });

    describe('#todayDate', () => {
        it("test date equal to today's year, month and date", () => {
            // data
            const year = new Date().getFullYear();
            const month = new Date().getMonth();
            const date = new Date().getDate();
            // run fn
            const todayDate = util.todayDate();
            // verify
            todayDate.should.be.a('string');
            todayDate.should.equal(`${year}-${month}-${date}`);
        });
    });

    describe('#getNow', () => {
        it("compare return obj's property 'date' equal to current date", () => {
            // data
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const date = now.getDate();
            // run fn
            const todayDate = util.getNow()['date'];
            // verify
            todayDate.should.be.a('string');
            todayDate.should.equal(`${year}-${month}-${date}`);
        });
        it("compare return obj's property 'time' equal to current time", () => {
            // data
            const now = new Date();
            const hour = now.getHours();
            const min = now.getMinutes();
            const sec = now.getSeconds();
            // run fn
            const todayDate = util.getNow()['time'];
            // verify
            todayDate.should.be.a('string');
            todayDate.should.equal(`${hour}:${min}:${sec}`);
        });
        it("compare return obj's property 'day' equal to current day", () => {
            // data
            const now = new Date();
            const day = now.getDay();
            // run fn
            const todayDate = util.getNow()['day'];
            // verify
            todayDate.should.be.a('number');
            todayDate.should.equal(day);
        });
    });
});
