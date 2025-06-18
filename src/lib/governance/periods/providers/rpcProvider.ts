import { BlockchainProvider, VotingFinishedEventPayloadDto } from '@/lib/blockchain';
import { callGetVotingStateView, getCurrentPeriodIndex, getEstimatedBlockCreationTime, getFirstBlockOfPeriod, getLastBlockOfPeriod, mapOptionalPayloadKeyDto, mapPeriodType } from '../../utils';
import { GovernanceConfig } from '../../config';
import { GovernancePeriod } from '../types';
import { GovernancePeriodsProvider } from './provider';
import { PeriodType } from '../..';
import { TezosToolkit } from '@taquito/taquito';
import { VotingFinishedEventPayload } from '../../contract/views';

export class RpcGovernancePeriodsProvider implements GovernancePeriodsProvider {
  constructor(
    private readonly toolkit: TezosToolkit,
    private readonly blockchainProvider: BlockchainProvider
  ) { }

  async getPeriods(contractAddress: string, config: GovernanceConfig): Promise<GovernancePeriod[]> {
    const [
      finishedEvents,
      pendingEvent,
      currentBlockLevel,
      timeBetweenBlocks
    ] = await Promise.all([
      this.blockchainProvider.getVotingFinishedEvents(contractAddress),
      this.getPendingVotingFinishedEvent(contractAddress),
      this.blockchainProvider.getCurrentBlockLevel(),
      this.blockchainProvider.getTimeBetweenBlocks()
    ]);

    const currentPeriodIndex = getCurrentPeriodIndex(currentBlockLevel, config.startedAtLevel, config.periodLength);
    let blockLevels: number[] = [];
    for (let periodIndex = 0; periodIndex <= currentPeriodIndex; periodIndex++) {
      const levels = [getFirstBlockOfPeriod(periodIndex, config.startedAtLevel, config.periodLength), getLastBlockOfPeriod(periodIndex, config.startedAtLevel, config.periodLength)]
      levels.forEach(l => {
        if (l <= currentBlockLevel)
          blockLevels.push(l);
      });
    }
    const blockCreationTimeMap = await this.blockchainProvider.getBlocksCreationTime(blockLevels);
    const periodsFromEventsMap = await this.getPeriodsFromEvents(finishedEvents, pendingEvent, config, currentBlockLevel, timeBetweenBlocks, blockCreationTimeMap);

    const result: GovernancePeriod[] = [];
    for (let i = currentPeriodIndex; i >= 0; i--) {
      const period = periodsFromEventsMap.get(i)
        || this.createEmptyProposalPeriod(i, config, currentBlockLevel, timeBetweenBlocks, blockCreationTimeMap);
      result.push(period);
    }

    const lastKnown = result[0];
    const futurePeriods: GovernancePeriod[] = [];
    const msPerBlock = timeBetweenBlocks * 1000;

    for (let i = 1; i <= 3; i++) {
      const index = lastKnown.index + i;
      const startLevel = getFirstBlockOfPeriod(index, config.startedAtLevel, config.periodLength);
      const endLevel = getLastBlockOfPeriod(index, config.startedAtLevel, config.periodLength);

      const startTime = new Date(lastKnown.endTime.getTime() + (i - 1) * config.periodLength * msPerBlock);
      const endTime = new Date(startTime.getTime() + config.periodLength * msPerBlock);

      futurePeriods.push({
        index,
        startLevel,
        endLevel,
        startTime,
        endTime,
        type: index % 2 === 0 ? PeriodType.Proposal : PeriodType.Promotion,
        winnerPayload: null,
      });
    }

    return [...futurePeriods.reverse() ,...result];
  }

  private async getPeriodsFromEvents(
    finishedEvents: VotingFinishedEventPayloadDto[],
    pendingEvent: VotingFinishedEventPayload | undefined,
    config: GovernanceConfig,
    currentBlockLevel: number,
    timeBetweenBlocks: number,
    blockCreationTimeMap: Map<number, Date>
  ): Promise<Map<number, GovernancePeriod>> {
    const periodsFromEvents: GovernancePeriod[] = [];
    if (pendingEvent)
      periodsFromEvents.push(this.mapEventToPeriod(pendingEvent, config, currentBlockLevel, timeBetweenBlocks, blockCreationTimeMap));
    for await (const e of finishedEvents) {
      periodsFromEvents.push(this.mapEventToPeriod(e, config, currentBlockLevel, timeBetweenBlocks, blockCreationTimeMap));
    }
    return new Map(periodsFromEvents.map(p => [p.index, p]));
  }

  private async getPendingVotingFinishedEvent(contractAddress: string): Promise<VotingFinishedEventPayload | undefined> {
    const stateView = await callGetVotingStateView(contractAddress, this.toolkit);
    return stateView.finished_voting?.Some;
  }

  private mapEventToPeriod(
    event: VotingFinishedEventPayloadDto | VotingFinishedEventPayload,
    config: GovernanceConfig,
    currentBlockLevel: number,
    timeBetweenBlocks: number,
    blockCreationTimeMap: Map<number, Date>
  ): GovernancePeriod {
    const finishedAtPeriodIndex = parseInt(event.finished_at_period_index.toString())
    const periodIndex = finishedAtPeriodIndex - 1;
    const startLevel = getFirstBlockOfPeriod(periodIndex, config.startedAtLevel, config.periodLength);
    const endLevel = getLastBlockOfPeriod(periodIndex, config.startedAtLevel, config.periodLength);
    const rawPayload = event.winner_proposal_payload;
    const payload = rawPayload && typeof rawPayload === 'object' && 'Some' in rawPayload ? rawPayload.Some : rawPayload;

    return {
      index: periodIndex,
      startLevel,
      startTime: this.getBlockCreationTime(startLevel, currentBlockLevel, timeBetweenBlocks, blockCreationTimeMap),
      endLevel,
      endTime: this.getBlockCreationTime(endLevel, currentBlockLevel, timeBetweenBlocks, blockCreationTimeMap),
      type: mapPeriodType(event.finished_at_period_type),
      winnerPayload: mapOptionalPayloadKeyDto(payload)
    };
  }

  private createEmptyProposalPeriod(
    periodIndex: number,
    config: GovernanceConfig,
    currentBlockLevel: number,
    timeBetweenBlocks: number,
    blockCreationTimeMap: Map<number, Date>
  ): GovernancePeriod {
    const startLevel = getFirstBlockOfPeriod(periodIndex, config.startedAtLevel, config.periodLength);
    const endLevel = getLastBlockOfPeriod(periodIndex, config.startedAtLevel, config.periodLength);

    return {
      index: periodIndex,
      startLevel,
      startTime: this.getBlockCreationTime(startLevel, currentBlockLevel, timeBetweenBlocks, blockCreationTimeMap),
      endLevel,
      endTime: this.getBlockCreationTime(endLevel, currentBlockLevel, timeBetweenBlocks, blockCreationTimeMap),
      type: PeriodType.Proposal,
      winnerPayload: null
    };
  }

  private getBlockCreationTime(
    level: number,
    currentBlockLevel: number,
    timeBetweenBlocks: number,
    blockCreationTimeMap: Map<number, Date>
  ): Date {
    return blockCreationTimeMap.get(level) || getEstimatedBlockCreationTime(level, currentBlockLevel, timeBetweenBlocks);
  }
}