const REPO_OWNER = "ldh5193";
const REPO_NAME = "ProjectOtaku";

interface CreateIssueParams {
  title: string;
  body: string;
  labels: string[];
}

export async function createGitHubIssue(
  params: CreateIssueParams
): Promise<{ url: string; number: number }> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is not configured");
  }

  const res = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        title: params.title,
        body: params.body,
        labels: params.labels,
      }),
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`GitHub API error: ${res.status} - ${error}`);
  }

  const data = await res.json();
  return { url: data.html_url, number: data.number };
}
