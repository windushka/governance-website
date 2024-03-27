import { ContractResponse, RpcClient, RPCRunScriptViewParam, RunScriptViewResult } from '@taquito/rpc';

export class HistoricalRpcClient extends RpcClient {
  private blockLevel: bigint;

  constructor(url: string, blockLevel: bigint) {
    super(url);
    this.blockLevel = blockLevel;
  }

  setBlockLevel(blockLevel: bigint) {
    this.blockLevel = blockLevel;
  }

  getContract(address: string, _?: { block: string; } | undefined): Promise<ContractResponse> {
    return super.getContract(address, { block: this.blockLevel.toString(10) })
  }

  runScriptView(params: RPCRunScriptViewParam, _?: { block: string; }): Promise<RunScriptViewResult> {
    return super.runScriptView(params, { block: this.blockLevel.toString(10) })
  }
}