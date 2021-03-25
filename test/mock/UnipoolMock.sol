pragma solidity ^0.5.0;

import "../../contracts/Unipool.sol";


contract UnipoolMock is Unipool {

    constructor(IERC20 uniToken, IERC20 ziotToken) public {
        uni = uniToken;
        ziot = ziotToken;
    }
}