var fs = require('fs'),
    http = require("http"),
    path = require("path"),
    querystring = require("querystring"),
    spawnSync = require('child_process').spawnSync,
    execSync = require('child_process').execSync,
    email_suffix = "@staff.sina.com.cn"
try {
    var email = execSync('git config user.email', { encoding: 'utf-8' })
    var username = execSync('git config user.name', { encoding: 'utf-8' })
    var remote = execSync('echo $GIT_PARAMS', { encoding: 'utf-8' })
    var url = remote.split(" ")[1];
    var remote = remote.split(" ")[0];
    var post_options = {
        host: 'exp.smfe.sina.cn',
        path: '/service/uploadTree',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
    };
    var treedata = "";
    var p = path.resolve("./dist/dependencyGraph.json");
    if (fs.existsSync(p) == true) {
        treedata = fs.readFileSync(p, 'utf-8');
    } else {
        console.log("marauder环境配置有问题，没有生成结构数据，不能提交git")
        console.log("<====================git 钩子 执行结束 执行出错===========>")
        process.exit(1);
    }
    var post_data = {
        "user": username,
        "email": email,
        "remote": remote,
        "url": url,
        "tree": treedata
    }; //这是需要提交的数据  
    console.log("正在提交依赖关系数据:" + [username, email, remote, url, treedata]);
    var req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {

            console.log('BODY: ' + chunk);
            console.log("<====================git 钩子 执行结束 执行成功===========>")
            process.exit(0);
        });
    });

    req.on('error', function(e) {
        console.log("依赖服务出错")
        console.log("<====================git 钩子 依赖服务出错 ，但是会继续提交到git服务器上，请将出错消息告知依赖服务维护人员，多谢===========>")
        process.exit(0);
    });
    req.write(querystring.stringify(post_data) + "\n");
    req.end();
    var timeout = 5000;
    setTimeout(function() {
        console.log("依赖服务出错")
        console.log("<====================git 钩子 依赖服务请求超时，但是会继续提交到git服务器上，请将出错消息告知依赖服务维护人员，多谢===========>")
        process.exit(0);
    }, 5000);

} catch (e) {
    console.log("git 钩子 push 时出错：" + e)
    console.log("<====================git 钩子 执行结束 执行出错===========>")
    process.exit(1);
}