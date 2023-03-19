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
