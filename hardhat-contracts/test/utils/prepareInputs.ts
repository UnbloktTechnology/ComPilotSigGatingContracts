export function prepareInputs(json: {
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
  };
  pub_signals: string[];
}): {
  pi_a: [bigint, bigint];
  pi_b: [[bigint, bigint], [bigint, bigint]];
  pi_c: [bigint, bigint];
  inputs: bigint[];
} {
  const { proof, pub_signals } = json;
  const { pi_a, pi_b, pi_c } = proof;
  const [[p1, p2], [p3, p4]] = pi_b;
  const preparedProof = {
    pi_a: pi_a.map((e) => BigInt(e)).slice(0, 2) as [bigint, bigint],
    pi_b: [
      [BigInt(p2), BigInt(p1)],
      [BigInt(p4), BigInt(p3)],
    ] as [[bigint, bigint], [bigint, bigint]],
    pi_c: pi_c.map((e) => BigInt(e)).slice(0, 2) as [bigint, bigint],
  };

  return { inputs: pub_signals.map((e) => BigInt(e)), ...preparedProof };
}
