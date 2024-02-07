
export const CredentialAtomicQuerySigValidatorABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "version",
        "type": "uint8"
      }
    ],
    "name": "Initialized",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "VERSION",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSupportedCircuitIds",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "ids",
        "type": "string[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "gistRootExpirationTimeout",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_verifierContractAddr",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_stateContractAddr",
        "type": "address"
      }
    ],
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      }
    ],
    "name": "inputIndexOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256[]",
        "name": "inputs",
        "type": "uint256[]"
      }
    ],
    "name": "parseCommonPubSignals",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "merklized",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "userID",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "issuerState",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "circuitQueryHash",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "requestID",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "challenge",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "gistRoot",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "issuerID",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "isRevocationChecked",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "issuerClaimNonRevState",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct CredentialAtomicQueryValidator.CommonPubSignals",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "proofExpirationTimeout",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "revocationStateExpirationTimeout",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "expirationTimeout",
        "type": "uint256"
      }
    ],
    "name": "setGISTRootExpirationTimeout",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "expirationTimeout",
        "type": "uint256"
      }
    ],
    "name": "setProofExpirationTimeout",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "expirationTimeout",
        "type": "uint256"
      }
    ],
    "name": "setRevocationStateExpirationTimeout",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "stateContractAddr",
        "type": "address"
      }
    ],
    "name": "setStateAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "state",
    "outputs": [
      {
        "internalType": "contract IState",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256[]",
        "name": "inputs",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[2]",
        "name": "a",
        "type": "uint256[2]"
      },
      {
        "internalType": "uint256[2][2]",
        "name": "b",
        "type": "uint256[2][2]"
      },
      {
        "internalType": "uint256[2]",
        "name": "c",
        "type": "uint256[2]"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "verify",
    "outputs": [],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
