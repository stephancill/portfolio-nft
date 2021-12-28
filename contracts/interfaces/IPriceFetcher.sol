// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IPriceFetcher {
    function quote(address _baseTokenAddress, address _tokenAddress) external view returns (uint256, uint256);
}