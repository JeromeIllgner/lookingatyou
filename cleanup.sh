#!/bin/bash

deleteFeatureBranch() {
    echo "Deleting branch" $1
    aws s3 rm s3://looking-at-you/feature/$1 --recursive
}

# regex for feature branches
REGEX="\([Ff]eature\)\/[0-9a-zA-Z\-]*"

# get all remote feature branches
ALL_BRANCHES="$(git branch -r | grep ${REGEX} | cut -d'/' -f 3)"
MY_BRANCHES=($ALL_BRANCHES)

# get all merged feature branches from the git log
MERGED_BRANCHES="$(git log | grep ${REGEX})"

# get the list of deployed branches
DEPLOYED_BRANCHES="$(aws s3 ls s3://looking-at-you/feature/)"

for DEPLOYED_BRANCH in $DEPLOYED_BRANCHES; do
    if [[ "($DEPLOYED_BRANCH)" != *PRE* ]]; then
        # check for merged branches

        FORMATED_BRANCH_NAME=$(echo ${DEPLOYED_BRANCH} | tr - ' ')

        if [[ "${MERGED_BRANCHES}" =~ "${FORMATED_BRANCH_NAME::-1}" ]]; then
            deleteFeatureBranch $DEPLOYED_BRANCH
        fi

        # check for deleted and not merged branches
        if [[ ! "${MY_BRANCHES[@]}" =~ "${DEPLOYED_BRANCH::-1}" ]]; then
            deleteFeatureBranch $DEPLOYED_BRANCH
        fi
    fi
done
