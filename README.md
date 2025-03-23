# MetaKeep Transaction Manager

A React TypeScript application for managing cryptocurrency transactions through MetaKeep integration. This application provides both developer and user interfaces for handling smart contract interactions and direct token transfers.

## Architecture

The application is built with the following architecture:

### Core Components

1. **DeveloperView**
   - Allows developers to create transaction links
   - Handles smart contract ABI parsing
   - Generates shareable transaction URLs
   - Features test data loading for quick testing

2. **UserView**
   - Executes transactions from generated links
   - Handles MetaKeep wallet integration
   - Manages transaction parameters and execution
   - Displays transaction status and results

3. **DirectTransfer**
   - Facilitates direct token transfers
   - Simplifies the transfer process for users

4. **Login**
   - Manages user authentication through MetaKeep
   - Handles wallet connection and session management

### Technical Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Blockchain Integration**: MetaKeep SDK
- **Build Tool**: Vite
- **Smart Contract Interaction**: ethers.js

## Features

### For Developers

1. **Transaction Link Generation**
   - Parse and validate smart contract ABIs
   - Select contract functions for execution
   - Generate shareable transaction links
   - Test data loading for quick prototyping

2. **Contract Integration**
   - Support for multiple blockchain networks
   - Custom RPC URL configuration
   - Function parameter management
   - ABI validation and parsing

### For Users

1. **Transaction Execution**
   - Execute transactions from shared links
   - View transaction parameters and details
   - Real-time transaction status updates
   - Transaction hash tracking

2. **Wallet Integration**
   - Seamless MetaKeep wallet connection
   - Account management
   - Network switching support
   - Balance checking

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Create a `.env` file with your MetaKeep App ID
   - Set up necessary network configurations

3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

### Developer Flow

1. Navigate to the Developer View
2. Input contract details:
   - Paste the contract ABI
   - Enter the contract address
   - Specify the chain ID and RPC URL
3. Select a contract function
4. Generate and share the transaction link

### User Flow

1. Access the shared transaction link
2. Connect MetaKeep wallet
3. Review transaction details
4. Execute the transaction
5. View transaction status and confirmation

## Smart Contract Integration

### Supported Functions

1. **Transfer**
   - Direct token transfers between addresses
   - Parameter handling for amount and recipient

2. **Custom Functions**
   - Support for any contract function through ABI parsing
   - Dynamic parameter handling
   - Transaction value management for payable functions

### Network Support

- BSC Testnet (Chain ID: 97)
- Additional networks can be added through configuration

## Security Considerations

- Secure wallet integration through MetaKeep
- No storage of private keys
- Transaction parameter validation
- Network security checks

## Error Handling

- Invalid ABI detection
- Network connection issues
- Transaction failure management
- Wallet connection error handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT