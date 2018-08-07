const request = require("request");

const tif = function(a, b){
    return (typeof a === b);
};

class CPanel {
    constructor(options){
        if(options === undefined || !tif(options, "object") || !tif(options.host, "string") || !tif(options.user, "string") || !tif(options.pass, "string") || !tif(options.https, "boolean") || !tif(options.port, "string"))
            throw new Error("The params option<Object> must be completed with domain<String>, user<String>, pass<String>, https<Boolean>, port<String>");

        this.options = options;
    }

    login(module, func, values = []) {
        const me = this;
        return new Promise(function(resolve, reject) {
            let value = '';
            values.forEach((v) => {
                value += encodeURI('&'+Object.keys(v))+'='+encodeURI(v[Object.keys(v)])
            });

            let call = '/json-api/cpanel?cpanel_jsonapi_user='+me.options.user;
                call += '&cpanel_jsonapi_apiversion=2&cpanel_jsonapi_module='+module;
                call += '&cpanel_jsonapi_func='+func;
                call += value;

            const query = encodeURI((me.options.https ? "https://" : "http://")+me.options.host+':'+me.options.port+call);
            request({
                url: query,
                headers: {
                    "Authorization": "Basic " + Buffer.from(`${me.options.user}:${me.options.pass}`).toString('base64')
                }
            }, function (err, head, body) {
                if (err) return reject(err);
                return resolve({ response: body, header: head });
            })
        });
    };

    emailAddpop(options){
        const me = this;
        return new Promise(function(resolve, reject) {
            if(!tif(options, "object") || !tif(options.host, "string") || !tif(options.email, "string") || !tif(options.password, "string") || !tif(options.quota, "number"))
                return reject(new Error("The params options<Object> must be completed with domain<String>, email<String>, password<String>, quota<Number>"));

            me.login('Email', 'addpop', [{ domain: options.host },{ email: options.email },{ password: options.password }, { quota: options.quota }]).then(function(obj) {
                return resolve(obj);
            }, function(err) {
                return reject(err);
            });
        });
    };

    emailDelpop(options){
        const me = this;
        return new Promise(function(resolve, reject) {
            if(!tif(options, "object") || !tif(options.email, "string") || !tif(options.host, "string"))
                throw new Error("The params options<Object> must be completed with email<String>, domain<String>");

            me.login('Email', 'delpop', [{ email: options.email }, { domain: options.host }]).then(function(obj) {
                return resolve(obj);
            }, function(err) {
                return reject(err);
            });
        });
    }
}

module.exports = CPanel;