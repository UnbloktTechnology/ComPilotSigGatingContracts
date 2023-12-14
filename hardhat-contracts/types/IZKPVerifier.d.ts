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

interface IZKPVerifierInterface extends ethers.utils.Interface {
  functions: {
    "getZKPRequest(uint64)": FunctionFragment;
    "getZKPRequests(uint256,uint256)": FunctionFragment;
    "getZKPRequestsCount()": FunctionFragment;
    "requestIdExists(uint64)": FunctionFragment;
    "setZKPRequest(uint64,(string,address,bytes))": FunctionFragment;
    "submitZKPResponse(uint64,uint256[],uint256[2],uint256[2][2],uint256[2])": FunctionFragment;
  };

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
    functionFragment: "requestIdExists",
    values: [BigNumberish]
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
    functionFragment: "requestIdExists",
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

  events: {};
}

export class IZKPVerifier extends BaseContract {
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

  interface: IZKPVerifierInterface;

  functions: {
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

    requestIdExists(
      requestId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

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
  };

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

  requestIdExists(
    requestId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<boolean>;

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

  callStatic: {
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

    requestIdExists(
      requestId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

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
  };

  filters: {};

  estimateGas: {
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

    requestIdExists(
      requestId: BigNumberish,
      overrides?: CallOverrides
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
  };

  populateTransaction: {
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

    requestIdExists(
      requestId: BigNumberish,
      overrides?: CallOverrides
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
  };
}
