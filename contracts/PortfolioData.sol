// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


struct AddressBalanceValue {
    address addr;
    uint256 balance;
    uint256 value;
}

struct PortfolioData {
    uint256 tokenId;
    uint256 totalValue;
    uint256 otherValue;
    AddressBalanceValue[4] topTokens;
}