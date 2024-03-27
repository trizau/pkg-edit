const packageJSON = require("./package.json");

module.exports = {
  // entry file
  file: "./release/build.exe",

  // modifier
  icon: "app.ico",
  name: packageJSON.name,
  description: packageJSON.description,
  version: packageJSON.version,
  copyright: "Copyright-" + new Date().getFullYear(),
};
