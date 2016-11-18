import test from "ava"
import expect from 'expect.js'
import {Url} from '../'

test('Url.parse & Url.stringify', () => {
    let item, val, orig;
    item = "https://username:password@www.test.com:8080/path/index.html?this=that&some=thing#content";
    expect(val = Url.parse(item)).to.eql({ 
        anchor: 'content',
        query: 'this=that&some=thing',
        file: 'index.html',
        directory: '/path/',
        path: '/path/index.html',
        relative: '/path/index.html?this=that&some=thing#content',
        port: '8080',
        host: 'www.test.com',
        password: 'password',
        user: 'username',
        userInfo: 'username:password',
        authority: 'username:password@www.test.com:8080',
        protocol: 'https',
        source: 'https://username:password@www.test.com:8080/path/index.html?this=that&some=thing#content'
    });
    expect(Url.stringify(val)).to.be(item);
    
    item = '';
    expect(val = Url.parse(item)).to.eql(orig = {
        anchor: '',
        query: '',
        file: '',
        directory: '',
        path: '',
        relative: '',
        port: '',
        host: '',
        password: '',
        user: '',
        userInfo: '',
        authority: '',
        protocol: '',
        source: ''
    });
    expect(Url.stringify(val)).to.be(item);
    
    orig.protocol = 'http';
        expect(Url.stringify(orig)).to.be(item);
    
    orig.protocol = '';
    orig.host='www.google.com';
        expect(Url.stringify(orig)).to.be(item = '//www.google.com');
        val = Url.parse(item);
        expect(val.authority).to.eql(orig.host); val.authority = '';
        expect(val.source).to.eql(item); val.source = '';
        expect(val).to.eql(orig);
    
    orig.protocol = 'https';
        expect(Url.stringify(orig)).to.be(item = 'https://www.google.com');
        val = Url.parse(item);
        expect(val.authority).to.eql(orig.host); val.authority = '';
        expect(val.source).to.eql(item); val.source = '';
        expect(val).to.eql(orig);
    
    orig.user = 'jetiny';
    orig.password = 'password';
        orig.userInfo = 'jetiny:password';
        orig.authority = 'jetiny:password@www.google.com';
        orig.source = 'https://jetiny:password@www.google.com';
        expect(item = Url.stringify(orig)).to.be(orig.source);
        expect(Url.parse(item)).to.eql(orig);
    
    orig.port = '80';
        orig.authority += ':80';
        orig.source = 'https://jetiny:password@www.google.com:80';
        expect(item = Url.stringify(orig)).to.be(orig.source);
        expect(Url.parse(item)).to.eql(orig);
    
    orig.path = '/';
        orig.directory = '/';
        orig.relative = '/';
        orig.source = 'https://jetiny:password@www.google.com:80/';
        expect(item = Url.stringify(orig)).to.be(orig.source);
        expect(Url.parse(item)).to.eql(orig);
    
    orig.path = '/index.html';
        orig.file = 'index.html';
        orig.relative = orig.directory + orig.file;
        orig.source = 'https://jetiny:password@www.google.com:80/index.html';
        expect(item = Url.stringify(orig)).to.be(orig.source);
        expect(Url.parse(item)).to.eql(orig);
    
    orig.query = 'a=b';
        orig.relative = orig.directory + orig.file + '?' + orig.query ;
        orig.source = 'https://jetiny:password@www.google.com:80/index.html?a=b';
        expect(item = Url.stringify(orig)).to.be(orig.source);
        expect(Url.parse(item)).to.eql(orig);
    
    orig.anchor = 'c';
        orig.relative = orig.directory + orig.file + '?' + orig.query +'#' + orig.anchor;
        orig.source = 'https://jetiny:password@www.google.com:80/index.html?a=b#c';
        expect(item = Url.stringify(orig)).to.be(orig.source);
        expect(Url.parse(item)).to.eql(orig);
    
})