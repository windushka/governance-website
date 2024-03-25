import { ApiProvider } from '@/app/lib/api';
import { callGetVotingStateView, getCurrentPeriodIndex, getFirstBlockOfPeriod, getLastBlockOfPeriod, mapOptionalPayloadKeyDto, mapPeriodType } from '../../utils';
import BigNumber from 'bignumber.js';
import { GovernanceConfig } from '../../config';
import { GovernancePeriod } from '../types';
import { GovernancePeriodsProvider } from './provider';
import { PeriodType } from '../..';
import { TezosToolkit } from '@taquito/taquito';
import { VotingFinishedEventPayload } from '../../contract/views';

export class RpcGovernancePeriodsProvider implements GovernancePeriodsProvider {
  constructor(
    private readonly toolkit: TezosToolkit,
    private readonly apiProvider: ApiProvider
  ) { }

  async getPeriods(contractAddress: string, config: GovernanceConfig): Promise<GovernancePeriod[]> {
    const [finishedEvents, pendingEvent, currentBlockLevel] = await Promise.all([
      this.apiProvider.getVotingFinishedEvents(contractAddress),
      this.getPendingVotingFinishedEvent(contractAddress),
      this.apiProvider.getCurrentBlockLevel()
    ]);

    const periodsFromEvents: GovernancePeriod[] = [];
    if (pendingEvent) {
      const periodIndex = BigNumber(pendingEvent.finished_at_period_index).minus(1);
      periodsFromEvents.push({
        index: periodIndex,
        firstBlockLevel: getFirstBlockOfPeriod(periodIndex, config.startedAtLevel, config.periodLength),
        lastBlockLevel: getLastBlockOfPeriod(periodIndex, config.startedAtLevel, config.periodLength),
        type: mapPeriodType(pendingEvent.finished_at_period_type),
        winnerPayload: mapOptionalPayloadKeyDto(pendingEvent.winner_proposal_payload?.Some || null)
      });
    }
    finishedEvents.forEach(e => {
      const periodIndex = BigNumber(e.finished_at_period_index).minus(1);
      periodsFromEvents.push({
        index: periodIndex,
        firstBlockLevel: getFirstBlockOfPeriod(periodIndex, config.startedAtLevel, config.periodLength),
        lastBlockLevel: getLastBlockOfPeriod(periodIndex, config.startedAtLevel, config.periodLength),
        type: mapPeriodType(e.finished_at_period_type),
        winnerPayload: mapOptionalPayloadKeyDto(e.winner_proposal_payload)
      });
    });

    const result: GovernancePeriod[] = [];
    const currentPeriod = getCurrentPeriodIndex(currentBlockLevel, config.startedAtLevel, config.periodLength);
    let lastPeriodIndex = BigNumber(currentPeriod);

    for (const period of periodsFromEvents) {
      for (let i = lastPeriodIndex; i.gt(period.index); i = i.minus(1)) {
        result.push({
          index: i,
          firstBlockLevel: getFirstBlockOfPeriod(i, config.startedAtLevel, config.periodLength),
          lastBlockLevel: getLastBlockOfPeriod(i, config.startedAtLevel, config.periodLength),
          type: PeriodType.Proposal,
          winnerPayload: null
        })
      }
      result.push(period);
      lastPeriodIndex = period.index.minus(1);
    }

    for (let i = lastPeriodIndex; i.gte(0); i = i.minus(1)) {
      result.push({
        index: i,
        firstBlockLevel: getFirstBlockOfPeriod(i, config.startedAtLevel, config.periodLength),
        lastBlockLevel: getLastBlockOfPeriod(i, config.startedAtLevel, config.periodLength),
        type: PeriodType.Proposal,
        winnerPayload: null
      })
    }

    return result;
  }

  private async getPendingVotingFinishedEvent(contractAddress: string): Promise<VotingFinishedEventPayload | undefined> {
    const stateView = await callGetVotingStateView(contractAddress, this.toolkit);
    return stateView.finished_voting?.Some;
  }
}
