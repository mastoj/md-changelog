#!/usr/bin/env node

// Use getCommitsBetweenTwoRevisions to get the commits between two revisions
import { getCommitsBetweenTwoRevisions } from './src/changelog.js';

getCommitsBetweenTwoRevisions({
    owner: 'mastoj',
    name: 'branches'
}, 'v1.0.4', 'v1.0.5').then((response) => {
    console.log(response);
})

console.log("Hello World!");

// Print the world IBEN over the whole screen until I stop the program
