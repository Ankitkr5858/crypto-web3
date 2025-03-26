export interface ContractDetails {
  decimals: number;
  abi: string;
  chainId: string;
  rpcUrl: string;
  address: string;
}

export interface TransactionLink {
  contractDetails: ContractDetails;
  functionName: string;
  parameters: any[];
}