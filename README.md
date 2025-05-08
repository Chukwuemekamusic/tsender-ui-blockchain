# ERC20 Airdrop dApp (Next.js + wagmi)

This is a simple ERC20 Airdrop form built with **Next.js**, **wagmi**, and **Shadcn UI** components. It allows users to input a token address, a list of recipient addresses, and corresponding token amounts to perform a bulk airdrop via a TSender contract.

## Features

- ✅ Read token name, balance, and decimals from ERC20 contracts
- ✅ Automatically approve the airdrop contract if needed
- ✅ Execute airdrop transactions via `airdropERC20`
- ✅ Display transaction details after execution
- ✅ Form input validation with user-friendly alerts
- ✅ UI built using `@shadcn/ui` components

## Tech Stack

- [Next.js (App Router)](https://nextjs.org)
- [wagmi](https://wagmi.sh)
- [viem](https://viem.sh/)
- [shadcn/ui](https://ui.shadcn.com/)
- [ethers](https://docs.ethers.io/)

## Getting Started

### 1. Install dependencies:

```bash
npm install
```

### 2. Start the local Anvil node:

```bash
npm run anvil
```

This will spin up a local testnet using `anvil` and load the pre-deployed TSender contract state from `tsender-deployed.json`.

### 3. Run the development server:

```bash
npm run dev
```

### 4. Open your browser:

Go to [http://localhost:3000](http://localhost:3000)

### 5. Connect wallet to Anvil:

Make sure your browser wallet (e.g. MetaMask) is connected to the local Anvil network (usually on `http://127.0.0.1:8545`).

## Usage

1. **Token Address**: Provide the ERC20 token contract address.

   - For local testing, use the MOCK TOKEN address:

     ```
     0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
     ```

2. **Recipients**: List of wallet addresses separated by newlines or commas.
3. **Amounts**: Token amounts in wei (comma or newline-separated).
4. **Submit**: The app will:

   - Check if sufficient allowance is granted.
   - Approve the airdrop contract if needed.
   - Call `airdropERC20` with the provided details.
   - Show transaction summary.

## Notes

- The airdrop contract address is fetched from `chainsToTSender[chainId].tsender`.
- Token balances and metadata are read using `useReadContracts`.
- Ensure the connected wallet has enough token balance to cover the total amount.

## TODOs & Enhancements

- [ ] Display token name near the input
- [ ] Show equivalent ETH/token values for input amounts
- [ ] Style the submit button (full width, loading state)
- [ ] Validate sufficient token balance before sending

## License

MIT
