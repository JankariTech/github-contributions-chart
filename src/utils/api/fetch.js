import cheerio from "cheerio";
import _ from "lodash";
import { fetchGitlabContributions } from "./gitlab";

const COLOR_MAP = {
  0: "#ebedf0",
  1: "#9be9a8",
  2: "#40c463",
  3: "#30a14e",
  4: "#216e39"
};

async function fetchYears(username) {
  const data = await fetch(`https://github.com/${username}?tab=contributions`, {
    headers: {
      "x-requested-with": "XMLHttpRequest"
    }
  });
  const body = await data.text();
  const $ = cheerio.load(body);
  return $(".js-year-link")
    .get()
    .map((a) => {
      const $a = $(a);
      const href = $a.attr("href");
      const githubUrl = new URL(`https://github.com${href}`);
      githubUrl.searchParams.set("tab", "contributions");
      const formattedHref = `${githubUrl.pathname}${githubUrl.search}`;

      return {
        href: formattedHref,
        text: $a.text().trim()
      };
    });
}

// GitHub uses 4 levels, the intensity of a day is calculated relative to the
// busiest day of the year
function intensityForCount(count, maxCount) {
  if (count <= 0) return 0;
  if (maxCount <= 0) return 0;
  return Math.min(4, Math.ceil((count / maxCount) * 4));
}

async function fetchDataForYear(url, year, format, gitlabContributions = {}) {
  const data = await fetch(`https://github.com${url}`, {
    headers: {
      "x-requested-with": "XMLHttpRequest"
    }
  });
  const $ = cheerio.load(await data.text());
  const $days = $(
    "table.ContributionCalendar-grid td.ContributionCalendar-day"
  );

  const contribText = $(".js-yearly-contributions h2")
    .text()
    .trim()
    .match(/^([0-9,]+)\s/);
  let contribCount;
  if (contribText) {
    [contribCount] = contribText;
    contribCount = parseInt(contribCount.replace(/,/g, ""), 10);
  }
  const parseDay = (day) => {
    const $day = $(day);
    const dateString = $day.attr("data-date");
    const date = dateString.split("-").map((d) => parseInt(d, 10));
    let dayCount = 0;
    try {
      const idContributionCount = $day.attr("id");
      const contributionsText = $('[for="' + idContributionCount + '"]').text();
      const match = contributionsText.match(/^(\d+) contribution.*\.$/);
      dayCount = parseInt(match[1], 10);
    } catch (e) {
      // pass
      dayCount = 0;
    }

    const gitlabCount = gitlabContributions[dateString] || 0;
    dayCount += gitlabCount;

    const value = {
      date: dateString,
      count: dayCount,
      gitlabCount,
      color: COLOR_MAP[$day.attr("data-level")],
      intensity: $day.attr("data-level") || 0
    };
    return { date, value };
  };

  const days = $days.get().map((day) => parseDay(day));
  const gitlabTotal = days.reduce((sum, { value }) => sum + value.gitlabCount, 0);

  // the levels reported by GitHub don't know about the GitLab contributions,
  // so they have to be recalculated as soon as there are any
  if (gitlabTotal > 0) {
    const maxCount = days.reduce(
      (max, { value }) => Math.max(max, value.count),
      0
    );
    days.forEach(({ value }) => {
      value.intensity = intensityForCount(value.count, maxCount);
      value.color = COLOR_MAP[value.intensity];
    });
  }

  return {
    year,
    total: (contribCount || 0) + gitlabTotal,
    range: {
      start: $($days.get(0)).attr("data-date"),
      end: $($days.get($days.length - 1)).attr("data-date")
    },
    contributions: (() => {
      if (format !== "nested") {
        return days.map(({ value }) => value);
      }

      return days.reduce((o, { date, value }) => {
        const [y, m, d] = date;
        if (!o[y]) o[y] = {};
        if (!o[y][m]) o[y][m] = {};
        o[y][m][d] = value;
        return o;
      }, {});
    })()
  };
}

export async function fetchDataForAllYears(
  username,
  format,
  gitlabUsername,
  gitlabUrl,
  gitlabToken
) {
  const [years, gitlabContributions] = await Promise.all([
    fetchYears(username),
    fetchGitlabContributions(gitlabUsername, gitlabUrl, gitlabToken)
  ]);
  return Promise.all(
    years.map((year) =>
      fetchDataForYear(year.href, year.text, format, gitlabContributions)
    )
  ).then((resp) => {
    return {
      years: (() => {
        const obj = {};
        const arr = resp.map((year) => {
          const { contributions, ...rest } = year;
          _.setWith(obj, [rest.year], rest, Object);
          return rest;
        });
        return format === "nested" ? obj : arr;
      })(),
      contributions:
        format === "nested"
          ? resp.reduce((acc, curr) => _.merge(acc, curr.contributions))
          : resp
              .reduce((list, curr) => [...list, ...curr.contributions], [])
              .sort((a, b) => {
                if (a.date < b.date) return 1;
                else if (a.date > b.date) return -1;
                return 0;
              })
    };
  });
}
