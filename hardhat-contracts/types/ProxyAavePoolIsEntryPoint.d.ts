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

interface ProxyAavePoolIsEntryPointInterface extends ethers.utils.Interface {
  functions: {
    "aavePoolAddress()": FunctionFragment;
    "addScenarioVerifier(address)": FunctionFragment;
    "deleteScenarioVerifier(address)": FunctionFragment;
    "disableScenario(address)": FunctionFragment;
    "enableScenario(address)": FunctionFragment;
    "getScenarioVerifierAddress(uint256)": FunctionFragment;
    "isAllowedForEntrypoint(address)": FunctionFragment;
    "isScenarioEnabled(address)": FunctionFragment;
    "owner()": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "scenarioVerifierAddresses(uint256)": FunctionFragment;
    "supply(address,uint256,address)": FunctionFragment;
    "supplyWithPermit(address,uint256,address,uint16,uint256,uint8,bytes32,bytes32)": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
    "updateScenarioVerifier(address,address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "aavePoolAddress",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "addScenarioVerifier",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "deleteScenarioVerifier",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "disableScenario",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "enableScenario",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "getScenarioVerifierAddress",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "isAllowedForEntrypoint",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "isScenarioEnabled",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "scenarioVerifierAddresses",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "supply",
    values: [string, BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "supplyWithPermit",
    values: [
      string,
      BigNumberish,
      string,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BytesLike,
      BytesLike
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "updateScenarioVerifier",
    values: [string, string]
  ): string;

  decodeFunctionResult(
    functionFragment: "aavePoolAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "addScenarioVerifier",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "deleteScenarioVerifier",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "disableScenario",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "enableScenario",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getScenarioVerifierAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isAllowedForEntrypoint",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isScenarioEnabled",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "scenarioVerifierAddresses",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "supply", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "supplyWithPermit",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateScenarioVerifier",
    data: BytesLike
  ): Result;

  events: {
    "OwnershipTransferred(address,address)": EventFragment;
    "ScenarioVerifierAdded(address)": EventFragment;
    "ScenarioVerifierDeleted(address)": EventFragment;
    "ScenarioVerifierDisabled(address)": EventFragment;
    "ScenarioVerifierEnabled(address)": EventFragment;
    "ScenarioVerifierUpdated(address,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ScenarioVerifierAdded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ScenarioVerifierDeleted"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ScenarioVerifierDisabled"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ScenarioVerifierEnabled"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ScenarioVerifierUpdated"): EventFragment;
}

export type OwnershipTransferredEvent = TypedEvent<
  [string, string] & { previousOwner: string; newOwner: string }
>;

export type ScenarioVerifierAddedEvent = TypedEvent<
  [string] & { scenarioVerifierAddress: string }
>;

export type ScenarioVerifierDeletedEvent = TypedEvent<
  [string] & { scenarioVerifierAddress: string }
>;

export type ScenarioVerifierDisabledEvent = TypedEvent<
  [string] & { scenarioVerifierAddress: string }
>;

export type ScenarioVerifierEnabledEvent = TypedEvent<
  [string] & { scenarioVerifierAddress: string }
>;

export type ScenarioVerifierUpdatedEvent = TypedEvent<
  [string, string] & {
    oldScenarioVerifierAddress: string;
    newScenarioVerifierAddress: string;
  }
>;

export class ProxyAavePoolIsEntryPoint extends BaseContract {
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

  interface: ProxyAavePoolIsEntryPointInterface;

  functions: {
    aavePoolAddress(overrides?: CallOverrides): Promise<[string]>;

    addScenarioVerifier(
      scenarioVerifierAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    deleteScenarioVerifier(
      scenarioVerifierAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    disableScenario(
      scenarioVerifierAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    enableScenario(
      scenarioVerifierAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    getScenarioVerifierAddress(
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string]>;

    isAllowedForEntrypoint(
      user: string,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    isScenarioEnabled(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    scenarioVerifierAddresses(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string]>;

    supply(
      _token: string,
      _amount: BigNumberish,
      _user: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    supplyWithPermit(
      asset: string,
      amount: BigNumberish,
      onBehalfOf: string,
      referralCode: BigNumberish,
      deadline: BigNumberish,
      permitV: BigNumberish,
      permitR: BytesLike,
      permitS: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    updateScenarioVerifier(
      oldScenarioVerifierAddress: string,
      newScenarioVerifierAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  aavePoolAddress(overrides?: CallOverrides): Promise<string>;

  addScenarioVerifier(
    scenarioVerifierAddress: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  deleteScenarioVerifier(
    scenarioVerifierAddress: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  disableScenario(
    scenarioVerifierAddress: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  enableScenario(
    scenarioVerifierAddress: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  getScenarioVerifierAddress(
    index: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  isAllowedForEntrypoint(
    user: string,
    overrides?: CallOverrides
  ): Promise<boolean>;

  isScenarioEnabled(arg0: string, overrides?: CallOverrides): Promise<boolean>;

  owner(overrides?: CallOverrides): Promise<string>;

  renounceOwnership(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  scenarioVerifierAddresses(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  supply(
    _token: string,
    _amount: BigNumberish,
    _user: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  supplyWithPermit(
    asset: string,
    amount: BigNumberish,
    onBehalfOf: string,
    referralCode: BigNumberish,
    deadline: BigNumberish,
    permitV: BigNumberish,
    permitR: BytesLike,
    permitS: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  transferOwnership(
    newOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  updateScenarioVerifier(
    oldScenarioVerifierAddress: string,
    newScenarioVerifierAddress: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    aavePoolAddress(overrides?: CallOverrides): Promise<string>;

    addScenarioVerifier(
      scenarioVerifierAddress: string,
      overrides?: CallOverrides
    ): Promise<void>;

    deleteScenarioVerifier(
      scenarioVerifierAddress: string,
      overrides?: CallOverrides
    ): Promise<void>;

    disableScenario(
      scenarioVerifierAddress: string,
      overrides?: CallOverrides
    ): Promise<void>;

    enableScenario(
      scenarioVerifierAddress: string,
      overrides?: CallOverrides
    ): Promise<void>;

    getScenarioVerifierAddress(
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    isAllowedForEntrypoint(
      user: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    isScenarioEnabled(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    owner(overrides?: CallOverrides): Promise<string>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    scenarioVerifierAddresses(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    supply(
      _token: string,
      _amount: BigNumberish,
      _user: string,
      overrides?: CallOverrides
    ): Promise<void>;

    supplyWithPermit(
      asset: string,
      amount: BigNumberish,
      onBehalfOf: string,
      referralCode: BigNumberish,
      deadline: BigNumberish,
      permitV: BigNumberish,
      permitR: BytesLike,
      permitS: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    transferOwnership(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    updateScenarioVerifier(
      oldScenarioVerifierAddress: string,
      newScenarioVerifierAddress: string,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
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

    "ScenarioVerifierAdded(address)"(
      scenarioVerifierAddress?: null
    ): TypedEventFilter<[string], { scenarioVerifierAddress: string }>;

    ScenarioVerifierAdded(
      scenarioVerifierAddress?: null
    ): TypedEventFilter<[string], { scenarioVerifierAddress: string }>;

    "ScenarioVerifierDeleted(address)"(
      scenarioVerifierAddress?: null
    ): TypedEventFilter<[string], { scenarioVerifierAddress: string }>;

    ScenarioVerifierDeleted(
      scenarioVerifierAddress?: null
    ): TypedEventFilter<[string], { scenarioVerifierAddress: string }>;

    "ScenarioVerifierDisabled(address)"(
      scenarioVerifierAddress?: null
    ): TypedEventFilter<[string], { scenarioVerifierAddress: string }>;

    ScenarioVerifierDisabled(
      scenarioVerifierAddress?: null
    ): TypedEventFilter<[string], { scenarioVerifierAddress: string }>;

    "ScenarioVerifierEnabled(address)"(
      scenarioVerifierAddress?: null
    ): TypedEventFilter<[string], { scenarioVerifierAddress: string }>;

    ScenarioVerifierEnabled(
      scenarioVerifierAddress?: null
    ): TypedEventFilter<[string], { scenarioVerifierAddress: string }>;

    "ScenarioVerifierUpdated(address,address)"(
      oldScenarioVerifierAddress?: null,
      newScenarioVerifierAddress?: null
    ): TypedEventFilter<
      [string, string],
      { oldScenarioVerifierAddress: string; newScenarioVerifierAddress: string }
    >;

    ScenarioVerifierUpdated(
      oldScenarioVerifierAddress?: null,
      newScenarioVerifierAddress?: null
    ): TypedEventFilter<
      [string, string],
      { oldScenarioVerifierAddress: string; newScenarioVerifierAddress: string }
    >;
  };

  estimateGas: {
    aavePoolAddress(overrides?: CallOverrides): Promise<BigNumber>;

    addScenarioVerifier(
      scenarioVerifierAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    deleteScenarioVerifier(
      scenarioVerifierAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    disableScenario(
      scenarioVerifierAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    enableScenario(
      scenarioVerifierAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    getScenarioVerifierAddress(
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isAllowedForEntrypoint(
      user: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isScenarioEnabled(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    scenarioVerifierAddresses(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    supply(
      _token: string,
      _amount: BigNumberish,
      _user: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    supplyWithPermit(
      asset: string,
      amount: BigNumberish,
      onBehalfOf: string,
      referralCode: BigNumberish,
      deadline: BigNumberish,
      permitV: BigNumberish,
      permitR: BytesLike,
      permitS: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    updateScenarioVerifier(
      oldScenarioVerifierAddress: string,
      newScenarioVerifierAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    aavePoolAddress(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    addScenarioVerifier(
      scenarioVerifierAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    deleteScenarioVerifier(
      scenarioVerifierAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    disableScenario(
      scenarioVerifierAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    enableScenario(
      scenarioVerifierAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    getScenarioVerifierAddress(
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isAllowedForEntrypoint(
      user: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isScenarioEnabled(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    scenarioVerifierAddresses(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    supply(
      _token: string,
      _amount: BigNumberish,
      _user: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    supplyWithPermit(
      asset: string,
      amount: BigNumberish,
      onBehalfOf: string,
      referralCode: BigNumberish,
      deadline: BigNumberish,
      permitV: BigNumberish,
      permitR: BytesLike,
      permitS: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    updateScenarioVerifier(
      oldScenarioVerifierAddress: string,
      newScenarioVerifierAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
