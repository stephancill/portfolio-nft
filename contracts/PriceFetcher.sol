// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@openzeppelin/contracts/interfaces/IERC20Metadata.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IPriceFetcher.sol";
import "./libraries/CustomSort.sol";

import "hardhat/console.sol";

contract PriceFetcher is Ownable, IPriceFetcher {

    struct Counter {
        uint256 value;
    }

    struct PairWithPrice {
        IUniswapV2Pair pair;
        uint256 price;
        address inToken;
        address outToken;
    }

    uint256 constant public DECIMALS = 6;

    constructor() {}

    function quote(address[] memory _path, address _tokenIn, address _tokenOut) public view override returns (uint256, uint256) {
        if (_path.length == 0) {
            return (0, DECIMALS);
        }

        if (_tokenIn == _tokenOut) {
            return (1, DECIMALS);
        }

        require(involvesToken(_tokenIn, IUniswapV2Pair(_path[0])), "First pool does not contain _tokenIn");
        
        address currentTokenAddress = _tokenIn;
        uint256 price = 0;
        for (uint256 i = 0; i < _path.length; i++) {
            // console.log(IERC20Metadata(currentTokenAddress).symbol(), IERC20Metadata(_path[i]).symbol());
            
            IUniswapV2Pair pair = IUniswapV2Pair(_path[i]);
            uint256 pairPrice = quoteForPair(pair, currentTokenAddress);

            if (price == 0) {
                price = pairPrice;
            } else {
                price *= pairPrice / uint256(10**DECIMALS);
            }

            currentTokenAddress = indexOfTokenInPair(currentTokenAddress, pair) == 0 ? pair.token1() : pair.token0();
        }
        require(currentTokenAddress == _tokenOut, "Invalid path");
        
        return (price, DECIMALS);
    }

    function quoteForPair(IUniswapV2Pair _pair, address _tokenAddress) public view returns (uint256) {
        address otherTokenAddress = _pair.token0() == _tokenAddress ? _pair.token1() : _pair.token0();

        IERC20Metadata token = IERC20Metadata(_tokenAddress);
        IERC20Metadata otherToken = IERC20Metadata(otherTokenAddress);

        (uint res0, uint res1,) = _pair.getReserves();

        if (_pair.token0() != otherTokenAddress) {
            uint temp = res0;
            res0 = res1;
            res1 = temp;
        }

        // decimals
        res0 = res0 * (10**token.decimals());
        res1 = res1 * (10**(otherToken.decimals()-DECIMALS));
        
        uint256 price = res0 / res1; // amount of otherToken needed to buy token

        return price;
    }

    function indexOfTokenInPair(address _tokenAddress, IUniswapV2Pair _pair) private view returns (int256) {
        if (_pair.token0() == _tokenAddress) {
            return 0;
        } else if (_pair.token1() == _tokenAddress) {
            return 1;
        } else {
            return -1;
        }
    }

    function involvesToken(address _tokenAddress, IUniswapV2Pair _pair) public view returns (bool) {
        return indexOfTokenInPair(_tokenAddress, _pair) != -1;
    }
}