# Portfolio NFT

Allows the minter to track their ERC-20 token balances and USD values in an on-chain SVG 
without relying on any third parties.

<img src="example.svg" alt="drawing" width="200"/>

## Usage

```
yarn install
```
```
npx hardhat test
```

### Generate frontend ABIs
```
npx hardhat deploy --export-all ./client/src/contracts.json
```

## Testing
```
npx hardhat test
```

With mainnet forking:
```
FORK=true npx hardhat node --network hardhat
FORK=true npx hardhat task --network localhost
```


## Deployment
### Checklist
- [ ] Use Flashbots RPC to avoid paying for failed transactions
- [ ] Set WETH symbol in `deploy/00_portfolio_nft.js`
- [ ] Set correct name and symbol in `deploy/00_portfolio_nft.js`
- [ ] Remove `hardhat/console.sol` imports

```
npx hardhat deploy --network <network>
npx hardhat etherscan-verify --network <network>
```
