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
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import type { TypedEventFilter, TypedEvent, TypedListener } from "./common";

interface ICircuitValidatorInterface extends ethers.utils.Interface {
  functions: {
    "getSupportedCircuitIds()": FunctionFragment;
    "inputIndexOf(string)": FunctionFragment;
    "verify(uint256[],uint256[2],uint256[2][2],uint256[2],bytes)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "getSupportedCircuitIds",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "inputIndexOf",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "verify",
    values: [
      BigNumberish[],
      [BigNumberish, BigNumberish],
      [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
      [BigNumberish, BigNumberish],
      BytesLike
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "getSupportedCircuitIds",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "inputIndexOf",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "verify", data: BytesLike): Result;

  events: {};
}

export class ICircuitValidator extends BaseContract {
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

  interface: ICircuitValidatorInterface;

  functions: {
    getSupportedCircuitIds(
      overrides?: CallOverrides
    ): Promise<[string[]] & { ids: string[] }>;

    inputIndexOf(name: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    verify(
      inputs: BigNumberish[],
      a: [BigNumberish, BigNumberish],
      b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
      c: [BigNumberish, BigNumberish],
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<[void]>;
  };

  getSupportedCircuitIds(overrides?: CallOverrides): Promise<string[]>;

  inputIndexOf(name: string, overrides?: CallOverrides): Promise<BigNumber>;

  verify(
    inputs: BigNumberish[],
    a: [BigNumberish, BigNumberish],
    b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
    c: [BigNumberish, BigNumberish],
    data: BytesLike,
    overrides?: CallOverrides
  ): Promise<void>;

  callStatic: {
    getSupportedCircuitIds(overrides?: CallOverrides): Promise<string[]>;

    inputIndexOf(name: string, overrides?: CallOverrides): Promise<BigNumber>;

    verify(
      inputs: BigNumberish[],
      a: [BigNumberish, BigNumberish],
      b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
      c: [BigNumberish, BigNumberish],
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    getSupportedCircuitIds(overrides?: CallOverrides): Promise<BigNumber>;

    inputIndexOf(name: string, overrides?: CallOverrides): Promise<BigNumber>;

    verify(
      inputs: BigNumberish[],
      a: [BigNumberish, BigNumberish],
      b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
      c: [BigNumberish, BigNumberish],
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    getSupportedCircuitIds(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    inputIndexOf(
      name: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    verify(
      inputs: BigNumberish[],
      a: [BigNumberish, BigNumberish],
      b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
      c: [BigNumberish, BigNumberish],
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}