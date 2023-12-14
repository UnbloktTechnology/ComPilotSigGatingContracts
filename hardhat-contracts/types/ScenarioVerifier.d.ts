/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import type { TypedEventFilter, TypedEvent, TypedListener } from "./common";

interface ScenarioVerifierInterface extends ethers.utils.Interface {
  functions: {
    "REQUESTS_RETURN_LIMIT()": FunctionFragment;
    "addressToId(address)": FunctionFragment;
    "finalizeWhitelistScenario(address)": FunctionFragment;
    "getZKPRequest(uint64)": FunctionFragment;
    "getZKPRequests(uint256,uint256)": FunctionFragment;
    "getZKPRequestsCount()": FunctionFragment;
    "idToAddress(uint256)": FunctionFragment;
    "isAllowedForScenario(address)": FunctionFragment;
    "isRuleIdRegistered(uint64)": FunctionFragment;
    "owner()": FunctionFragment;
    "proofs(address,uint64)": FunctionFragment;
    "queryRequestWhitelist(uint64,address)": FunctionFragment;
    "registeredRuleIDs(uint256)": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "requestIdExists(uint64)": FunctionFragment;
    "scenarioWhitelist(address)": FunctionFragment;
    "setNexeraZKPRequest(uint64,(string,address,bytes))": FunctionFragment;
    "setZKPRequest(uint64,(string,address,bytes))": FunctionFragment;
    "submitZKPResponse(uint64,uint256[],uint256[2],uint256[2][2],uint256[2])": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
    "whitelistScenario(tuple[])": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "REQUESTS_RETURN_LIMIT",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "addressToId", values: [string]): string;
  encodeFunctionData(
    functionFragment: "finalizeWhitelistScenario",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "getZKPRequest",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getZKPRequests",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getZKPRequestsCount",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "idToAddress",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "isAllowedForScenario",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "isRuleIdRegistered",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "proofs",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "queryRequestWhitelist",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "registeredRuleIDs",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "requestIdExists",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "scenarioWhitelist",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "setNexeraZKPRequest",
    values: [
      BigNumberish,
      { metadata: string; validator: string; data: BytesLike }
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "setZKPRequest",
    values: [
      BigNumberish,
      { metadata: string; validator: string; data: BytesLike }
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "submitZKPResponse",
    values: [
      BigNumberish,
      BigNumberish[],
      [BigNumberish, BigNumberish],
      [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
      [BigNumberish, BigNumberish]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "whitelistScenario",
    values: [
      {
        requestId: BigNumberish;
        inputs: BigNumberish[];
        a: [BigNumberish, BigNumberish];
        b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]];
        c: [BigNumberish, BigNumberish];
      }[]
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "REQUESTS_RETURN_LIMIT",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "addressToId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "finalizeWhitelistScenario",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getZKPRequest",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getZKPRequests",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getZKPRequestsCount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "idToAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isAllowedForScenario",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isRuleIdRegistered",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "proofs", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "queryRequestWhitelist",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "registeredRuleIDs",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "requestIdExists",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "scenarioWhitelist",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setNexeraZKPRequest",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setZKPRequest",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "submitZKPResponse",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "whitelistScenario",
    data: BytesLike
  ): Result;

  events: {
    "AddressIdConnection(address,uint256)": EventFragment;
    "OwnershipTransferred(address,address)": EventFragment;
    "RequestRegistered(uint64)": EventFragment;
    "SubmitedAllZKPsForUser(address,tuple[])": EventFragment;
    "UserAllowedForRequest(address,uint64)": EventFragment;
    "UserAllowedForScenario(address)": EventFragment;
    "ZKPRequestSet(uint64,bytes,address,string)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "AddressIdConnection"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RequestRegistered"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SubmitedAllZKPsForUser"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "UserAllowedForRequest"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "UserAllowedForScenario"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ZKPRequestSet"): EventFragment;
}

export type AddressIdConnectionEvent = TypedEvent<
  [string, BigNumber] & { userAddress: string; userId: BigNumber }
>;

export type OwnershipTransferredEvent = TypedEvent<
  [string, string] & { previousOwner: string; newOwner: string }
>;

export type RequestRegisteredEvent = TypedEvent<
  [BigNumber] & { requestId: BigNumber }
>;

export type SubmitedAllZKPsForUserEvent = TypedEvent<
  [
    string,
    ([
      BigNumber,
      BigNumber[],
      [BigNumber, BigNumber],
      [[BigNumber, BigNumber], [BigNumber, BigNumber]],
      [BigNumber, BigNumber]
    ] & {
      requestId: BigNumber;
      inputs: BigNumber[];
      a: [BigNumber, BigNumber];
      b: [[BigNumber, BigNumber], [BigNumber, BigNumber]];
      c: [BigNumber, BigNumber];
    })[]
  ] & {
    userAddress: string;
    zkps: ([
      BigNumber,
      BigNumber[],
      [BigNumber, BigNumber],
      [[BigNumber, BigNumber], [BigNumber, BigNumber]],
      [BigNumber, BigNumber]
    ] & {
      requestId: BigNumber;
      inputs: BigNumber[];
      a: [BigNumber, BigNumber];
      b: [[BigNumber, BigNumber], [BigNumber, BigNumber]];
      c: [BigNumber, BigNumber];
    })[];
  }
>;

export type UserAllowedForRequestEvent = TypedEvent<
  [string, BigNumber] & { userAddress: string; requestId: BigNumber }
>;

export type UserAllowedForScenarioEvent = TypedEvent<
  [string] & { userAddress: string }
>;

export type ZKPRequestSetEvent = TypedEvent<
  [BigNumber, string, string, string] & {
    requestId: BigNumber;
    data: string;
    validator: string;
    metadata: string;
  }
>;

export class ScenarioVerifier extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: ScenarioVerifierInterface;

  functions: {
    REQUESTS_RETURN_LIMIT(overrides?: CallOverrides): Promise<[BigNumber]>;

    addressToId(arg0: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    finalizeWhitelistScenario(
      user: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    getZKPRequest(
      requestId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [
        [string, string, string] & {
          metadata: string;
          validator: string;
          data: string;
        }
      ]
    >;

    getZKPRequests(
      startIndex: BigNumberish,
      length: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [
        ([string, string, string] & {
          metadata: string;
          validator: string;
          data: string;
        })[]
      ]
    >;

    getZKPRequestsCount(overrides?: CallOverrides): Promise<[BigNumber]>;

    idToAddress(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string]>;

    isAllowedForScenario(
      user: string,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    isRuleIdRegistered(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    proofs(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    queryRequestWhitelist(
      arg0: BigNumberish,
      arg1: string,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    registeredRuleIDs(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    requestIdExists(
      requestId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    scenarioWhitelist(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    setNexeraZKPRequest(
      requestId: BigNumberish,
      request: { metadata: string; validator: string; data: BytesLike },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setZKPRequest(
      requestId: BigNumberish,
      request: { metadata: string; validator: string; data: BytesLike },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    submitZKPResponse(
      requestId: BigNumberish,
      inputs: BigNumberish[],
      a: [BigNumberish, BigNumberish],
      b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
      c: [BigNumberish, BigNumberish],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    whitelistScenario(
      zkps: {
        requestId: BigNumberish;
        inputs: BigNumberish[];
        a: [BigNumberish, BigNumberish];
        b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]];
        c: [BigNumberish, BigNumberish];
      }[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  REQUESTS_RETURN_LIMIT(overrides?: CallOverrides): Promise<BigNumber>;

  addressToId(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

  finalizeWhitelistScenario(
    user: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  getZKPRequest(
    requestId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    [string, string, string] & {
      metadata: string;
      validator: string;
      data: string;
    }
  >;

  getZKPRequests(
    startIndex: BigNumberish,
    length: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    ([string, string, string] & {
      metadata: string;
      validator: string;
      data: string;
    })[]
  >;

  getZKPRequestsCount(overrides?: CallOverrides): Promise<BigNumber>;

  idToAddress(arg0: BigNumberish, overrides?: CallOverrides): Promise<string>;

  isAllowedForScenario(
    user: string,
    overrides?: CallOverrides
  ): Promise<boolean>;

  isRuleIdRegistered(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<boolean>;

  owner(overrides?: CallOverrides): Promise<string>;

  proofs(
    arg0: string,
    arg1: BigNumberish,
    overrides?: CallOverrides
  ): Promise<boolean>;

  queryRequestWhitelist(
    arg0: BigNumberish,
    arg1: string,
    overrides?: CallOverrides
  ): Promise<boolean>;

  registeredRuleIDs(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  renounceOwnership(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  requestIdExists(
    requestId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<boolean>;

  scenarioWhitelist(arg0: string, overrides?: CallOverrides): Promise<boolean>;

  setNexeraZKPRequest(
    requestId: BigNumberish,
    request: { metadata: string; validator: string; data: BytesLike },
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setZKPRequest(
    requestId: BigNumberish,
    request: { metadata: string; validator: string; data: BytesLike },
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  submitZKPResponse(
    requestId: BigNumberish,
    inputs: BigNumberish[],
    a: [BigNumberish, BigNumberish],
    b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
    c: [BigNumberish, BigNumberish],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  transferOwnership(
    newOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  whitelistScenario(
    zkps: {
      requestId: BigNumberish;
      inputs: BigNumberish[];
      a: [BigNumberish, BigNumberish];
      b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]];
      c: [BigNumberish, BigNumberish];
    }[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    REQUESTS_RETURN_LIMIT(overrides?: CallOverrides): Promise<BigNumber>;

    addressToId(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    finalizeWhitelistScenario(
      user: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    getZKPRequest(
      requestId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [string, string, string] & {
        metadata: string;
        validator: string;
        data: string;
      }
    >;

    getZKPRequests(
      startIndex: BigNumberish,
      length: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      ([string, string, string] & {
        metadata: string;
        validator: string;
        data: string;
      })[]
    >;

    getZKPRequestsCount(overrides?: CallOverrides): Promise<BigNumber>;

    idToAddress(arg0: BigNumberish, overrides?: CallOverrides): Promise<string>;

    isAllowedForScenario(
      user: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    isRuleIdRegistered(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    owner(overrides?: CallOverrides): Promise<string>;

    proofs(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    queryRequestWhitelist(
      arg0: BigNumberish,
      arg1: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    registeredRuleIDs(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    requestIdExists(
      requestId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    scenarioWhitelist(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    setNexeraZKPRequest(
      requestId: BigNumberish,
      request: { metadata: string; validator: string; data: BytesLike },
      overrides?: CallOverrides
    ): Promise<void>;

    setZKPRequest(
      requestId: BigNumberish,
      request: { metadata: string; validator: string; data: BytesLike },
      overrides?: CallOverrides
    ): Promise<void>;

    submitZKPResponse(
      requestId: BigNumberish,
      inputs: BigNumberish[],
      a: [BigNumberish, BigNumberish],
      b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
      c: [BigNumberish, BigNumberish],
      overrides?: CallOverrides
    ): Promise<void>;

    transferOwnership(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    whitelistScenario(
      zkps: {
        requestId: BigNumberish;
        inputs: BigNumberish[];
        a: [BigNumberish, BigNumberish];
        b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]];
        c: [BigNumberish, BigNumberish];
      }[],
      overrides?: CallOverrides
    ): Promise<boolean>;
  };

  filters: {
    "AddressIdConnection(address,uint256)"(
      userAddress?: null,
      userId?: null
    ): TypedEventFilter<
      [string, BigNumber],
      { userAddress: string; userId: BigNumber }
    >;

    AddressIdConnection(
      userAddress?: null,
      userId?: null
    ): TypedEventFilter<
      [string, BigNumber],
      { userAddress: string; userId: BigNumber }
    >;

    "OwnershipTransferred(address,address)"(
      previousOwner?: string | null,
      newOwner?: string | null
    ): TypedEventFilter<
      [string, string],
      { previousOwner: string; newOwner: string }
    >;

    OwnershipTransferred(
      previousOwner?: string | null,
      newOwner?: string | null
    ): TypedEventFilter<
      [string, string],
      { previousOwner: string; newOwner: string }
    >;

    "RequestRegistered(uint64)"(
      requestId?: null
    ): TypedEventFilter<[BigNumber], { requestId: BigNumber }>;

    RequestRegistered(
      requestId?: null
    ): TypedEventFilter<[BigNumber], { requestId: BigNumber }>;

    "SubmitedAllZKPsForUser(address,tuple[])"(
      userAddress?: null,
      zkps?: null
    ): TypedEventFilter<
      [
        string,
        ([
          BigNumber,
          BigNumber[],
          [BigNumber, BigNumber],
          [[BigNumber, BigNumber], [BigNumber, BigNumber]],
          [BigNumber, BigNumber]
        ] & {
          requestId: BigNumber;
          inputs: BigNumber[];
          a: [BigNumber, BigNumber];
          b: [[BigNumber, BigNumber], [BigNumber, BigNumber]];
          c: [BigNumber, BigNumber];
        })[]
      ],
      {
        userAddress: string;
        zkps: ([
          BigNumber,
          BigNumber[],
          [BigNumber, BigNumber],
          [[BigNumber, BigNumber], [BigNumber, BigNumber]],
          [BigNumber, BigNumber]
        ] & {
          requestId: BigNumber;
          inputs: BigNumber[];
          a: [BigNumber, BigNumber];
          b: [[BigNumber, BigNumber], [BigNumber, BigNumber]];
          c: [BigNumber, BigNumber];
        })[];
      }
    >;

    SubmitedAllZKPsForUser(
      userAddress?: null,
      zkps?: null
    ): TypedEventFilter<
      [
        string,
        ([
          BigNumber,
          BigNumber[],
          [BigNumber, BigNumber],
          [[BigNumber, BigNumber], [BigNumber, BigNumber]],
          [BigNumber, BigNumber]
        ] & {
          requestId: BigNumber;
          inputs: BigNumber[];
          a: [BigNumber, BigNumber];
          b: [[BigNumber, BigNumber], [BigNumber, BigNumber]];
          c: [BigNumber, BigNumber];
        })[]
      ],
      {
        userAddress: string;
        zkps: ([
          BigNumber,
          BigNumber[],
          [BigNumber, BigNumber],
          [[BigNumber, BigNumber], [BigNumber, BigNumber]],
          [BigNumber, BigNumber]
        ] & {
          requestId: BigNumber;
          inputs: BigNumber[];
          a: [BigNumber, BigNumber];
          b: [[BigNumber, BigNumber], [BigNumber, BigNumber]];
          c: [BigNumber, BigNumber];
        })[];
      }
    >;

    "UserAllowedForRequest(address,uint64)"(
      userAddress?: null,
      requestId?: null
    ): TypedEventFilter<
      [string, BigNumber],
      { userAddress: string; requestId: BigNumber }
    >;

    UserAllowedForRequest(
      userAddress?: null,
      requestId?: null
    ): TypedEventFilter<
      [string, BigNumber],
      { userAddress: string; requestId: BigNumber }
    >;

    "UserAllowedForScenario(address)"(
      userAddress?: null
    ): TypedEventFilter<[string], { userAddress: string }>;

    UserAllowedForScenario(
      userAddress?: null
    ): TypedEventFilter<[string], { userAddress: string }>;

    "ZKPRequestSet(uint64,bytes,address,string)"(
      requestId?: null,
      data?: null,
      validator?: null,
      metadata?: null
    ): TypedEventFilter<
      [BigNumber, string, string, string],
      {
        requestId: BigNumber;
        data: string;
        validator: string;
        metadata: string;
      }
    >;

    ZKPRequestSet(
      requestId?: null,
      data?: null,
      validator?: null,
      metadata?: null
    ): TypedEventFilter<
      [BigNumber, string, string, string],
      {
        requestId: BigNumber;
        data: string;
        validator: string;
        metadata: string;
      }
    >;
  };

  estimateGas: {
    REQUESTS_RETURN_LIMIT(overrides?: CallOverrides): Promise<BigNumber>;

    addressToId(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    finalizeWhitelistScenario(
      user: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    getZKPRequest(
      requestId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getZKPRequests(
      startIndex: BigNumberish,
      length: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getZKPRequestsCount(overrides?: CallOverrides): Promise<BigNumber>;

    idToAddress(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isAllowedForScenario(
      user: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isRuleIdRegistered(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    proofs(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    queryRequestWhitelist(
      arg0: BigNumberish,
      arg1: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    registeredRuleIDs(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    requestIdExists(
      requestId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    scenarioWhitelist(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    setNexeraZKPRequest(
      requestId: BigNumberish,
      request: { metadata: string; validator: string; data: BytesLike },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setZKPRequest(
      requestId: BigNumberish,
      request: { metadata: string; validator: string; data: BytesLike },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    submitZKPResponse(
      requestId: BigNumberish,
      inputs: BigNumberish[],
      a: [BigNumberish, BigNumberish],
      b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
      c: [BigNumberish, BigNumberish],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    whitelistScenario(
      zkps: {
        requestId: BigNumberish;
        inputs: BigNumberish[];
        a: [BigNumberish, BigNumberish];
        b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]];
        c: [BigNumberish, BigNumberish];
      }[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    REQUESTS_RETURN_LIMIT(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    addressToId(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    finalizeWhitelistScenario(
      user: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    getZKPRequest(
      requestId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getZKPRequests(
      startIndex: BigNumberish,
      length: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getZKPRequestsCount(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    idToAddress(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isAllowedForScenario(
      user: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isRuleIdRegistered(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    proofs(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    queryRequestWhitelist(
      arg0: BigNumberish,
      arg1: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    registeredRuleIDs(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    requestIdExists(
      requestId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    scenarioWhitelist(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    setNexeraZKPRequest(
      requestId: BigNumberish,
      request: { metadata: string; validator: string; data: BytesLike },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setZKPRequest(
      requestId: BigNumberish,
      request: { metadata: string; validator: string; data: BytesLike },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    submitZKPResponse(
      requestId: BigNumberish,
      inputs: BigNumberish[],
      a: [BigNumberish, BigNumberish],
      b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
      c: [BigNumberish, BigNumberish],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    whitelistScenario(
      zkps: {
        requestId: BigNumberish;
        inputs: BigNumberish[];
        a: [BigNumberish, BigNumberish];
        b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]];
        c: [BigNumberish, BigNumberish];
      }[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}