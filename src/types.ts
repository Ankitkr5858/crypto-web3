export interface ContractDetails {
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