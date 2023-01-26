#!/usr/bin/env node

import * as ResEdit from "resedit";
import * as path from "path";
import * as fs from "fs";
import { cwd } from "process";

function error(msg: string) {
  console.error(msg);
  process.exit();
}

const CONFIG_FILE = cwd() + "/pkg.config.js";

async function init() {
  function copyFile(fileName: string) {
    let _fileName = path.join(__dirname, fileName);
    if (!fs.existsSync(_fileName)) {
      _fileName = path.join(path.dirname(__dirname), fileName);
    }
    if (!fs.existsSync(_fileName)) {
      error(`${fileName} not exists!`);
    }
    const to = path.resolve(cwd() + "/" + path.basename(_fileName));
    if (!fs.existsSync(to)) {
      fs.copyFileSync(_fileName, to);
    }
  }
  copyFile("app.ico");
  copyFile("pkg.config.js");
  console.log("-- pkg-edit init success --");
}

async function build() {
  // config file not found
  if (!fs.existsSync(CONFIG_FILE)) {
    error("config not init, you need run: npx pkg-edit init");
  }

  const {
    file,
    icon,
    version,
    description,
    company,
    name,
    copyright,
  } = require(CONFIG_FILE);

  // env check
  if (!fs.existsSync(file)) error(`${file} not exists!`);
  if (!fs.existsSync(icon)) error(`${icon} not exists!`);

  if (fs.statSync(icon).size > 100 * 1024) {
    throw new Error(
      "When the icon file exceeds 100kb, the program may not open"
    );
  }

  let data = fs.readFileSync(file);
  let exe = ResEdit.NtExecutable.from(data);
  let res = ResEdit.NtExecutableResource.from(exe);
  let viList = ResEdit.Resource.VersionInfo.fromEntries(res.entries);

  let vi = viList[0];
  const theversion = `${version}.0`.split(".");

  vi.removeStringValue({ lang: 1033, codepage: 1200 }, "OriginalFilename");
  vi.removeStringValue({ lang: 1033, codepage: 1200 }, "InternalName");
  vi.setProductVersion(
    Number(theversion[0]),
    Number(theversion[1]),
    Number(theversion[2]),
    Number(theversion[3])
  );
  vi.setFileVersion(
    Number(theversion[0]),
    Number(theversion[1]),
    Number(theversion[2]),
    Number(theversion[3])
  );
  vi.setStringValues(
    { lang: 1033, codepage: 1200 },
    {
      FileDescription: description,
      ProductName: name,
      CompanyName: company,
      LegalCopyright: copyright,
    }
  );

  vi.outputToResourceEntries(res.entries);
  let iconFile = ResEdit.Data.IconFile.from(
    fs.readFileSync(path.join(process.cwd(), icon))
  );
  ResEdit.Resource.IconGroupEntry.replaceIconsForResource(
    res.entries,
    1,
    1033,
    iconFile.icons.map((item) => item.data)
  );
  res.outputResource(exe);
  let newBinary = exe.generate();

  const outFile = path.join(
    path.resolve(path.dirname(file)),
    `${name}-${version}.exe` // out file name
  );
  fs.writeFileSync(outFile, Buffer.from(newBinary));
  console.log("-- pkg-edit build success --");
  console.log(`pkg-edit out to: ${outFile}`);
}

const args = process.argv.slice(2);
let param = args[0];

if (param === "init") {
  init();
} else if (param === "build") {
  build();
} else {
  console.log(`change exe file info
  example:
    npx pkg-edit init
    npx pkg-edit build`);
}
