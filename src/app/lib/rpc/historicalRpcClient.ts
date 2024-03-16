import { ContractResponse, RpcClient } from '@taquito/rpc';
import BigNumber from 'bignumber.js';

export class HistoricalRpcClient extends RpcClient {
    private blockLevel: BigNumber;

    constructor(url: string, blockLevel: BigNumber) {
        super(url);
        this.blockLevel = blockLevel;
    }

    setBlockLevel(blockLevel: BigNumber) {
        this.blockLevel = blockLevel;
    }

    getContract(address: string, _?: { block: string; } | undefined): Promise<ContractResponse> {
        return super.getContract(address, { block: this.blockLevel.toString(10) })
    }
}