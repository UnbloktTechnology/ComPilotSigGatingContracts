// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Proxy} from "@openzeppelin/contracts/proxy/Proxy.sol";
import "../interfaces/INexeraVerifierEntrypoint.sol";

/// @title ProxyAavePool
/// @notice This example contract acts as a proxy for interacting with the Aave Pool,
/// integrating with the Nexera entrypoint verifier for gating users.
contract ProxyAavePool is Proxy {
    // Address of the Aave Pool on the Mumbai network.
    address public constant aavePoolAddress =
        0xcC6114B983E4Ed2737E9BD3961c9924e6216c704;

    // Event to emit when Ether is received
    event Received(address sender, uint amount);

    // Address of the Nexera Verifier.
    address public nexeraVerifierAddress;

    /// @dev Constructor that sets the Nexera Verifier address.
    /// @param _nexeraVerifierAddress Address of the Nexera Verifier contract.
    constructor(address _nexeraVerifierAddress) {
        nexeraVerifierAddress = _nexeraVerifierAddress;
    }

    /// @dev Returns the address of the implementation contract (the aave pool being proxied).
    /// @return The address of the Aave Pool contract.
    function _implementation() internal pure override returns (address) {
        return aavePoolAddress;
    }

    /// @notice Delegates the supply function call to the Aave Pool.
    /// @dev we add this in addition to the fallback in order to get it in the generated interface
    /// @param _token Address of the token being supplied.
    /// @param _amount Amount of the token to supply.
    /// @param _user Address of the user on whose behalf the supply is made.
    function supply(address _token, uint256 _amount, address _user) public {
        _delegateWithChecks();
    }

    /// @notice Delegates the supplyWithPermit function call to the Aave Pool.
    /// @dev we add this in addition to the fallback in order to get it in the generated interface
    /// @param asset Address of the asset.
    /// @param amount Amount of the asset.
    /// @param onBehalfOf Address of the user on whose behalf the supply is made.
    /// @param referralCode Referral code.
    /// @param deadline Deadline after which the permit is no longer valid.
    /// @param permitV V component of the permit signature.
    /// @param permitR R component of the permit signature.
    /// @param permitS S component of the permit signature.
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
            INexeraVerifierEntrypoint(nexeraVerifierAddress)
                .isAllowedForEntrypoint(msg.sender),
            "User is not whitelisted"
        );

        _delegateWithChecks();
    }

    /// @dev Fallback function that delegates calls to the Aave Pool.
    fallback() external payable override {
        _delegateWithChecks();
    }

    /**
     * @dev Receive function to handle plain Ether transfers to the contract.
     * Emits a {Received} event.
     */
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    /// @dev Internal function to delegate calls to the Aave Pool after checking the implementation address and user whitelisting.
    function _delegateWithChecks() internal {
        address _impl = aavePoolAddress;
        require(_impl != address(0), "Implementation address not set");
        require(
            INexeraVerifierEntrypoint(nexeraVerifierAddress)
                .isAllowedForEntrypoint(msg.sender),
            "User is not whitelisted"
        );
        _delegate(aavePoolAddress);
    }
}
