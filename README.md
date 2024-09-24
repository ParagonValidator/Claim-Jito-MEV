
# JITO MEV Claim Script

This repository contains a TypeScript script designed to automate the process of claiming JITO MEV (Maximum Extractable Value) rewards on the Solana blockchain.

## Table of Contents

- [Requirements](#requirements)
- [Setup](#setup)
- [Configuration](#configuration)
- [Usage](#usage)
- [Code Overview](#code-overview)
- [Merkle Tree JSON](#merkle-tree-json)

## Requirements

- Node.js (version 14.x or higher)
- Yarn or npm
- A Solana RPC endpoint
- A Solana wallet keypair file

## Setup

1. Clone this repository:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install the necessary dependencies:

   ```bash
   yarn install
   ```

   or

   ```bash
   npm install
   ```

3. Create a `.env` file in the root of the project directory. This file will hold environment variables necessary for the script to run.

## Configuration

In the `.env` file, you should define the following variables:

- `RPC_URL`: The URL of your Solana RPC endpoint.
- `KEY_PATH`: The path to your wallet's secret key file. This keypair is used to sign transactions.
- `VOTE_ADDRESS`: The public key of the vote account you want to claim MEV for.

Example `.env` file:

```env
RPC_URL=https://api.mainnet-beta.solana.com
KEY_PATH=./path/to/your/solana-wallet.json
VOTE_ADDRESS=YourVoteAccountPublicKeyHere
```

## Usage

Once you have set up your environment variables, you can run the script using:

```bash
yarn start
```

or

```bash
npm run start
```

The script will automatically attempt to claim JITO MEV rewards for the specified vote account.

## Code Overview

### Main Components

- **`TreeNode` Type**: This TypeScript type represent the structure of the Merkle tree's nodes, which store information about the claimants and their corresponding rewards.
- **`findClaimant(claimant: string): Promise<TreeNode | null>`**: This function reads a JSON file (`tree.json`) that contains the Merkle trees and searches for the node corresponding to the specified claimant.
- **`claimJitoMEV()`**: The main function that handles the MEV claiming process:
    1. Initializes a connection to the Solana blockchain.
    2. Fetches the latest epoch information.
    3. Finds the claimant's data in the Merkle tree.
    4. Constructs and signs the transaction to claim MEV rewards.
    5. Sends the transaction to the Solana blockchain.

### Running the Script

The script runs automatically when you execute it, by calling the `claimJitoMEV()` function inside an immediately invoked async function.

## Merkle Tree JSON

The `tree.json` file is required for this script to function. It contains the Merkle tree data for the corresponding epoch and must be downloaded from the following website:

- [Jito Storage](https://console.cloud.google.com/storage/browser/jito-mainnet)

Make sure to download the correct `tree.json` file for the epoch you are targeting and place it in the root directory of this project.

## Notes

- Ensure that your wallet has enough SOL to cover transaction fees.
- The `tree.json` file should be present in the root directory and should contain the Merkle tree data necessary for finding the claimant's information.

## Contact

For questions or issues, please open an issue in the repository or contact us on X.
