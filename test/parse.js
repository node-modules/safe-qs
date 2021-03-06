'use strict';

/* eslint no-extend-native:0 */
// Load modules

const Code = require('code');
const Lab = require('lab');
const Qs = require('../');


// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const expect = Code.expect;
const describe = lab.experiment;
const it = lab.test;


describe('parse()', () => {

    it('parses a simple string', (done) => {

        expect(Qs.parse('0=foo')).to.deep.equal({ '0': 'foo' });
        expect(Qs.parse('foo=c++')).to.deep.equal({ foo: 'c  ' });
        expect(Qs.parse('a[>=]=23')).to.deep.equal({ a: { '>=': '23' } });
        expect(Qs.parse('a[<=>]==23')).to.deep.equal({ a: { '<=>': '=23' } });
        expect(Qs.parse('a[==]=23')).to.deep.equal({ a: { '==': '23' } });
        expect(Qs.parse('foo', { strictNullHandling: true })).to.deep.equal({ foo: null });
        expect(Qs.parse('foo')).to.deep.equal({ foo: '' });
        expect(Qs.parse('foo=')).to.deep.equal({ foo: '' });
        expect(Qs.parse('foo=bar')).to.deep.equal({ foo: 'bar' });
        expect(Qs.parse(' foo = bar = baz ')).to.deep.equal({ ' foo ': ' bar = baz ' });
        expect(Qs.parse('foo=bar=baz')).to.deep.equal({ foo: 'bar=baz' });
        expect(Qs.parse('foo=bar&bar=baz')).to.deep.equal({ foo: 'bar', bar: 'baz' });
        expect(Qs.parse('foo2=bar2&baz2=')).to.deep.equal({ foo2: 'bar2', baz2: '' });
        expect(Qs.parse('foo=bar&baz', { strictNullHandling: true })).to.deep.equal({ foo: 'bar', baz: null });
        expect(Qs.parse('foo=bar&baz')).to.deep.equal({ foo: 'bar', baz: '' });
        expect(Qs.parse('cht=p3&chd=t:60,40&chs=250x100&chl=Hello|World')).to.deep.equal({
            cht: 'p3',
            chd: 't:60,40',
            chs: '250x100',
            chl: 'Hello|World'
        });
        done();
    });

    it('allows enabling dot notation', (done) => {

        expect(Qs.parse('a.b=c')).to.deep.equal({ 'a.b': 'c' });
        expect(Qs.parse('a.b=c', { allowDots: true })).to.deep.equal({ a: { b: 'c' } });
        done();
    });

    it('parses a single nested string', (done) => {

        expect(Qs.parse('a[b]=c')).to.deep.equal({ a: { b: 'c' } });
        done();
    });

    it('parses a double nested string', (done) => {

        expect(Qs.parse('a[b][c]=d')).to.deep.equal({ a: { b: { c: 'd' } } });
        done();
    });

    it('defaults to a depth of 5', (done) => {

        expect(Qs.parse('a[b][c][d][e][f][g][h]=i')).to.deep.equal({ a: { b: { c: { d: { e: { f: { '[g][h]': 'i' } } } } } } });
        done();
    });

    it('only parses one level when depth = 1', (done) => {

        expect(Qs.parse('a[b][c]=d', { depth: 1 })).to.deep.equal({ a: { b: { '[c]': 'd' } } });
        expect(Qs.parse('a[b][c][d]=e', { depth: 1 })).to.deep.equal({ a: { b: { '[c][d]': 'e' } } });
        done();
    });

    it('parses a simple array', (done) => {

        expect(Qs.parse('a=b&a=c')).to.deep.equal({ a: ['b', 'c'] });
        done();
    });

    it('parses an explicit array', (done) => {

        expect(Qs.parse('a[]=b')).to.deep.equal({ a: ['b'] });
        expect(Qs.parse('a[]=b&a[]=c')).to.deep.equal({ a: ['b', 'c'] });
        expect(Qs.parse('a[]=b&a[]=c&a[]=d')).to.deep.equal({ a: ['b', 'c', 'd'] });
        done();
    });

    it('parses a mix of simple and explicit arrays', (done) => {

        expect(Qs.parse('a=b&a[]=c')).to.deep.equal({ a: ['b', 'c'] });
        expect(Qs.parse('a[]=b&a=c')).to.deep.equal({ a: ['b', 'c'] });
        expect(Qs.parse('a[0]=b&a=c')).to.deep.equal({ a: ['b', 'c'] });
        expect(Qs.parse('a=b&a[0]=c')).to.deep.equal({ a: ['b', 'c'] });
        expect(Qs.parse('a[1]=b&a=c')).to.deep.equal({ a: ['b', 'c'] });
        expect(Qs.parse('a=b&a[1]=c')).to.deep.equal({ a: ['b', 'c'] });
        done();
    });

    it('parses a nested array', (done) => {

        expect(Qs.parse('a[b][]=c&a[b][]=d')).to.deep.equal({ a: { b: ['c', 'd'] } });
        expect(Qs.parse('a[>=]=25')).to.deep.equal({ a: { '>=': '25' } });
        done();
    });

    it('allows to specify array indices', (done) => {

        expect(Qs.parse('a[1]=c&a[0]=b&a[2]=d')).to.deep.equal({ a: ['b', 'c', 'd'] });
        expect(Qs.parse('a[1]=c&a[0]=b')).to.deep.equal({ a: ['b', 'c'] });
        expect(Qs.parse('a[1]=c')).to.deep.equal({ a: ['c'] });
        done();
    });

    it('limits specific array indices to 20', (done) => {

        expect(Qs.parse('a[20]=a')).to.deep.equal({ a: ['a'] });

        const _throws = () => {

            Qs.parse('a[21]=a');
        };

        expect(_throws).to.throw('Index of array [21] is overstep limit: 20');
        done();
    });

    it('supports keys that begin with a number', (done) => {

        expect(Qs.parse('a[12b]=c')).to.deep.equal({ a: { '12b': 'c' } });
        done();
    });

    it('supports encoded = signs', (done) => {

        expect(Qs.parse('he%3Dllo=th%3Dere')).to.deep.equal({ 'he=llo': 'th=ere' });
        done();
    });

    it('is ok with url encoded strings', (done) => {

        expect(Qs.parse('a[b%20c]=d')).to.deep.equal({ a: { 'b c': 'd' } });
        expect(Qs.parse('a[b]=c%20d')).to.deep.equal({ a: { b: 'c d' } });
        done();
    });

    it('allows brackets in the value', (done) => {

        expect(Qs.parse('pets=["tobi"]')).to.deep.equal({ pets: '["tobi"]' });
        expect(Qs.parse('operators=[">=", "<="]')).to.deep.equal({ operators: '[">=", "<="]' });
        done();
    });

    it('allows empty values', (done) => {

        expect(Qs.parse('')).to.deep.equal({});
        expect(Qs.parse(null)).to.deep.equal({});
        expect(Qs.parse(undefined)).to.deep.equal({});
        done();
    });

    it('transforms arrays to objects', (done) => {

        expect(Qs.parse('foo[0]=bar&foo[bad]=baz')).to.deep.equal({ foo: { '0': 'bar', bad: 'baz' } });
        expect(Qs.parse('foo[bad]=baz&foo[0]=bar')).to.deep.equal({ foo: { bad: 'baz', '0': 'bar' } });
        expect(Qs.parse('foo[bad]=baz&foo[]=bar')).to.deep.equal({ foo: { bad: 'baz', '0': 'bar' } });
        expect(Qs.parse('foo[]=bar&foo[bad]=baz')).to.deep.equal({ foo: { '0': 'bar', bad: 'baz' } });
        expect(Qs.parse('foo[bad]=baz&foo[]=bar&foo[]=foo')).to.deep.equal({ foo: { bad: 'baz', '0': 'bar', '1': 'foo' } });
        expect(Qs.parse('foo[0][a]=a&foo[0][b]=b&foo[1][a]=aa&foo[1][b]=bb')).to.deep.equal({ foo: [{ a: 'a', b: 'b' }, { a: 'aa', b: 'bb' }] });
        expect(Qs.parse('a[]=b&a[t]=u&a[hasOwnProperty]=c')).to.deep.equal({ a: { '0': 'b', t: 'u', c: true } });
        expect(Qs.parse('a[]=b&a[hasOwnProperty]=c&a[x]=y')).to.deep.equal({ a: { '0': 'b', '1': 'c', x: 'y' } });
        done();
    });

    it('transforms arrays to objects (dot notation)', (done) => {

        expect(Qs.parse('foo[0].baz=bar&fool.bad=baz', { allowDots: true })).to.deep.equal({ foo: [{ baz: 'bar' }], fool: { bad: 'baz' } });
        expect(Qs.parse('foo[0].baz=bar&fool.bad.boo=baz', { allowDots: true })).to.deep.equal({ foo: [{ baz: 'bar' }], fool: { bad: { boo: 'baz' } } });
        expect(Qs.parse('foo[0][0].baz=bar&fool.bad=baz', { allowDots: true })).to.deep.equal({ foo: [[{ baz: 'bar' }]], fool: { bad: 'baz' } });
        expect(Qs.parse('foo[0].baz[0]=15&foo[0].bar=2', { allowDots: true })).to.deep.equal({ foo: [{ baz: ['15'], bar: '2' }] });
        expect(Qs.parse('foo[0].baz[0]=15&foo[0].baz[1]=16&foo[0].bar=2', { allowDots: true })).to.deep.equal({ foo: [{ baz: ['15', '16'], bar: '2' }] });
        expect(Qs.parse('foo.bad=baz&foo[0]=bar', { allowDots: true })).to.deep.equal({ foo: { bad: 'baz', '0': 'bar' } });
        expect(Qs.parse('foo.bad=baz&foo[]=bar', { allowDots: true })).to.deep.equal({ foo: { bad: 'baz', '0': 'bar' } });
        expect(Qs.parse('foo[]=bar&foo.bad=baz', { allowDots: true })).to.deep.equal({ foo: { '0': 'bar', bad: 'baz' } });
        expect(Qs.parse('foo.bad=baz&foo[]=bar&foo[]=foo', { allowDots: true })).to.deep.equal({ foo: { bad: 'baz', '0': 'bar', '1': 'foo' } });
        expect(Qs.parse('foo[0].a=a&foo[0].b=b&foo[1].a=aa&foo[1].b=bb', { allowDots: true })).to.deep.equal({ foo: [{ a: 'a', b: 'b' }, { a: 'aa', b: 'bb' }] });
        done();
    });

    it('can add keys to objects', (done) => {

        expect(Qs.parse('a[b]=c&a=d')).to.deep.equal({ a: { b: 'c', d: true } });
        done();
    });

    it('supports malformed uri characters', (done) => {

        expect(Qs.parse('{%:%}', { strictNullHandling: true })).to.deep.equal({ '{%:%}': null });
        expect(Qs.parse('{%:%}=')).to.deep.equal({ '{%:%}': '' });
        expect(Qs.parse('foo=%:%}')).to.deep.equal({ foo: '%:%}' });
        done();
    });

    it('doesn\'t produce empty keys', (done) => {

        expect(Qs.parse('_r=1&')).to.deep.equal({ '_r': '1' });
        done();
    });

    it('cannot access Object prototype', (done) => {

        Qs.parse('constructor[prototype][bad]=bad');
        Qs.parse('bad[constructor][prototype][bad]=bad');
        expect(typeof Object.prototype.bad).to.equal('undefined');
        done();
    });

    it('parses arrays of objects', (done) => {

        expect(Qs.parse('a[][b]=c')).to.deep.equal({ a: [{ b: 'c' }] });
        expect(Qs.parse('a[0][b]=c')).to.deep.equal({ a: [{ b: 'c' }] });
        done();
    });

    it('allows for empty strings in arrays', (done) => {

        expect(Qs.parse('a[]=b&a[]=&a[]=c')).to.deep.equal({ a: ['b', '', 'c'] });
        expect(Qs.parse('a[0]=b&a[1]&a[2]=c&a[19]=', { strictNullHandling: true })).to.deep.equal({ a: ['b', null, 'c', ''] });
        expect(Qs.parse('a[0]=b&a[1]=&a[2]=c&a[19]', { strictNullHandling: true })).to.deep.equal({ a: ['b', '', 'c', null] });
        expect(Qs.parse('a[]=&a[]=b&a[]=c')).to.deep.equal({ a: ['', 'b', 'c'] });
        done();
    });

    it('compacts sparse arrays', (done) => {

        expect(Qs.parse('a[10]=1&a[2]=2')).to.deep.equal({ a: ['2', '1'] });
        done();
    });

    it('parses semi-parsed strings', (done) => {

        expect(Qs.parse({ 'a[b]': 'c' })).to.deep.equal({ a: { b: 'c' } });
        expect(Qs.parse({ 'a[b]': 'c', 'a[d]': 'e' })).to.deep.equal({ a: { b: 'c', d: 'e' } });
        done();
    });

    it('parses buffers correctly', (done) => {

        const b = new Buffer('test');
        expect(Qs.parse({ a: b })).to.deep.equal({ a: b });
        done();
    });

    it('continues parsing when no parent is found', (done) => {

        expect(Qs.parse('[]=&a=b')).to.deep.equal({ '0': '', a: 'b' });
        expect(Qs.parse('[]&a=b', { strictNullHandling: true })).to.deep.equal({ '0': null, a: 'b' });
        expect(Qs.parse('[foo]=bar')).to.deep.equal({ foo: 'bar' });
        done();
    });

    it('does not error when parsing a very long array', (done) => {

        let str = 'a[]=a';
        while (Buffer.byteLength(str) < 128 * 1024) {
            str = str + '&' + str;
        }

        expect(() => {

            Qs.parse(str);
        }).to.not.throw();

        done();
    });

    it('should not throw when a native prototype has an enumerable property', { parallel: false }, (done) => {

        Object.prototype.crash = '';
        Array.prototype.crash = '';
        expect(Qs.parse.bind(null, 'a=b')).to.not.throw();
        expect(Qs.parse('a=b')).to.deep.equal({ a: 'b' });
        expect(Qs.parse.bind(null, 'a[][b]=c')).to.not.throw();
        expect(Qs.parse('a[][b]=c')).to.deep.equal({ a: [{ b: 'c' }] });
        delete Object.prototype.crash;
        delete Array.prototype.crash;
        done();
    });

    it('parses a string with an alternative string delimiter', (done) => {

        expect(Qs.parse('a=b;c=d', { delimiter: ';' })).to.deep.equal({ a: 'b', c: 'd' });
        done();
    });

    it('parses a string with an alternative RegExp delimiter', (done) => {

        expect(Qs.parse('a=b; c=d', { delimiter: /[;,] */ })).to.deep.equal({ a: 'b', c: 'd' });
        done();
    });

    it('does not use non-splittable objects as delimiters', (done) => {

        expect(Qs.parse('a=b&c=d', { delimiter: true })).to.deep.equal({ a: 'b', c: 'd' });
        done();
    });

    it('allows overriding parameter limit', (done) => {

        expect(Qs.parse('a=b&c=d', { parameterLimit: 1 })).to.deep.equal({ a: 'b' });
        done();
    });

    it('allows setting the parameter limit to Infinity', (done) => {

        expect(Qs.parse('a=b&c=d', { parameterLimit: Infinity })).to.deep.equal({ a: 'b', c: 'd' });
        done();
    });

    it('allows overriding array limit', (done) => {

        // expect(Qs.parse('a[0]=b', { arrayLimit: -1 })).to.deep.equal({ a: { '0': 'b' } });
        expect(Qs.parse('a[-1]=b', { arrayLimit: -1 })).to.deep.equal({ a: { '-1': 'b' } });
        // expect(Qs.parse('a[0]=b&a[1]=c', { arrayLimit: 0 })).to.deep.equal({ a: { '0': 'b', '1': 'c' } });
        done();
    });

    it('allows disabling array parsing', (done) => {

        expect(Qs.parse('a[0]=b&a[1]=c', { parseArrays: false })).to.deep.equal({ a: { '0': 'b', '1': 'c' } });
        done();
    });

    it('parses an object', (done) => {

        const input = {
            'user[name]': { 'pop[bob]': 3 },
            'user[email]': null
        };

        const expected = {
            'user': {
                'name': { 'pop[bob]': 3 },
                'email': null
            }
        };

        const result = Qs.parse(input);

        expect(result).to.deep.equal(expected);
        done();
    });

    it('parses an object in dot notation', (done) => {

        const input = {
            'user.name': { 'pop[bob]': 3 },
            'user.email.': null
        };

        const expected = {
            'user': {
                'name': { 'pop[bob]': 3 },
                'email': null
            }
        };

        const result = Qs.parse(input, { allowDots: true });

        expect(result).to.deep.equal(expected);
        done();
    });

    it('parses an object and not child values', (done) => {

        const input = {
            'user[name]': { 'pop[bob]': { 'test': 3 } },
            'user[email]': null
        };

        const expected = {
            'user': {
                'name': { 'pop[bob]': { 'test': 3 } },
                'email': null
            }
        };

        const result = Qs.parse(input);

        expect(result).to.deep.equal(expected);
        done();
    });

    it('does not blow up when Buffer global is missing', (done) => {

        const tempBuffer = global.Buffer;
        delete global.Buffer;
        const result = Qs.parse('a=b&c=d');
        global.Buffer = tempBuffer;
        expect(result).to.deep.equal({ a: 'b', c: 'd' });
        done();
    });

    it('does not crash when parsing circular references', (done) => {

        const a = {};
        a.b = a;

        let parsed;

        expect(() => {

            parsed = Qs.parse({ 'foo[bar]': 'baz', 'foo[baz]': a });
        }).to.not.throw();

        expect(parsed).to.contain('foo');
        expect(parsed.foo).to.contain('bar', 'baz');
        expect(parsed.foo.bar).to.equal('baz');
        expect(parsed.foo.baz).to.deep.equal(a);
        done();
    });

    it('parses plain objects correctly', (done) => {

        const a = Object.create(null);
        a.b = 'c';

        expect(Qs.parse(a)).to.deep.equal({ b: 'c' });
        const result = Qs.parse({ a: a });
        expect(result).to.contain('a');
        expect(result.a).to.deep.equal(a);
        done();
    });

    it('parses dates correctly', (done) => {

        const now = new Date();
        expect(Qs.parse({ a: now })).to.deep.equal({ a: now });
        done();
    });

    it('parses regular expressions correctly', (done) => {

        const re = /^test$/;
        expect(Qs.parse({ a: re })).to.deep.equal({ a: re });
        done();
    });

    it('can allow overwriting prototype properties', (done) => {

        expect(Qs.parse('a[hasOwnProperty]=b', { allowPrototypes: true })).to.deep.equal({ a: { hasOwnProperty: 'b' } }, { prototype: false });
        expect(Qs.parse('hasOwnProperty=b', { allowPrototypes: true })).to.deep.equal({ hasOwnProperty: 'b' }, { prototype: false });
        done();
    });

    it('can return plain objects', (done) => {

        const expected = Object.create(null);
        expected.a = Object.create(null);
        expected.a.b = 'c';
        expected.a.hasOwnProperty = 'd';
        expect(Qs.parse('a[b]=c&a[hasOwnProperty]=d', { plainObjects: true })).to.deep.equal(expected);
        expect(Qs.parse(null, { plainObjects: true })).to.deep.equal(Object.create(null));
        const expectedArray = Object.create(null);
        expectedArray.a = Object.create(null);
        expectedArray.a['0'] = 'b';
        expectedArray.a.c = 'd';
        expect(Qs.parse('a[]=b&a[c]=d', { plainObjects: true })).to.deep.equal(expectedArray);
        done();
    });
});
