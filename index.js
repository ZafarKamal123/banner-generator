const express = require('express');
const app = express();
const { convert } = require('convert-svg-to-png');

const fs = require("fs");

const PORT = 5000;


function replacePlaceholders(template, query) {

  for (const q in query) {

    const isPlaceholder = q.startsWith('{{') && q.endsWith('}}');

    if (!isPlaceholder) continue;

    template = template.split(q).join(query[q]);

  }

  return template;
}

app.get('/', function (request, response) {

  const requestedTemplate = request.query?.template ?? null;

  if (!requestedTemplate) {
    return response.status(404).json({ error: 'Template not found!' });
  }

  let templatePath = './templates/' + request.query.template + '.svg';

  if (!fs.existsSync(templatePath)) {
    return response.status(404).json({ error: 'Template not found!' });
  }

  let svgTemplate = fs.readFileSync(templatePath, { encoding: 'utf-8' });

  svgTemplate = replacePlaceholders(svgTemplate, request.query);

  return convert(svgTemplate).then(image => {
    response.writeHead(200, {
      'Content-Type': 'image/jpg',
      'Content-Length': image.length
    });
    response.end(image);
  });

});

app.listen(PORT, () => {
  console.log('Server listening on http://localhost:' + PORT);
})