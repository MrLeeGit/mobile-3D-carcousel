/**
 * 模块的设计：
 * index.html
 * includeModule方法，
 * includeJs方法
 * includeCss方法
 * include方法：
 * includeAt:<% includeAt "1.html" {
 *     
 * }%>
 */


'use strict';
var path = require('path');
var utils = require('./utils');
var log = utils.log;
var fs = require('fs');
var root = "";
exports.setComponentRoot = function(r) {
    root = r;
}
var CONSTVAR = {
    package: 'package.json', //模块描述文件

}

var Component = function(pathStr, cname) {
    this.JsResources = []; //js队列
    this.CssResources = []; //CSS队列
    this.HtmlResources = []; //模板队列
    this.tock = {};
    this.tockName = "tock.json"; //模板虚拟数据，用于展示。。同时用于规范json数据格式


    this.MainTemplate = "index.html"; //主模板
    this.name = cname;
    this.type = ""; //svn,github,npm,phic,
    this.options = {
        root: pathStr,
        path: pathStr,
        parentPath: '',
        realPath: ''
    }
    this.initConfig = function() {

    }
}
Component.prototype = {
    getResource: function(includepath) {
        if (/^(svn|ftp|http(s?)):/.test(includepath) == true) { //有线上资源
            return includepath
        }
        return path.resolve(this.options.root, includepath)
    },
    getTockData: function() {
        if (fs.existsSync(path.resolve(this.options.root, this.tockName))) {
            var JsonObj = JSON.parse(fs.readFileSync(path.resolve(this.options.root, this.tockName)));
            return JsonObj;
        }
        return {};
    },
    getTockDataString: function() {
        if (fs.existsSync(path.resolve(this.options.root, this.tockName))) {
            return fs.readFileSync(path.resolve(this.options.root, this.tockName)).toString();
        }
        return "";
    },
    getMainTemplatePath: function() {

        return path.resolve(this.options.root, this.MainTemplate)
    }
}
Component.prototype.initConfig = function() {

}

var Resource = function(component) {
    this.component = component;
    this.filetype = "html"; //js css html;
    this.realPath = "";
    this.content = ""; //文件流
}
exports.getComponent = function(cname) {
    var compath = path.resolve(root, cname);
    log.debug('找到组件:' + cname + ",路径为:" + compath);
    return new Component(compath, cname);
}
exports.Component = Component;