import { Octokit } from "octokit";
import Handlebars from "handlebars";

export type Repo = {
  owner: string;
  repo: string;
};

export type GetCommitArgs = {
  repo: Repo;
  from: string;
  to: string;
  dropMergeCommits: boolean;
  ghToken?: string;
  ticketUrlTemplateSource?: string;
};

export type Commit = {
  repo: Repo;
  sha: string;
  shortSha: string;
  header: string;
  body: string;
  url: string;
};

export type Ticket = {
  id: string;
  url?: string;
};

export type PullRequest = {
  id: number;
  url: string;
};

export type ChangeLogItem = Commit & {
  pr?: PullRequest;
  tickets: Ticket[];
};

export type ChangeLog = {
  from: string;
  to: string;
  items: ChangeLogItem[];
};
// Use octokit to get the commits between two revisions
export const getCommitsBetweenTwoRevisions = async ({
  repo,
  from,
  to,
  dropMergeCommits,
  ghToken = process.env.GH_TOKEN,
  ticketUrlTemplateSource,
}: GetCommitArgs) => {
  if (!ghToken) {
    throw new Error("Pass in ghToken or set env var GH_TOKEN");
  }
  const octokit = new Octokit({ auth: ghToken });

  try {
    const response = await octokit.rest.repos.compareCommits({
      owner: repo.owner,
      repo: repo.repo,
      base: from,
      head: to,
      ticketUrlTemplateSource: ticketUrlTemplateSource,
    });
    const commits = response.data.commits
      .map((c) => ({
        sha: c.sha,
        shortSha: c.sha.substring(0, 7),
        header: c.commit.message.split("\n")[0],
        body: c.commit.message.split("\n").slice(1).join("\n"),
        url: c.html_url,
        repo: repo,
      }))
      .filter(
        (c) => !dropMergeCommits || !c.header.startsWith("Merge pull request")
      )
      .reverse()
      .map(getChangeLogItem(ticketUrlTemplateSource));
    return { items: commits, from, to } as ChangeLog;
  } catch (e: any) {
    throw new Error(
      "Failed to get commits, are the to and from tags correct?: " +
        e.message || ""
    );
  }
};

export const getChangeLogItem =
  (ticketUrlTemplateSource?: string) =>
  (commit: Commit): ChangeLogItem => {
    const headerParts = commit.header.split("#");

    const prId =
      headerParts.length > 1
        ? parseInt(headerParts[1].split(")")[0])
        : undefined;
    const pr = prId
      ? {
          id: prId,
          url: `https://www.github.com/${commit.repo.owner}/${commit.repo.repo}/pull/${prId}`,
        }
      : undefined;
    // Tickets are in the format: TICKET: ID-123, ID-456, PROJX-789 and can be any line in the body.
    const ticketUrlTemplate = ticketUrlTemplateSource
      ? Handlebars.compile(ticketUrlTemplateSource)
      : undefined;
    const tickets = commit.body
      .split("\n")
      .map((line) => line.split(":"))
      .filter(
        (parts) =>
          parts[0].trim().toLowerCase() === "ticket" ||
          parts[0].trim().toLowerCase() === "tickets"
      )
      .map((parts) => parts[1].split(","))
      .flat()
      .map((id) => id.trim())
      .map(
        (id) =>
          ({
            id,
            url: ticketUrlTemplate ? ticketUrlTemplate({ id }) : undefined,
          } as Ticket)
      );

    return { ...commit, pr, tickets };
  };

const defaultSource = `**Changelog for revision {{from}} to {{to}}**
{{#if body}}{{body}}{{/if}}

_Changes_:

{{#each items}}
* [{{shortSha}}]({{url}}) **{{header}}**
{{#if pr}}
  * Pull request: [{{pr.id}}]({{pr.url}})
{{/if}}
{{#if tickets}}
  * Tickets: 
  {{#each tickets}}
    * [{{id}}]({{url}}) 
  {{/each}}
{{/if}}
{{/each}}
`;
export const toMarkdown = (changeLog: ChangeLog, source = defaultSource) => {
  const template = Handlebars.compile(source);
  const result = template(changeLog);
  const massageMessage = result.replace(/\n\n/g, "\n\n\n\n‌‌ \n\n\n\n");
  return massageMessage;
};
