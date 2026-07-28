import { fetchDataForAllYears } from '../../../utils/api/fetch'

export default async (req, res) => {
  const { username, format, gitlabUsername, gitlabUrl } = req.query;
  // the token is sent in a header so that it does not end up in URLs / logs
  const gitlabToken = req.headers['x-gitlab-token'];
  try {
    const data = await fetchDataForAllYears(
      username,
      format,
      gitlabUsername,
      gitlabUrl,
      gitlabToken
    );
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
