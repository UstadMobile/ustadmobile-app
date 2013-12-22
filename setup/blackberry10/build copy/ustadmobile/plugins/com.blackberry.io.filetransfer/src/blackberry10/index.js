/*
 * Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var filetransfer,
    _webview = require("../../lib/webview"),
    _utils = require("./../../lib/utils"),
    Whitelist = require('../../lib/policy/whitelist').Whitelist,
    _whitelist = new Whitelist(),
    resultObjs = {};

module.exports = {
    upload: function (success, fail, args, env) {
        var key,
            key2,
            result = new PluginResult(args, env),
            params = {
                "filePath": "",
                "server": "",
                "options": {
                    "fileKey": "file",
                    "fileName": "image.jpg",
                    "mimeType": "image/jpeg",
                    "params": {},
                    "chunkedMode": true,
                    "chunkSize": 1024,
                    "windowGroup" : _webview.windowGroup()
                }
            },
            undefined_params = [];

        resultObjs[result.callbackId] = result;

        // decodeURI and check for null value params
        /*jshint forin: false */
        for (key in args) {
            args[key] = JSON.parse(decodeURIComponent(args[key]));
            if (!args[key]) {
                undefined_params.push(key);
            }
        }

        // validate params
        if (undefined_params.length !== 0) {
            result.error(undefined_params + (undefined_params.length === 1 ? " is " : " are ") + "null", false);
            return;
        }

        if (args.options && args.options.chunkedMode !== false && args.options.chunkSize <= 0) {
            result.error("chunkSize must be a positive number", false);
            return;
        }

        // translate paths
        args.filePath = _utils.translatePath(args.filePath).replace(/file:\/\//, '');

        // check if url is whitelisted
        if (!_whitelist.isAccessAllowed(args.server)) {
            result.error("URL denied by whitelist: " + args.server, false);
            return;
        }

        // set user defined args into params
        for (key in args) {
            if (args[key]) {
                if (key === "options") {
                    for (key2 in args[key]) {
                        params[key][key2] = args[key][key2];
                    }
                } else {
                    params[key] = args[key];
                }
            }
        }

        filetransfer.getInstance().upload(params);
        result.noResult(true);
    },

    download: function (success, fail, args, env) {
        var key,
            result = new PluginResult(args, env),
            undefined_params = [];

        resultObjs[result.callbackId] = result;

        /*jshint forin: false */
        for (key in args) {
            args[key] = JSON.parse(decodeURIComponent(args[key]));
            if (!args[key]) {
                undefined_params.push(key);
            }
        }

        // validate params
        if (undefined_params.length !== 0) {
            result.error(undefined_params + (undefined_params.length === 1 ? " is " : " are ") + "null", false);
            return;
        }

        // translate paths
        args.target = _utils.translatePath(args.target).replace(/file:\/\//, '');

        // check if url is whitelisted
        if (!_whitelist.isAccessAllowed(args.source)) {
            result.error("URL denied by whitelist: " + args.source, false);
            return;
        }

        args.windowGroup = _webview.windowGroup();

        filetransfer.getInstance().download(args);
        result.noResult(true);
    }
};


///////////////////////////////////////////////////////////////////
// JavaScript wrapper for JNEXT plugin
///////////////////////////////////////////////////////////////////

JNEXT.FileTransfer = function () {
    var self = this,
        hasInstance = false;

    self.upload = function (args) {
        return JNEXT.invoke(self.m_id, "upload " + JSON.stringify(args));
    };

    self.download = function (args) {
        return JNEXT.invoke(self.m_id, "download " + JSON.stringify(args));
    };

    self.getId = function () {
        return self.m_id;
    };

    self.onEvent = function (strData) {
        var arData = strData.split(" ", 7),
            callbackId = arData[0],
            strEventDesc = arData[1],
            strEventResult = arData[2],
            result = resultObjs[callbackId],
            args = {};

        if (strEventDesc === "upload") {
            if (strEventResult === "success") {
                args.result = strEventResult;
                args.bytesSent = parseInt(arData[3], 10);
                args.responseCode = parseInt(arData[4], 10);
                args.response = escape(strData.split(" ").slice(5).join(" "));
            } else if (strEventResult === "error") {
                args.result = strEventResult;
                args.code = parseInt(arData[3], 10);
                args.source = unescape(arData[4]);
                args.target = unescape(arData[5]);
                args.http_status = parseInt(arData[6], 10);
            }
        } else if (strEventDesc === "download") {
            if (strEventResult === "success") {
                args.result = strEventResult;
                args.isFile = (arData[3] === "1" ? true : false);
                args.isDirectory = (arData[4] === "1" ? true : false);
                args.name = arData[5];
                args.fullPath = escape(strData.split(" ").slice(6).join(" "));
            } else if (strEventResult === "error") {
                args.result = strEventResult;
                args.code = parseInt(arData[3], 10);
                args.source = unescape(arData[4]);
                args.target = unescape(arData[5]);
                args.http_status = parseInt(arData[6], 10);
            }
        }
        if (result) {
            result.callbackOk(args, false);
            delete resultObjs[callbackId];
        }
    };

    self.init = function () {
        if (!JNEXT.require("libfiletransfer")) {
            return false;
        }

        self.m_id = JNEXT.createObject("libfiletransfer.FileTransfer");

        if (self.m_id === "") {
            return false;
        }

        JNEXT.registerEvents(self);
    };

    self.m_id = "";

    self.getInstance = function () {
        if (!hasInstance) {
            self.init();
            hasInstance = true;
        }
        return self;
    };
};

filetransfer = new JNEXT.FileTransfer();
