var Application = require("montage/core/application").Application,
    DocumentResources = require("montage/core/document-resources").DocumentResources,
    Promise = require("montage/core/promise").Promise,
    reworkVars = require("rework-vars/index");

var rework = require.loadPackage({name: "rework"})
.then(function (reworkRequire) {
    // these plugins uses modules from Node, and so let's inject them to stop
    // them getting loaded.
    ["lib/plugins/at2x", "rework-inherit", "lib/plugins/inline"]
    .forEach(function (moduleId) {
        reworkRequire.inject(moduleId, {});
    });
    return reworkRequire.async("rework");
});

exports.Application = Application.specialize({
    constructor: {
        value: function () {
            this.super();

            DocumentResources.prototype.addStyle = function (element) {
                // from the original
                var self = this,
                    url = element.getAttribute("href");

                url = this.normalizeUrl(url);

                if (url) {
                    if (this.hasResource(url)) {
                        return;
                    } else {
                        this._addResource(url);
                    }
                }

                // load and inject CSS

                // "convert" to module id
                var moduleId = url.replace(require.location, "");

                Promise.all([rework, require.async(moduleId)])
                .spread(function (rework, exports) {
                    var css = rework(exports.content)
                        .use(reworkVars())
                        .toString();

                    var style = document.createElement("style");
                    style.type = "text/css";
                    style.textContent = css;

                    var documentHead = self._document.head;
                    documentHead.insertBefore(element, documentHead.firstChild);
                })
                .done();
            };
        }
    },

    _load: {
        value: function(applicationRequire, callback) {
            // Hook application require to allow CSS files to be loaded
            // through require
            var oldMakeCompiler = applicationRequire.config.makeCompiler;
            applicationRequire.config.makeCompiler = function (config) {
                return exports.CssCompiler(
                    config,
                    oldMakeCompiler(config)
                );
            };
            applicationRequire.config.compile = applicationRequire.config.makeCompiler(applicationRequire.config);

            return this.super(applicationRequire, callback);
        }
    }
});

/**
 * Allows the .meta files to be loaded as json
 * @see Compiler middleware in require/require.js
 * @param config
 * @param compile
 */
var cssExpression = /\.css/;
exports.CssCompiler = function (config, compile) {
    return function (module) {
        var css = (module.location || "").match(cssExpression);
        if (css) {
            module.exports = {
                content: module.text
            };
            return module;
        } else {
            return compile(module);
        }
    };
};
