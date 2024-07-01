Fork of https://github.com/sallar/github-contributions-chart to generate printable github charts e.g. as staff gifts

How to use:
clone github-contributions-chart & github-contributions-canvas
- `git clone --branch  generateGifts  --single-branch git@github.com:JankariTech/github-contributions-chart.git`
- `git clone --branch  generateGifts  --single-branch git@github.com:JankariTech/github-contributions-canvas.git`


- install and build github-contributions-canvas: `cd github-contributions-canvas && yarn install && yarn build && cd ..`
- install and run clone github-contributions-chart: `cd github-contributions-chart && npm install && npm run dev`
- set starting & end date of person in `github-contributions-chart/src/pages/index.js:90-91`
- browse to http://localhost:3000/
- select `JankariTech` theme
- enter GitHub username
- click `Generate`
- download image
