#!/usr/bin/env node

import { getCommitsBetweenTwoRevisions } from "./changelog";

const main = async () => {
  const result = await getCommitsBetweenTwoRevisions({
    repo: {
      owner: "mastoj",
      name: "branches",
    },
    from: "v1.0.0",
    to: "v1.0.7",
  });
  console.log(result);
};

main();

console.log("Hello, world!");
