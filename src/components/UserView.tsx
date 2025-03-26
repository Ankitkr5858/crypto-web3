import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MetaKeep } from 'metakeep';
import { Send, Wallet, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { TransactionLink } from '../types';
import { ethers } from 'ethers';

const TEST_APP_ID = '3122c75e-8650-4a47-8376-d1dda7ef8c58';

const UserView: React.FC = () => {
  const { data } = useParams();
  const [transactionDetails, setTransactionDetails] = useState<TransactionLink | null>(null);
  const [sdk, setSdk] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [functionAbi, setFunctionAbi] = useState<any>(null);
  const [transactionHash, setTransactionHash] = useState('');
  const [functionInputs, setFunctionInputs] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (data) {
      try {
        const decoded = JSON.parse(decodeURIComponent(data));
        setTransactionDetails(decoded);
        if (decoded.contractDetails.abi) {
          const abiData = JSON.parse(decoded.contractDetails.abi);
          const foundFunction = abiData.find((item: any) =>
            item.type === 'function' && item.name === decoded.functionName
          );
          if (foundFunction) {
            setFunctionAbi(foundFunction);
            const initialInputs: { [key: string]: string } = {};
            foundFunction.inputs.forEach((input: any) => {
              initialInputs[input.name] = '';
            });
            setFunctionInputs(initialInputs);
          }
        }
      } catch (error) {
        setError('Invalid transaction data');
      }
    }
  }, [data]);

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        setConnecting(true);
        const chainId = transactionDetails?.contractDetails?.chainId
        const rpcUrl = transactionDetails?.contractDetails?.rpcUrl
        if (!chainId || !rpcUrl) return
        const metakeepSDK = new MetaKeep({
          appId: TEST_APP_ID,
          chainId: Number(chainId),
          rpcNodeUrls: {
            [Number(chainId)]: rpcUrl,
          },
        });
        setSdk(metakeepSDK);
        const user = await metakeepSDK.getUser();
        if (!user) {
          await metakeepSDK.login();
        }
        const wallet = await metakeepSDK.getWallet();
        if (wallet) {
          setWalletAddress(wallet?.wallet?.ethAddress);
        }

        setError('');
      } catch (error: any) {
        setError('Failed to initialize MetaKeep SDK. Please try again.');
      } finally {
        setConnecting(false);
      }
    };

    if (transactionDetails) {
      initializeSDK();
    } else {
      setConnecting(false);
    }
  }, [transactionDetails]);

  const handleInputChange = (name: string, value: string) => {
    setFunctionInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

const executeTransaction = async () => {
  if (!transactionDetails || !sdk || !functionAbi) return;

  setLoading(true);
  setError('');
  setTransactionHash('');

  try {
    const web3Provider = await sdk.ethereum;
    await web3Provider.enable();
    const ethersProvider = new ethers.providers.Web3Provider(web3Provider);
    const signer = ethersProvider.getSigner();

    const contract = new ethers.Contract(
      transactionDetails.contractDetails.address,
      [functionAbi],
      functionAbi.stateMutability === 'view' || functionAbi.stateMutability === 'pure' 
        ? ethersProvider 
        : signer
    );
    const params = functionAbi.inputs.map((input: any) => {
      if (input.type === 'address') return functionInputs[input.name];
      if (input.type.includes('uint')) {
        const decimals = transactionDetails?.contractDetails?.decimals || 6;
        return ethers.utils.parseUnits(functionInputs[input.name], decimals);
      }
      return functionInputs[input.name];
    });
    
    const overrides: ethers.CallOverrides = {};
    if (functionAbi.stateMutability === 'payable') {
      const valueInput = functionAbi.inputs.find(
        (input: any) => input.type === 'uint256' && input.name.toLowerCase().includes('value')
      );
      if (valueInput && functionInputs[valueInput.name]) {
        overrides.value = ethers.utils.parseEther(functionInputs[valueInput.name]);
      }
    }

    if (functionAbi.stateMutability === 'view' || functionAbi.stateMutability === 'pure') {
      const result = await contract[transactionDetails.functionName](...params, overrides);
      if (functionAbi.outputs?.length === 1) {
        const output = functionAbi.outputs[0];
        if (output.type.includes('uint')) {
          const decimals = transactionDetails?.contractDetails?.decimals || 6;
          alert(`Result: ${ethers.utils.formatUnits(result, decimals)}`);
        } else {
          alert(`Result: ${result.toString()}`);
        }
      } else {
        alert(`Result: ${JSON.stringify(result)}`);
      }
    } else {
      const tx = await contract[transactionDetails.functionName](...params, overrides);
      setTransactionHash(tx.hash);
      const receipt = await tx.wait();
    }
  } catch (error: any) {
    console.error('Transaction failed:', error);
    let errorMsg = 'Transaction failed';
    if (error.code === 'INSUFFICIENT_FUNDS') {
      errorMsg = 'Insufficient funds for gas fees';
    } else if (error.reason) {
      errorMsg = error.reason;
    } else if (error.message) {
      errorMsg = error.message;
    } else if (error.data?.message) {
      errorMsg = error.data.message;
    }
    setError(errorMsg);
  } finally {
    setLoading(false);
  }
};

  if (!data) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">No Transaction Found</h1>
          <p className="text-gray-600 mb-6">
            To execute a transaction, you need to access this page through a transaction link generated in the Developer view.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={20} />
            Go to Developer View
          </Link>
        </div>
      </div>
    );
  }

  if (connecting) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 size={40} className="animate-spin mx-auto text-blue-600" />
          <p className="text-lg text-gray-600">Initializing MetaKeep SDK...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 text-red-700 mb-2">
            <AlertCircle size={24} />
            <h2 className="text-lg font-semibold">Error</h2>
          </div>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!transactionDetails) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center text-gray-600">Loading transaction details...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Execute Transaction</h1>
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        {walletAddress && (
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center gap-3">
            <Wallet size={20} className="text-blue-600" />
            <div>
              <div className="font-medium text-blue-900">Connected Wallet</div>
              <div className="font-mono text-sm text-blue-700">{walletAddress}</div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Transaction Details</h2>
          <div className="grid gap-3">
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-sm text-gray-600">Contract Address</div>
              <div className="font-mono">{transactionDetails.contractDetails.address}</div>
            </div>

            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-sm text-gray-600">Function</div>
              <div className="font-medium">
                {transactionDetails.functionName}
                {functionAbi?.stateMutability === 'payable' && (
                  <span className="ml-2 text-sm text-blue-600">(Payable)</span>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-sm text-gray-600">Network</div>
              <div className="font-medium">
                {transactionDetails.contractDetails.chainId === '80001' ? 'Mumbai Testnet' :
                  transactionDetails.contractDetails.chainId === '137' ? 'Polygon Mainnet' :
                    'Unknown Network'} ({transactionDetails.contractDetails.chainId})
              </div>
            </div>

            {functionAbi && functionAbi.inputs.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-md space-y-3">
                <div className="text-sm font-medium text-gray-700">Function Parameters</div>
                {functionAbi.inputs.map((input: any, index: number) => (
                  <div key={input.name} className="space-y-1">
                    <label className="block text-sm text-gray-600">
                      {input.name} ({input.type})
                    </label>
                    <input
                      type={input.type === 'uint256' ? 'number' : 'text'}
                      value={functionInputs[input.name]}
                      onChange={(e) => handleInputChange(input.name, e.target.value)}
                      placeholder={`Enter ${input.name}`}
                      className="w-full p-2 border rounded-md text-sm font-mono bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={executeTransaction}
          disabled={loading || !sdk}
          className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-white font-medium transition-colors
            ${loading || !sdk
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }`}
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Processing Transaction...
            </>
          ) : (
            <>
              <Send size={20} />
              Sign & Execute Transaction
            </>
          )}
        </button>
        {transactionHash && (
          <div className="mt-4 p-3 bg-green-50 rounded-md">
            <div className="text-sm text-green-700 mb-1">Transaction successful!</div>
            <div className="font-mono text-sm break-all">{transactionHash}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserView;
