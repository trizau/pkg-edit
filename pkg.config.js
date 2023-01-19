const packageJSON = require("./package.json");

module.exports = {
  // entry file
  file: "./release/build.exe",

  // modifier
  icon: "app.ico",
  name: packageJSON.name,
  description: packageJSON.description || "description",
  company: "company",
  version: packageJSON.version || "1.0.0",
  copyright: "Copyright-" + new Date().getFullYear(),
};
