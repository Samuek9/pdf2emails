const fs = require("fs");
const path = require("path");
const { Resvg } = require("@resvg/resvg-js");

const svg = fs.readFileSync(path.join(__dirname, "..", "public", "og-image.svg"), "utf8");
const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } });
const png = resvg.render().asPng();
fs.writeFileSync(path.join(__dirname, "..", "public", "og-image.png"), png);
console.log("wrote public/og-image.png", png.length, "bytes");
