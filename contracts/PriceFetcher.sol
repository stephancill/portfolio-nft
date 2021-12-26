// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IPriceFetcher.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@openzeppelin/contracts/interfaces/IERC20Metadata.sol";

import "hardhat/console.sol";

contract PriceFetcher is IPriceFetcher  {
    address public pairFactoryAddress;
    IUniswapV2Factory private pairFactory;

    constructor(address _pairFactoryAddress) {
        pairFactoryAddress = _pairFactoryAddress;
        pairFactory = IUniswapV2Factory(_pairFactoryAddress);
    }

    function quote(address _baseTokenAddress, address _tokenAddress) public view override returns (uint256) {
        // https://ethereum.stackexchange.com/a/94173
        // TODO: Check multiple sources for greatest liquidity
        // TODO: Use router to find path with most liquidity
        if (_baseTokenAddress == _tokenAddress) {
            return 1;
        }

        address pairAddress = pairFactory.getPair(_baseTokenAddress, _tokenAddress);
        require(pairAddress != address(0), "Pair does not exist");
        
        IUniswapV2Pair pair = IUniswapV2Pair(pairAddress);

        IERC20Metadata token = IERC20Metadata(_tokenAddress);
        IERC20Metadata baseToken = IERC20Metadata(_baseTokenAddress);

        (uint res0, uint res1,) = pair.getReserves();

        if (pair.token0() != _baseTokenAddress) {
            uint temp = res0;
            res0 = res1;
            res1 = temp;
        }

        // decimals
        res0 = res0 * (10**token.decimals());
        res1 = res1 * (10**baseToken.decimals());
        
        return(res0 / res1); // return amount of baseTokenAddress needed to buy token
    }
}