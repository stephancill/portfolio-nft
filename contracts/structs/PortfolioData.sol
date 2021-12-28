// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AddressBalanceValue.sol";

struct PortfolioData {
    uint256 tokenId;
    uint256 totalValue;
    uint256 otherValue;
    AddressBalanceValue[4] topTokens;
}