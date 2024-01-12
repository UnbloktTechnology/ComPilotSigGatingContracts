// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.16;

/// @title IVerifier
/// @notice Interface for the Verifier contract, defining the verification function for Zero-Knowledge Proofs.
interface IVerifier {
  /// @notice Verifies a Zero-Knowledge Proof.
  /// @param a Component 'a' of the ZKP.
  /// @param b Component 'b' of the ZKP.
  /// @param c Component 'c' of the ZKP.
  /// @param input Public inputs for the ZKP.
  /// @return r Boolean indicating the result of the verification.
  function verify(
    uint256[2] calldata a,
    uint256[2][2] calldata b,
    uint256[2] calldata c,
    uint256[] calldata input
  ) external view returns (bool r);
}
