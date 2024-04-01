import BigNumber from 'bignumber.js';

const toBigNumber = (value: BigNumber | bigint | number): BigNumber => {
  return typeof value === 'number'
    ? BigNumber(value)
    : typeof value === 'bigint'
      ? BigNumber(value.toString(10))
      : value;
}

export const getProposalQuorumPercent = (
  upvotes: bigint,
  totalVotingPower: bigint,
): BigNumber => {
  return toBigNumber(upvotes).div(toBigNumber(totalVotingPower)).multipliedBy(100)
};

export const getPromotionQuorumPercent = (
  totalYay: bigint,
  totalNay: bigint,
  totalPass: bigint,
  totalVotingPower: bigint,
): BigNumber => {
  return toBigNumber(totalYay)
    .plus(toBigNumber(totalNay))
    .plus(toBigNumber(totalPass))
    .div(toBigNumber(totalVotingPower))
    .multipliedBy(100)
};

export const getPromotionSupermajorityPercent = (
  totalYea: bigint,
  totalNay: bigint
): BigNumber => {
  const totalYeaBN = toBigNumber(totalYea);
  const totalNayBN = toBigNumber(totalNay);

  if (totalYeaBN.isZero() && totalNayBN.isZero())
    return BigNumber(0);

  return totalYeaBN.div(totalYeaBN.plus(totalNayBN)).multipliedBy(100)
};

export const getVotingPowerPercent = (
  votingPower: bigint,
  totalVotingPower: bigint
): BigNumber => {
  const votingPowerBN = toBigNumber(votingPower);
  const totalVotingPowerBN = toBigNumber(totalVotingPower);

  return votingPowerBN.multipliedBy(100).div(totalVotingPowerBN);
};


export const getFirstBlockOfPeriod = (
  periodIndex: number,
  startedAtLevel: number,
  periodLength: number
): number => {
  return startedAtLevel + (periodIndex * periodLength);
}

export const getLastBlockOfPeriod = (
  periodIndex: number,
  startedAtLevel: number,
  periodLength: number
): number => {
  return getFirstBlockOfPeriod(periodIndex + 1, startedAtLevel, periodLength) - 1;
}

export const getCurrentPeriodIndex = (
  currentBlockLevel: number,
  startedAtLevel: number,
  periodLength: number
): number => {
  return Math.floor((currentBlockLevel - startedAtLevel) / periodLength);
}

export const natToPercent = (
  value: number,
  scale: number
): BigNumber => {
  return toBigNumber(value).multipliedBy(100).div(toBigNumber(scale));
}

export const getEstimatedBlockCreationTime = (level: number, currentLevel: number, timeBetweenBlocks: number): Date => {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const restSeconds = (level - currentLevel) * timeBetweenBlocks;
  return new Date((nowSeconds + parseInt(restSeconds.toString())) * 1000);
}