#! /usr/bin/env node
"use strict";
// https://github.com/kingsdigitallab/webval/blob/main/docs/utils.js
// TODO: rewrite all the paths in the responses (nav>@id, dts:passage, dts:references)
// TODO: error management!
// TODO: sync -> async
//

const dtsutils = require("kdl-dts-client");
const { exit } = require("process");
const path = require("path");
const fs = require("fs");

class Generator {
  constructor() {
    this.loadSettings()
  }
  loadSettings() {
    let ret = require("../settings")
    // read service settings from settings.js .
    // they can be overridden by a json file passed as the last argument
    let path = process.argv[process.argv.length - 1]
    if (path.endsWith(".json")) {
      let content = fs.readFileSync(path)
      ret = {
        ...ret,
        ...JSON.parse(content)
      }
    }

    if (!ret.local) {
      // if not provided, the local destination is the filename of the target
      ret.local = ret.target.replace(/^.*\//, '')
    }

    this.settings = ret

    return ret
  }
  async generate() {
    this.validateSettings();

    if (this.settings.clear) this.clearLocalFolder();

    // get services URIs from DTS entrypoint
    this.responses = {
      entryPoint: await this.fetchAndWriteDTS(),
    };

    // TODO: rewrite webpaths of the services
    // this.responses.collections = `${this.target}/collections`

    // get root collection
    // TODO: paginate
    let res = await this.fetchAndWriteDTS("collections");

    // TODO: get subcollections (recursive fct)

    // get nav/documents
    for (let colMember of res.member) {
      if (colMember["@type"] == "Resource") {
        // get Navigation
        // TODO: paginate
        let nav = await this.fetchAndWriteDTS("navigation", colMember["@id"]);

        // get Passages
        for (let ref of nav.member) {
          for (let format of this.settings.formats) {
            await this.fetchAndWriteDTS(
              "documents",
              colMember["@id"],
              ref["dts:ref"],
              format
            );
          }
          // break;
        }
      }
    }

    console.log("done.");
  }
  clearLocalFolder() {
    let apath = path.resolve(this.settings.local.replace(".json", ""));
    if (fs.existsSync(apath)) {
      console.log("  RMDIR " + apath);
      fs.rmSync(apath, { recursive: true });
    }
  }
  async fetchAndWriteDTS(service, id, ref, format) {
    let ret = await dtsutils.fetchDTS(
      {
        selections: { source: this.settings.source },
        responses: this.responses,
      },
      service,
      id,
      ref,
      format
    );
    if (!ret)
      this.error(`DTS request failed. (${service}, ${id}, ${ref}, ${format})`);

    let res = this.getTranformedResponse(service, ret);

    this.writeResponse(res, service, id, ref, format);

    return ret;
  }
  getParentFolderName() {
    return new URL(this.settings.target)
      .pathname
      .replace(/^.*\//, "")
      .replace(/\.json$/, "")
  }
  getTranformedResponse(service, res) {
    if (service == "documents") return res;

    let ret = JSON.parse(JSON.stringify(res));
    if (!service) {
      let targetRoot = new URL(this.settings.target).pathname.replace(
        /\.json$/,
        ""
      );
      let parentFolder = this.getParentFolderName()
      ret["@id"] = `${targetRoot}.json`;
      ret.collections = `${parentFolder}/collections`;
      ret.navigation = `${parentFolder}/navigation`;
      ret.documents = `${parentFolder}/documents`;
    }
    return ret;
  }
  writeResponse(data, service, id, ref, format) {
    let parentFolder = this.getParentFolderName()
    let filePath = dtsutils.getDTSUrl(
      {
        selections: { source: this.settings.local },
        responses: {
          entryPoint: {
            collections: `${parentFolder}/collections`,
            navigation: `${parentFolder}/navigation`,
            documents: `${parentFolder}/documents`,
          },
        },
      },
      service,
      id,
      ref,
      format
    );
    if (dtsutils.getFormatFromRequest(service, format) == "json") {
      data = JSON.stringify(data, null, 1);
    }
    let parentPath = path.dirname(filePath);
    fs.mkdirSync(parentPath, { recursive: true });

    console.log("  WRITE " + path.resolve(filePath));
    fs.writeFileSync(filePath, data, "utf8");
  }
  validateSettings() {
    let errors = [];
    let s = this.settings;
    let localParent = path.dirname(path.resolve(this.settings.local));
    if (!fs.existsSync(localParent)) {
      errors.push("settings.local parent path does not exist");
    }
    if (localParent == "/") {
      errors.push("settings.local cannot be a root folder");
    }
    if (!s.local.match(/\w+\.json$/)) {
      errors.push("settings.local must end with a valid .json filename");
    }
    if (!s.target.endsWith(".json")) {
      errors.push('settings.target must end with extension ".json"');
    }
    if (errors.length) {
      for (let error of errors) {
        console.error(error);
      }
      exit(1);
    }
  }
  logjson(data) {
    console.log(JSON.stringify(data, null, 2));
  }
  error(message) {
    console.error(`ERROR: ${message}`);
    exit(1);
  }
}

new Generator().generate();
