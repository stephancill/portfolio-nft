// SPDX-License-Identifier: Unlicense
pragma solidity >=0.5.15;

import "./PortfolioData.sol";

/**
 * @title Quicksort library in Solidity
 * @author Subhod I (https://gist.github.com/subhodi/b3b86cc13ad2636420963e692a4d896f)
 */
library CustomSort {
    function sort(uint256[] memory arr, int left, int right) internal view {
        int i = left;
        int j = right;
        if(i==j) return;
        uint256 pivot = arr[uint(left + (right - left) / 2)];
        while (i <= j) {
            while (arr[uint(i)] > pivot) i++;
            while (pivot > arr[uint(j)]) j--;
            if (i <= j) {
                uint tmp = arr[uint(j)];
                arr[uint(j)] = arr[uint(i)];
                arr[uint(i)] = tmp;
                i++;
                j--;
            }
        }
        if (left < j)
            sort(arr, left, j);
        if (i < right)
            sort(arr, i, right);
    }
 

    function sortByValue(AddressBalanceValue[] memory arr, int left, int right) internal view {
        int i = left;
        int j = right;
        if(i==j) return;
        AddressBalanceValue memory pivot = arr[uint(left + (right - left) / 2)];
        while (i <= j) {
            while (arr[uint(i)].value > pivot.value) i++;
            while (pivot.value > arr[uint(j)].value) j--;
            if (i <= j) {
                AddressBalanceValue memory tmp = arr[uint(j)];
                arr[uint(j)] = arr[uint(i)];
                arr[uint(i)] = tmp;
                i++;
                j--;
            }
        }
        if (left < j)
            sortByValue(arr, left, j);
        if (i < right)
            sortByValue(arr, i, right);
    }
}