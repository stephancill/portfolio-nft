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

    address public pairFactoryAddress;
    IUniswapV2Factory private pairFactory;

    uint256 constant public DECIMALS = 6;

    constructor(address _pairFactoryAddress) {
        setPairFactoryAddress(_pairFactoryAddress);
    }

    function setPairFactoryAddress(address _pairFactoryAddress) public onlyOwner {
        pairFactoryAddress = _pairFactoryAddress;
        pairFactory = IUniswapV2Factory(_pairFactoryAddress);
    }

    function quote(address[] memory _path) public view override returns (uint256, uint256) {
        if (_path.length == 0) {
            return (0, DECIMALS);
        }

        if (_path[0] == _path[1]) {
            return (1, DECIMALS);
        }
        
        address currentTokenAddress = _path[0];
        uint256 price = 0;
        for (uint256 i = 1; i < _path.length; i++) {
            address pairAddress = pairFactory.getPair(currentTokenAddress, _path[i]);

            // console.log(IERC20Metadata(currentTokenAddress).symbol(), IERC20Metadata(_path[i]).symbol());

            require(pairAddress != address(0), "Invalid path");
            
            IUniswapV2Pair pair = IUniswapV2Pair(pairAddress);
            uint256 pairPrice = quoteForPair(pair, currentTokenAddress);

            if (price == 0) {
                price = pairPrice;
            } else {
                price *= pairPrice / uint256(10**DECIMALS);
            }

            currentTokenAddress = _path[i];
            
        }
        return (price, DECIMALS);
    }

    function quoteAllRoutes(address _baseTokenAddress, address _tokenAddress) public view returns (uint256, uint256) {
        // https://ethereum.stackexchange.com/a/94173
        // TODO: Check multiple sources for greatest liquidity
        if (_baseTokenAddress == _tokenAddress) {
            return (1, DECIMALS);
        }

        PairWithPrice[][] memory routes = computeAllRoutes(_tokenAddress, _baseTokenAddress);

        if (routes.length == 0) {
            // TODO: Also return success bool
            return (0, DECIMALS);
        }
        
        uint256[] memory prices = new uint256[](routes.length);

        for (uint256 i = 0; i < routes.length; i++) {
            // Get price for each route
            PairWithPrice[] memory route = routes[i];
            uint256 price;
            for (uint256 j = 0; j < route.length; j++) {
                if (price == 0) {
                    price = route[j].price;
                } else {
                    price *= route[j].price / uint256(10**DECIMALS);
                }
            }
            prices[i] = price;
        }

        CustomSort.sort(prices, 0, int(prices.length-1));

        return (prices[0], DECIMALS);
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

    function getAllPairs() public view returns (IUniswapV2Pair[] memory) {
        uint256 pairCount = pairFactory.allPairsLength();
        IUniswapV2Pair[] memory pairs = new IUniswapV2Pair[](pairCount);
        
        for (uint256 i = 0; i < pairCount; i++) {
            address pairAddress = pairFactory.allPairs(i);
            IUniswapV2Pair pair = IUniswapV2Pair(pairAddress);
            pairs[i] = pair;
        }

        return pairs;
    }

    // Author: Uniswap
    // https://github.com/Uniswap/smart-order-router/blob/bbc5b21b37301bde07f15fc4d652302e90e91eb5/src/routers/alpha-router/functions/compute-all-routes.ts#L55
    function computeAllRoutes(address _tokenIn, address _tokenOut) public view returns (PairWithPrice[][] memory) { 
        IUniswapV2Pair[] memory pools = getAllPairs();
        return computeAllRoutes(
            _tokenIn,
            _tokenOut,
            pools,
            10
        );
    }

    function computeAllRoutes(address _tokenIn, address _tokenOut, IUniswapV2Pair[] memory _pools, uint256 _maxHops) public view returns (PairWithPrice[][] memory) { 
        PairWithPrice[][] memory _routes = new PairWithPrice[][](_pools.length);
        Counter memory _routesCount = Counter(0); // Number to pass by reference
        computeRoutes(
            _tokenIn, 
            _tokenOut, 
            _pools, 
            _maxHops, 
            _routes, 
            _routesCount,
            new PairWithPrice[](_pools.length), 
            0,
            new bool[](_pools.length), 
            address(0)
        );

        return resizeRoutes(_routes, _routesCount.value);
    }

    function computeRoutes(
        address _tokenIn, 
        address _tokenOut, 
        IUniswapV2Pair[] memory _pools, 
        uint256 _maxHops, 
        PairWithPrice[][] memory _routes, 
        Counter memory _routesCount, 
        PairWithPrice[] memory _currentRoute, 
        uint256 _currentRouteCount, 
        bool[] memory _poolsUsed,
        address _previousTokenOut
    ) public view {
        
        if (_currentRouteCount > _maxHops) {
            return;
        }

        if (
            _currentRouteCount > 0 &&
            involvesToken(_tokenOut, _currentRoute[_currentRouteCount-1].pair)
        ) {
            _routes[_routesCount.value++] = resizeRoute(_currentRoute, _currentRouteCount);
            return;
        }

        for (uint256 i = 0; i < _pools.length; i++) {
            if (_poolsUsed[i]) {
                continue;
            }

            IUniswapV2Pair curPool = _pools[i];
            address previousTokenOut = _previousTokenOut != address(0) ? _previousTokenOut : _tokenIn;

            if (!involvesToken(previousTokenOut, curPool)) {
                continue;
            }

            address currentTokenOut = curPool.token0() == previousTokenOut
            ? curPool.token1()
            : curPool.token0();

            uint256 price = quoteForPair(curPool, previousTokenOut);

            _currentRoute[_currentRouteCount++] = PairWithPrice(curPool, price, previousTokenOut, currentTokenOut);
            _poolsUsed[i] = true;

            computeRoutes(
                _tokenIn, 
                _tokenOut, 
                _pools, 
                _maxHops, 
                _routes, 
                _routesCount,
                _currentRoute, 
                _currentRouteCount,
                _poolsUsed, 
                currentTokenOut
            );
            _poolsUsed[i] = false;
            if (_currentRouteCount > 0) {
                _currentRouteCount--;
            }
            
        }
    }

    function resizeRoute(PairWithPrice[] memory _route, uint256 _size) public pure returns (PairWithPrice[] memory) {
        PairWithPrice[] memory route = new PairWithPrice[](_size);
        for (uint256 i = 0; i < _size; i++) {
            route[i] = _route[i];
        }
        return route;
    }

    function resizeRoutes(PairWithPrice[][] memory _routes, uint256 _size) public pure returns (PairWithPrice[][] memory) {
        PairWithPrice[][] memory routes = new PairWithPrice[][](_size);
        for (uint256 i = 0; i < _size; i++) {
            routes[i] = _routes[i];
        }
        return routes;
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