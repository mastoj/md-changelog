#!/usr/bin/env node

import { getChangeLogItem, getCommitsBetweenTwoRevisions } from "./changelog";

const main = async () => {
  const result = await getCommitsBetweenTwoRevisions({
    repo: {
      owner: "mastoj",
      name: "branches",
    },
    from: "v1.0.0",
    to: "v1.0.7",
  });
  const changeLogItems = result.commits.map(getChangeLogItem);
  console.log(changeLogItems);
};

main();

console.log("Hello, world!");
