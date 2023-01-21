module.exports = {
  // The URL of a dynamic DTS entry point to request the responses from.
  source: "http://localhost:3000",
  // Base path on your local filesystem where the responses will be downloaded.
  // If relative, it will be relative to the working directory, NOT this settings file.
  // Must have a .json extension.
  local: `dts.json`,
  // Absolute URL of the Static DTS entry point where the responses will be served from.
  // Must end with a .json exension.
  // target: `https://raw.githubusercontent.com/kingsdigitallab/alice-thornton/develop/dts.json`,
  // target: `http://localhost:5500/alice-thornton/dts.json`,
  target: `http://localhost:5500/dts.json`,
  // array of Document output formats (see DTS spec.)
  formats: ["html"],
  // if true the local folder will be emptied before generating content
  clear: true,
};
