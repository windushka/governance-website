import BigNumber from 'bignumber.js';

const toBigNumber = (value: BigNumber | bigint): BigNumber => {
  return typeof value === 'bigint' ? BigNumber(value.toString(10)) : value
}

export const getProposalQuorumPercent = (
  upvotes: BigNumber | bigint,
  totalVotingPower: BigNumber | bigint,
): BigNumber => {
  return toBigNumber(upvotes).div(toBigNumber(totalVotingPower)).multipliedBy(100)
};

export const getPromotionQuorumPercent = (
  totalYay: BigNumber | bigint,
  totalNay: BigNumber | bigint,
  totalPass: BigNumber | bigint,
  totalVotingPower: BigNumber | bigint,
): BigNumber => {
  return toBigNumber(totalYay)
    .plus(toBigNumber(totalNay))
    .plus(toBigNumber(totalPass))
    .div(toBigNumber(totalVotingPower))
    .multipliedBy(100)
};

export const getPromotionSupermajorityPercent = (
  totalYea: BigNumber | bigint,
  totalNay: BigNumber | bigint,
): BigNumber => {
  const totalYeaBN = toBigNumber(totalYea);
  const totalNayBN = toBigNumber(totalNay);

  if (totalYeaBN.isZero() && totalNayBN.isZero())
    return BigNumber(0);

  return totalYeaBN.div(totalYeaBN.plus(totalNayBN)).multipliedBy(100)
};

export const getFirstBlockOfPeriod = (
  periodIndex: bigint,
  startedAtLevel: bigint,
  periodLength: bigint
): bigint => {
  return startedAtLevel + (periodIndex * periodLength);
}

export const getLastBlockOfPeriod = (
  periodIndex: bigint,
  startedAtLevel: bigint,
  periodLength: bigint
): bigint => {
  return getFirstBlockOfPeriod(periodIndex + BigInt(1), startedAtLevel, periodLength) - BigInt(1);
}

export const getCurrentPeriodIndex = (
  currentBlockLevel: bigint,
  startedAtLevel: bigint,
  periodLength: bigint
): bigint => {
  return (currentBlockLevel - startedAtLevel) / periodLength;
}

export const natToPercent = (
  value: BigNumber | bigint,
  scale: BigNumber | bigint
): BigNumber => {
  return toBigNumber(value).multipliedBy(100).div(toBigNumber(scale));
}

export const min = (v1: bigint, v2: bigint) => {
  return v1 < v2 ? v1 : v2;
}