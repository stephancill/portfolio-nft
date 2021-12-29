// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "./IPriceFetcher.sol";

interface IPortfolioNFT is IERC721 {
    function priceFetcher() external view returns (IPriceFetcher);
    function baseTokenAddress() external view returns (address);
    function tokenAddresses() external view returns (address);
    function WETHAddress() external view returns (address);
    function WETHSymbol() external view returns (string memory);
    function getPricePath(uint256 _tokenId, address _tokenAddress) external view returns (address[] memory);
    function getTokenAddresses(uint256 tokenId) external view returns (address[] memory);
}