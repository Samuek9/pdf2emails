const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const svg = fs.readFileSync(path.join(__dirname, '..', 'assets', 'ph-thumbnail.svg'), 'utf8');

function render(svg, width) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width } });
  const png = resvg.render().asPng();
  return png;
}

const out = path.join(__dirname, '..', 'assets');
for (const w of [1024, 240]) {
  fs.writeFileSync(path.join(out, `ph-thumbnail-${w}.png`), render(svg, w));
  console.log(`wrote ph-thumbnail-${w}.png`);
}
