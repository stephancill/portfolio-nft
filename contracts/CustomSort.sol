// SPDX-License-Identifier: Unlicense
pragma solidity >=0.5.15;

/**
 * @title Quicksort library in Solidity
 * @author Subhod I (https://gist.github.com/subhodi/b3b86cc13ad2636420963e692a4d896f)
 */
library CustomSort {
    struct AddressBalanceValue {
        address addr;
        uint256 balance;
        uint256 value;
    }

    function sortByValue(AddressBalanceValue[100] memory arr, int left, int right) internal view {
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

    // Sorry
    function sortByAddress(AddressBalanceValue[100] memory arr, int left, int right) internal view {
        int i = left;
        int j = right;
        if(i==j) return;
        AddressBalanceValue memory pivot = arr[uint(left + (right - left) / 2)];
        while (i <= j) {
            while (arr[uint(i)].addr > pivot.addr) i++;
            while (pivot.addr > arr[uint(j)].addr) j--;
            if (i <= j && arr[uint(i)].value == 0) {
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