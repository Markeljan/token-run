// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.4.0/contracts/token/ERC20/ERC20.sol";

contract TokenRunCoin is ERC20 {
    constructor() ERC20("Token Run Coin", "TRC") {
    }

    function mintTokens(uint256 amount) public {
        _mint(msg.sender, amount);
    }
}