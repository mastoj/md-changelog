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
};

export type GetCommitResult = {
  commits: Commit[];
};

export type ChangeLogItem = Commit & {
  pr?: number;
  tickets: string[];
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
    }));
    return { commits };
  });
};

export const getChangeLogItem = (commit: Commit): ChangeLogItem => {
  const headerParts = commit.header.split("#");
  const pr =
    headerParts.length > 1 ? parseInt(headerParts[1].split(")")[0]) : undefined;
  const tickets = commit.body
    .split("\n")
    .filter((l) => l.startsWith("Fixes"))
    .map((l) => l.replace("Fixes", "").trim());
  return { ...commit, pr, tickets };
};
