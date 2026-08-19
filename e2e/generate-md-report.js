const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const data = JSON.parse(fs.readFileSync('report.json', 'utf8'));

  let html = `
  <html>
  <head>
    <style>
      body { font-family: -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 900px; margin: 0 auto; padding: 40px; }
      h1 { border-bottom: 2px solid #eaecef; padding-bottom: 10px; }
      h2 { margin-top: 30px; border-bottom: 1px solid #eaecef; padding-bottom: 5px; }
      table { border-collapse: collapse; width: 100%; margin-top: 20px; font-size: 14px; }
      th, td { text-align: left; padding: 10px; border-bottom: 1px solid #ddd; }
      th { background-color: #f6f8fa; }
      .pass { color: #28a745; font-weight: bold; }
      .fail { color: #d73a49; font-weight: bold; }
      .skip { color: #6a737d; }
      .project-header { background-color: #0366d6; color: white; font-weight: bold; padding: 10px; margin-top: 30px; border-radius: 4px; }
    </style>
  </head>
  <body>
    <h1>Stenna QA Automation Report</h1>
    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
    <p><strong>Total Tests:</strong> ${data.stats.expected + data.stats.unexpected + data.stats.flaky + data.stats.skipped}</p>
    <p><strong>Passed:</strong> <span class='pass'>${data.stats.expected}</span></p>
    <p><strong>Failed:</strong> <span class='fail'>${data.stats.unexpected}</span></p>
    <p><strong>Skipped:</strong> <span class='skip'>${data.stats.skipped}</span></p>
    <p><strong>Duration:</strong> ${(data.stats.duration / 1000).toFixed(2)} seconds</p>
    
    <h2>Index of Projects</h2>
    <ul>
  `;

  function traverseSpecs(suite, path = '') {
    let specs = [];
    if (suite.specs) {
      for (const spec of suite.specs) {
        specs.push({
          title: path + ' › ' + spec.title,
          result: spec.tests[0].results[0],
          projectName: spec.tests[0].projectName || 'UI Tests'
        });
      }
    }
    if (suite.suites) {
      for (const child of suite.suites) {
        const newPath = path ? path + ' › ' + child.title : child.title;
        specs = specs.concat(traverseSpecs(child, newPath));
      }
    }
    return specs;
  }

  const projects = {};
  for (const suite of data.suites) {
      const specs = traverseSpecs(suite, suite.title);
      for (const spec of specs) {
          const projectName = spec.projectName;
          if (!projects[projectName]) projects[projectName] = [];
          projects[projectName].push(spec);
      }
  }

  for (const p of Object.keys(projects)) {
    html += `<li><a href="#${p}">${p.toUpperCase()} Testing</a> (${projects[p].length} cases)</li>`;
  }

  html += `</ul>`;

  for (const p of Object.keys(projects)) {
    html += `<h2 id="${p}" class="project-header">${p.toUpperCase()} TEST CASES</h2>`;
    html += `
    <table>
      <thead>
        <tr>
          <th width="70%">Test Case Details</th>
          <th width="15%">Status</th>
          <th width="15%">Duration</th>
        </tr>
      </thead>
      <tbody>
    `;
    
    for (const spec of projects[p]) {
      const result = spec.result;
      let statusText = 'UNKNOWN';
      let statusClass = '';
      
      if (result.status === 'passed' || result.status === 'expected') {
        statusText = '✅ Passed';
        statusClass = 'pass';
      } else if (result.status === 'skipped') {
        statusText = '⏭️ Skipped';
        statusClass = 'skip';
      } else {
        statusText = '❌ Failed';
        statusClass = 'fail';
      }
      
      const duration = result.duration ? `${(result.duration / 1000).toFixed(2)}s` : '-';
      const cleanTitle = spec.title.replace(/\.spec\.js/g, '');
      
      html += `
        <tr>
          <td>${cleanTitle}</td>
          <td><span class="${statusClass}">${statusText}</span></td>
          <td>${duration}</td>
        </tr>
      `;
    }
    
    html += `</tbody></table>`;
  }

  html += `
  </body>
  </html>
  `;

  fs.writeFileSync('report.html', html);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + process.cwd() + '/report.html');
  await page.pdf({ 
    path: 'Stenna_E2E_Test_Report.pdf', 
    format: 'A4', 
    printBackground: true, 
    margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' } 
  });
  await browser.close();
  console.log('PDF generated successfully!');
})();
