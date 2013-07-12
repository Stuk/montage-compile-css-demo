var Application = require("montage/core/application").Application,
    DocumentResources = require("montage/core/document-resources").DocumentResources,
    Promise = require("montage/core/promise").Promise,
    reworkVars = require("rework-vars/index"),
    cssVariables = require("css-variables.json");

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

            // Replace the addStyle of DocumentResources so that we can
            // compile the CSS, and then insert the compiled styles directly
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
                // NOTE: require.read does not cache, but DocumentResources
                // shouldn't insert resources that it already has anyways
                Promise.all([rework, require.read(url)])
                .spread(function (rework, css) {
                    css = rework(css)
                        .use(reworkVars(cssVariables))
                        .toString();

                    var style = document.createElement("style");
                    style.type = "text/css";
                    style.textContent = css;
                    style.setAttribute("data-from", url);

                    var documentHead = self._document.head;
                    documentHead.insertBefore(style, documentHead.firstChild);
                })
                .done();
            };
        }
    }
});
