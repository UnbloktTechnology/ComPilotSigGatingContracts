// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Proxy} from "@openzeppelin/contracts/proxy/Proxy.sol";
import "./interfaces/INexeraVerifierEntrypoint.sol";

// this contract uses the INexeraVerifierEntrypoint instead of NexeraVerifierEntrypoint
contract ProxyAavePool is Proxy {
  // Aave Pool address for Mumbai
  address public constant aavePoolAddress =
    0xcC6114B983E4Ed2737E9BD3961c9924e6216c704;

  // Nexera Verifier Address
  address public nexeraVerifierAddress;

  constructor(address _nexeraVerifierAddress) {
    nexeraVerifierAddress = _nexeraVerifierAddress;
  }

  function _implementation() internal pure override returns (address) {
    return aavePoolAddress;
  }

  function supply(address _token, uint256 _amount, address _user) public {
    address _impl = aavePoolAddress;
    require(_impl != address(0), "Implementation address not set");
    require(
      INexeraVerifierEntrypoint(nexeraVerifierAddress).isAllowedForEntrypoint(
        msg.sender
      ),
      "User is not whitelisted"
    );

    _delegate(aavePoolAddress);
  }

  function supplyWithPermit(
    address asset,
    uint256 amount,
    address onBehalfOf,
    uint16 referralCode,
    uint256 deadline,
    uint8 permitV,
    bytes32 permitR,
    bytes32 permitS
  ) public {
    address _impl = aavePoolAddress;
    require(_impl != address(0), "Implementation address not set");
    require(
      INexeraVerifierEntrypoint(nexeraVerifierAddress).isAllowedForEntrypoint(
        msg.sender
      ),
      "User is not whitelisted"
    );

    _delegate(aavePoolAddress);
  }

  fallback() external payable override {
    address _impl = aavePoolAddress;
    require(_impl != address(0), "Implementation address not set");
    require(
      INexeraVerifierEntrypoint(nexeraVerifierAddress).isAllowedForEntrypoint(
        msg.sender
      ),
      "User is not whitelisted"
    );

    _delegate(aavePoolAddress);
  }
}
