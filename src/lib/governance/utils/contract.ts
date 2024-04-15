import { TezosToolkit } from '@taquito/taquito';
import { VotingState } from '../contract';

export const callGetVotingStateView = async (contractAddress: string, toolkit: TezosToolkit): Promise<VotingState> => {
  const contract = await toolkit.contract.at(contractAddress);
  const view = contract.contractViews.get_voting_state();
  return await view.executeView({ viewCaller: contractAddress });
}