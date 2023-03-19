import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GH_TOKEN });

export type Repo = {
  owner: string;
  name: string;
};

export type GetCommitArgs = {
  repo: Repo;
  from: string;
  to: string;
};

export type Commit = {
  sha: string;
  header: string;
  body: string;
  url: string;
};

export type GetCommitResult = {
  commits: Commit[];
};

export type Ticket = {
  id: string;
  url: string;
};

export type PullRequest = {
  id: number;
  url: string;
};

export type ChangeLogItem = Commit & {
  pr?: PullRequest;
  tickets: Ticket[];
};
// Use octokit to get the commits between two revisions
export const getCommitsBetweenTwoRevisions = ({
  repo,
  from,
  to,
}: GetCommitArgs) => {
  const response = octokit.rest.repos.compareCommits({
    owner: repo.owner,
    repo: repo.name,
    base: from,
    head: to,
  });
  return response.then((r) => {
    const commits = r.data.commits.map((c) => ({
      sha: c.sha,
      header: c.commit.message.split("\n")[0],
      body: c.commit.message.split("\n").slice(1).join("\n"),
      url: c.html_url,
    }));
    return { commits };
  });
};

export const getChangeLogItem = (commit: Commit): ChangeLogItem => {
  const headerParts = commit.header.split("#");

  const prId =
    headerParts.length > 1 ? parseInt(headerParts[1].split(")")[0]) : undefined;
  const pr = prId
    ? { id: prId, url: `https://www.github.com/mastoj/branches/pull/${prId}` }
    : undefined;
  // Tickets are in the format: TICKET: ID-123, ID-456, PROJX-789 and can be any line in the body.
  const tickets = commit.body
    .split("\n")
    .map((line) => line.split(":"))
    .filter((parts) => parts[0].trim().toLowerCase() === "ticket")
    .map((parts) => parts[1].split(","))
    .flat()
    .map((id) => id.trim())
    .map((id) => ({
      id,
      url: `https://jira.example.com/browse/${id}`,
    }));

  return { ...commit, pr, tickets };
};
