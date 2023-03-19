#!/usr/bin/env node

import { getChangeLogItem, getCommitsBetweenTwoRevisions } from "./changelog";

const main = async () => {
  const result = await getCommitsBetweenTwoRevisions({
    repo: {
      owner: "mastoj",
      name: "branches",
    },
    from: "v1.0.0",
    to: "v1.0.20",
  });
  const changeLogItems = result.commits.map(getChangeLogItem).reverse();
  console.log(JSON.stringify(changeLogItems, null, 2));
};

main();

console.log("Hello, world!");
