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
- optionally enter the GitLab URL, username and access token (see below)
- click `Generate`
- download image

## Include contributions from a private GitLab instance

The chart can additionally contain the contributions a person made on a private GitLab instance.

All GitLab settings are entered directly in the form, no configuration file is needed:

- `GitLab URL` - the base URL of the GitLab instance, e.g. `https://gitlab.example.com`
- `GitLab Username` - the username on that instance
- `GitLab Access Token` - a personal access token with the `read_user` scope,
  only needed if the instance / the profile is not publicly readable

The contributions are read from `<GitLab URL>/users/<username>/calendar.json` by the server
(the token is sent to the local API route in a header and only used for that request)
and are added to the GitHub contributions of the same day.
The daily counts and the yearly totals are summed up and the colour levels are recalculated.

Note: only days that are part of the GitHub contribution calendar of the user are shown,
so GitLab contributions of years in which the person had no GitHub activity at all are not displayed.
