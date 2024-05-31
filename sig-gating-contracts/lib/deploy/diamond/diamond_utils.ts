import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";

export const FacetCutAction = {
  Add: 0,
  Replace: 1,
  Remove: 2,
};

export function getSelectors(contract: Contract) {
  const signatures: string[] = Object.keys(contract.interface.functions);

  return signatures.reduce((acc: string[], val) => {
    if (val !== "init(bytes)") {
      acc.push(contract.interface.getSighash(val));
    }
    return acc;
  }, []);
}

export async function filterAndCut(
  diamondContract: Contract,
  signer: SignerWithAddress,
  deployedContracts: Contract[]
) {
  let totalSelectors: string[] = [];
  let cuts: any = [];

  let deployedFacets = await diamondContract.callStatic["facets()"]();

  totalSelectors = [...deployedFacets[0]["selectors"]];

  deployedContracts.forEach((contract) => {
    const contractSelector: string[] = getSelectors(contract);
    let selectorsToAdd: string[] = [];

    // Dont adding an already existing selector sig
    contractSelector.forEach((s) => {
      if (!totalSelectors.includes(s)) {
        selectorsToAdd.push(s);
        totalSelectors.push(s);
      }
    });
    cuts.push({
      target: contract.address,
      action: FacetCutAction.Add,
      selectors: selectorsToAdd,
    });
  });

  await diamondContract
    .connect(signer)
    .diamondCut(cuts, "0x0000000000000000000000000000000000000000", "0x");
}
