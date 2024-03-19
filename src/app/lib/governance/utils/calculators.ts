import BigNumber from 'bignumber.js';

export const getProposalQuorumPercent = (
    upvotes: BigNumber,
    totalVotingPower: BigNumber,
): BigNumber => {
    return upvotes.div(totalVotingPower).multipliedBy(100)
};

export const getPromotionQuorumPercent = (
    totalYay: BigNumber,
    totalNay: BigNumber,
    totalPass: BigNumber,
    totalVotingPower: BigNumber,
): BigNumber => {
    return totalYay.plus(totalNay).plus(totalPass).div(totalVotingPower).multipliedBy(100)
};

export const getPromotionSupermajorityPercent = (
    totalYay: BigNumber,
    totalNay: BigNumber,
): BigNumber => {
    if (totalYay.isZero() && totalNay.isZero())
        return BigNumber(0);
    return totalYay.div(totalYay.plus(totalNay)).multipliedBy(100)
};

export const getFirstBlockOfPeriod = (
    periodIndex: BigNumber,
    startedAtLevel: BigNumber,
    periodLength: BigNumber
): BigNumber => {
    return startedAtLevel.plus(periodIndex.multipliedBy(periodLength));
}

export const getLastBlockOfPeriod = (
    periodIndex: BigNumber,
    startedAtLevel: BigNumber,
    periodLength: BigNumber
): BigNumber => {
    return getFirstBlockOfPeriod(periodIndex.plus(1), startedAtLevel, periodLength).minus(1);
}

export const getCurrentPeriodIndex = (
    currentBlockLevel: BigNumber,
    startedAtLevel: BigNumber,
    periodLength: BigNumber
): BigNumber => {
    return currentBlockLevel.minus(startedAtLevel).dividedToIntegerBy(periodLength);
}