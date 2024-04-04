export const getPeriodPageUrl = (contractName: string, periodIndex?: string) => {
  return `/${contractName}/period${periodIndex !== undefined ? `/${periodIndex}` : ''}`;
}
