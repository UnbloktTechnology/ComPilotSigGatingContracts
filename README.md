# NexeraIDContracts

Repository for the NexeraID Smart Contracts

This repository contains smart contracts developed by Nexera ID to help our customers restrict access to their smart contracts.

There are two ways to do this:

- Signature Based Gating: users are verified in our back-end and receive authorization signatures through our api
- ZKP Based gating: using polygon ID, users can generate ZKPs and get verified on-chain

## Signature Based Gating

`./sig-gating-contracts`

## ZKP Based Gating

`./zkp-gating-contracts`

## SDK

`./contracts-sdk`
Includes deployed addresses, ABIs, signature libs.
