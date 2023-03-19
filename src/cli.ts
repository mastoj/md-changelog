#!/usr/bin/env node

import yargs from "yargs/yargs";

import { getCommitsBetweenTwoRevisions, toMarkdown } from "./changelog";

const main = async () => {
  const argv = yargs(process.argv.slice(2))
    .options({
      from: { type: "string", demandOption: true },
      to: { type: "string", demandOption: true },
      dropMergeCommits: { type: "boolean", default: true },
      owner: { type: "string", demandOption: true },
      repo: { type: "string", demandOption: true },
      changeLogTemplate: { type: "string", demandOption: false },
      ghToken: { type: "string", demandOption: false },
    })
    .parseSync();

  const result = await getCommitsBetweenTwoRevisions({
    repo: {
      owner: argv.owner,
      repo: argv.repo,
    },
    from: argv.from,
    to: argv.to,
    dropMergeCommits: argv.dropMergeCommits,
    ghToken: argv.ghToken,
  });
  const mdChangeLog = toMarkdown(result, argv.changeLogTemplate);
  console.log(mdChangeLog);
};

main();
