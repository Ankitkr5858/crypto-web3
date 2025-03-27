/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { ContractDetails, TransactionLink } from '../types';
import { Share2, Code2, Check, Copy, AlertCircle } from 'lucide-react';

const DeveloperView: React.FC = () => {
  const [contractDetails, setContractDetails] = useState<ContractDetails>({
    abi: '',
    chainId: '',
    rpcUrl: '',
    address: '',
    decimals: 18,
  });
  const [selectedFunction, setSelectedFunction] = useState('');
  const [transactionLink, setTransactionLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [abiError, setAbiError] = useState<string | null>(null);

  const validateABI = (abiString: string): boolean => {
    try {
      const parsed = JSON.parse(abiString);
      
      if (!Array.isArray(parsed)) {
        setAbiError('ABI must be a JSON array');
        return false;
      }

      const hasFunctions = parsed.some(item => item.type === 'function');
      if (!hasFunctions) {
        setAbiError('ABI must contain at least one function');
        return false;
      }

      for (const item of parsed) {
        if (item.type === 'function') {
          if (!item.name || typeof item.name !== 'string') {
            setAbiError(`Function is missing a valid name`);
            return false;
          }

          if (!Array.isArray(item.inputs)) {
            setAbiError(`Function ${item.name} has invalid inputs format`);
            return false;
          }

          if (!Array.isArray(item.outputs)) {
            setAbiError(`Function ${item.name} has invalid outputs format`);
            return false;
          }

          const validMutabilities = ['pure', 'view', 'nonpayable', 'payable'];
          if (!validMutabilities.includes(item.stateMutability)) {
            setAbiError(`Function ${item.name} has invalid stateMutability`);
            return false;
          }
        }
      }

      setAbiError(null);
      return true;
    } catch (e) {
      setAbiError('Invalid JSON format');
      return false;
    }
  };

  const handleContractDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContractDetails(prev => ({ ...prev, [name]: value }));
    if (name === 'abi') {
      validateABI(value);
    }
  };

  const loadDummyData = () => {
    const dummyABI = [
      {
        "inputs": [{"internalType": "address","name": "account","type": "address"}],
        "name": "balanceOf",
        "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {"internalType": "address","name": "to","type": "address"},
          {"internalType": "uint256","name": "value","type": "uint256"}
        ],
        "name": "transfer",
        "outputs": [{"internalType": "bool","name": "","type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {"internalType": "address","name": "spender","type": "address"},
          {"internalType": "uint256","name": "value","type": "uint256"}
        ],
        "name": "approve",
        "outputs": [{"internalType": "bool","name": "","type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "decimals",
        "outputs": [{"internalType": "uint8","name": "","type": "uint8"}],
        "stateMutability": "view",
        "type": "function"
      }
    ];

    setContractDetails({
      abi: JSON.stringify(dummyABI, null, 2),
      chainId: "137",
      rpcUrl: 'https://polygon.llamarpc.com',
      address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' ,
      decimals: 6,
    });
    setAbiError(null);
  };

  const parseABI = () => {
    try {
      if (!contractDetails.abi) return [];
      const parsedABI = JSON.parse(contractDetails.abi);
      return parsedABI
        .filter((item: any) => item.type === 'function')
        .map((func: any) => func.name);
    } catch (error) {
      return [];
    }
  };

  const generateLink = () => {
    if (!validateABI(contractDetails.abi)) return;
    if (!contractDetails.address) {
      setAbiError('Contract address is required');
      return;
    }
    if (!selectedFunction) {
      setAbiError('Please select a function');
      return;
    }

    const link: TransactionLink = {
      contractDetails,
      functionName: selectedFunction,
      parameters: ['', ''],
    };
    
    const encodedData = encodeURIComponent(JSON.stringify(link));
    const baseUrl = window.location.origin;
    setTransactionLink(`${baseUrl}/execute/${encodedData}`);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(transactionLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const isFormValid = () => {
    return contractDetails.abi && 
           contractDetails.address && 
           selectedFunction && 
           !abiError;
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create Transaction Link</h1>
        <button
          onClick={loadDummyData}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Code2 size={20} />
          Load Test Data
        </button>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Smart Contract ABI</label>
          <textarea
            name="abi"
            value={contractDetails.abi}
            onChange={handleContractDetailsChange}
            className={`w-full p-3 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              abiError ? 'border-red-500 bg-red-50' : 'bg-gray-50'
            }`}
            rows={8}
            placeholder="Paste your contract ABI here..."
            spellCheck="false"
          />
          {abiError && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle size={16} />
              <span>{abiError}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Chain ID</label>
            <input
              type="text"
              name="chainId"
              value={contractDetails.chainId}
              onChange={handleContractDetailsChange}
              className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 80001 for Mumbai Testnet"
            />
               <label className="block text-sm font-medium text-gray-700">Decimals</label>
              <input
              type="text"
              name="decimals"
              value={contractDetails.decimals}
              onChange={handleContractDetailsChange}
              className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 80001 for Mumbai Testnet"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">RPC URL</label>
            <input
              type="text"
              name="rpcUrl"
              value={contractDetails.rpcUrl}
              onChange={handleContractDetailsChange}
              className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., https://rpc-mumbai.maticvigil.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Contract Address</label>
          <input
            type="text"
            name="address"
            value={contractDetails.address}
            onChange={handleContractDetailsChange}
            className="w-full p-3 border rounded-lg font-mono bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0x..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Contract Function</label>
          <select
            value={selectedFunction}
            onChange={(e) => setSelectedFunction(e.target.value)}
            className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a function</option>
            {parseABI().map((func: string) => (
              <option key={func} value={func}>{func}</option>
            ))}
          </select>
        </div>

        <button
          onClick={generateLink}
          disabled={!isFormValid()}
          className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-white font-medium transition-colors ${
            !isFormValid() ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <Share2 size={20} />
          Generate Link
        </button>

        {transactionLink && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-900">Transaction Link</h3>
              <button
                onClick={copyToClipboard}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
            <a
              href={transactionLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:text-blue-800 break-all font-mono text-sm"
            >
              {transactionLink}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeveloperView;