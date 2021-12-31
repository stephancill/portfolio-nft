// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IPriceFetcher {
    function quote(address[] memory _path, address tokenIn, address tokenOut) external view returns (uint256, uint256);
}