/**
 * Fetches the contribution calendar of a user on a (private) GitLab instance.
 *
 * The GitLab instance URL, the username and (for private instances) a personal
 * access token with the `read_user` scope are entered in the form of the app
 * and passed to the API route, they are not read from any configuration file.
 */

/**
 * @returns {Promise<Object>} map of `YYYY-MM-DD` -> number of contributions
 */
export async function fetchGitlabContributions(username, gitlabUrl, gitlabToken) {
  if (!username || !gitlabUrl) {
    return {};
  }

  const baseUrl = gitlabUrl.trim().replace(/\/+$/, "");
  const url = `${baseUrl}/users/${encodeURIComponent(
    username
  )}/calendar.json`;

  const headers = { accept: "application/json" };
  if (gitlabToken) {
    headers["PRIVATE-TOKEN"] = gitlabToken;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(
      `Could not fetch GitLab contributions of "${username}" (${response.status})`
    );
  }

  const calendar = await response.json();
  return Object.entries(calendar).reduce((counts, [date, count]) => {
    counts[date] = parseInt(count, 10) || 0;
    return counts;
  }, {});
}
