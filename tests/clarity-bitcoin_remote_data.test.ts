import { describe, expect, it } from "vitest";
import {
  parseBlockHeader,
  verifyMerkleProof,
  wasSegwitTxMinedCompact,
  wasTxMinedCompact,
} from "./clients/clarity-bitcoin-client.ts";
import { bytesToHex, hexToBytes } from "./utils.ts";
import { Cl, cvToString } from "@stacks/transactions";
import bitcoinjs, { Transaction } from "bitcoinjs-lib";
import { sha256 } from "@noble/hashes/sha256";
import { BitcoinRPCConfig, bitcoinTxProof } from "bitcoin-tx-proof";
const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;

const rpcConfig: BitcoinRPCConfig = {
  url: "http://localhost:8332",
};

// stacks height = 595050
const bitcoinHeight = 883230;
const bitcoinBlockHeaderHash =
  "00000000000000000001c55626b85b4b3ecb33f67645356a2b01f4dfba893679";

// https://mempool.space/api/block/00000000000000000001c55626b85b4b3ecb33f67645356a2b01f4dfba893679/header
const headerHex =
  "040060208c8b71956e408769453d40275830b83856bc0d8afaf60000000000000000000069167b97329b04d11aea35a48fbfc00af71c9750c4526d024dbb97158793eac31379aa672677021707a18259";

// https://bitcoinexplorer.org/block/00000000000000000001c55626b85b4b3ecb33f67645356a2b01f4dfba893679#JSON
const merkleRoot =
  "c3ea93871597bb4d026d52c450971cf70ac0bf8fa435ea1ad1049b32977b1669";

const wMerkleRoot =
  "d46461bd8a483c8ad0acaa9d72e54b2c04bfa7c19dc37a7b0805c2f959e832cd";

describe("Bitcoin library with remote data", () => {
  it("Ensure that remote data is as expected", () => {
    const bbh = simnet.execute("burn-block-height");
    expect(bbh.result).toBeUint(bitcoinHeight);

    var bbhh = simnet.execute(
      "(get-burn-block-info? header-hash burn-block-height)"
    );
    expect(bbhh.result).toBeSome(Cl.bufferFromHex(bitcoinBlockHeaderHash));
  });
  it("Ensure that block header is correct", () => {
    const blockHeaderVerify = simnet.callReadOnlyFn(
      "clarity-bitcoin",
      "verify-block-header",
      [Cl.buffer(hexToBytes(headerHex)), Cl.uint(bitcoinHeight)],
      deployer
    );
    expect(blockHeaderVerify.result).toBeBool(true);

    console.log(
      "block header",
      cvToString(parseBlockHeader(hexToBytes(headerHex), deployer).result)
    );
  });

  it("Ensure that mined segwit tx can be verified ", async () => {
    const txId =
      "c1de234c01ecc47906117d012865ce3dabbbb081dc0309a74dbbae45e427aadc";
    // https://mempool.space/api/tx/c1de234c01ecc47906117d012865ce3dabbbb081dc0309a74dbbae45e427aadc/hex
    const txHex =
      "02000000000101f6e86a2b938453e199836ad4e2ba751c5ded24f4e1c2934b3434cd00f9bce61d0100000000fdffffff02856e00000000000017a914c5beca99b2b4c558b297ed9134142f4a3873f4e987d0b8390100000000160014b84ef1e7e398d56fa88a356df3139ff997114f040247304402205edad21077602766ffbce1276b6a3b69577a521b28dc18d8062303723ac91cc802200ec9ea72f62069b1e5817a999fa3d31acf0f655a159691feb8161fb33b93f3fa012103997651fec067eda2c430bfe548f65575737c9b892d8b529ae9dc0dfcb5c5898a00000000";

    // https://mempool.space/api/tx/c1de234c01ecc47906117d012865ce3dabbbb081dc0309a74dbbae45e427aadc/merkle-proof
    const merkleProof = {
      block_height: 883230,
      merkle: [
        "17a992d8e38f314cec47136e3059305091d105053c2a98adb7476bf9c0b21270",
        "e671cbed889dbc4236114beb3b723a6da41919164f05cb2e788b7a9c414ca164",
        "0ece6af222f45022d09fa392f0a9f814bc9924784bffc25a89df5fba43ed189e",
        "a0a36ab643cabd74c6c9445a4c069c6c7c0ea5ac85f92342c28d8f91d487ab76",
        "15310842f6e9f419dd6860fae1cff45db709040d46cff8e736aa66a57f275b40",
        "ca377ffe8805556d45d75f2e64d92984ac8edeac661cb841c0ec198f34af7e16",
        "85b7e2affe4b61fa1dd69e3f6713afa22a58e224769e8f245c4e9b62be6ffb01",
        "0e04534a2cabf0bc42044de898c65fa283b2d661f76b4e227aa79ba390e7da70",
        "fea2965f0cf6e2c2cc1542b985565c9e2af281c14a396a3f62c57954977872e5",
        "51a1c02147ab62b9a5f67582536e4e7913d944660722b8f78a83158440752c85",
      ],
      pos: 1,
    };
    const proof = {
      txIndex: merkleProof.pos,
      hashes: merkleProof.merkle.map(hexToBytes).map((h) => h.reverse()),
      treeDepth: merkleProof.merkle.length,
    };

    const coinbaseTxId =
      "17a992d8e38f314cec47136e3059305091d105053c2a98adb7476bf9c0b21270";

    // https://mempool.space/api/tx/17a992d8e38f314cec47136e3059305091d105053c2a98adb7476bf9c0b21270/hex
    const coinbaseTxHex =
      "020000000001010000000000000000000000000000000000000000000000000000000000000000ffffffff29031e7a0d041379aa672f53424943727970746f2e636f6d20506f6f6c2f0e8f08296459410349b85901ffffffff029e32a912000000001600141843e47a9034732c7d904b5cae76e2c5d64e799c0000000000000000266a24aa21a9edf97f7d667a4e75a8b7235f1f66648bc2262d2dd5253e811ac1c257ae03d1d3b20120000000000000000000000000000000000000000000000000000000000000000000000000";

    // Assume tx is your transaction object
    const tx = bitcoinjs.Transaction.fromHex(coinbaseTxHex);
    tx.stripWitnesses();
    const legacyCoinbaseTxHex = tx.toHex();

    // https://mempool.space/api/tx/17a992d8e38f314cec47136e3059305091d105053c2a98adb7476bf9c0b21270/merkle-proof
    const coinbaseMerkleProof = {
      block_height: 883230,
      merkle: [
        "c1de234c01ecc47906117d012865ce3dabbbb081dc0309a74dbbae45e427aadc",
        "e671cbed889dbc4236114beb3b723a6da41919164f05cb2e788b7a9c414ca164",
        "0ece6af222f45022d09fa392f0a9f814bc9924784bffc25a89df5fba43ed189e",
        "a0a36ab643cabd74c6c9445a4c069c6c7c0ea5ac85f92342c28d8f91d487ab76",
        "15310842f6e9f419dd6860fae1cff45db709040d46cff8e736aa66a57f275b40",
        "ca377ffe8805556d45d75f2e64d92984ac8edeac661cb841c0ec198f34af7e16",
        "85b7e2affe4b61fa1dd69e3f6713afa22a58e224769e8f245c4e9b62be6ffb01",
        "0e04534a2cabf0bc42044de898c65fa283b2d661f76b4e227aa79ba390e7da70",
        "fea2965f0cf6e2c2cc1542b985565c9e2af281c14a396a3f62c57954977872e5",
        "51a1c02147ab62b9a5f67582536e4e7913d944660722b8f78a83158440752c85",
      ],
      pos: 0,
    };

    const reservedValue =
      "0000000000000000000000000000000000000000000000000000000000000000";

    const proofCoinbase = {
      txIndex: coinbaseMerkleProof.pos,
      hashes: coinbaseMerkleProof.merkle
        .map(hexToBytes)
        .map((h) => h.reverse()),
      treeDepth: coinbaseMerkleProof.merkle.length,
    };

    // verify merkle proof using tx id
    const verify = verifyMerkleProof(
      hexToBytes(txId),
      hexToBytes(merkleRoot).reverse(),
      proof,
      deployer
    );
    expect(verify.result).toBeOk(Cl.bool(true));

    // verify merkle proof using tx id
    const verifyCoinbase = verifyMerkleProof(
      hexToBytes(coinbaseTxId),
      hexToBytes(merkleRoot).reverse(),
      proofCoinbase,
      deployer
    );
    expect(verifyCoinbase.result).toBeOk(Cl.bool(true));

    // verify coinbase tx was mined
    const resultCB = wasTxMinedCompact(
      bitcoinHeight,
      legacyCoinbaseTxHex,
      headerHex,
      proofCoinbase,
      deployer
    );
    expect(resultCB.result).toBeOk(Cl.buffer(hexToBytes(coinbaseTxId)));

    const parseCBTx = simnet.callReadOnlyFn(
      "clarity-bitcoin",
      "parse-tx",
      [Cl.buffer(hexToBytes(legacyCoinbaseTxHex))],
      deployer
    );
    console.log("parsedCBTx", cvToString(parseCBTx.result));

    const reversedMerkleRoot =
      "69167b97329b04d11aea35a48fbfc00af71c9750c4526d024dbb97158793eac3";
    expect(bytesToHex(hexToBytes(merkleRoot).reverse())).toStrictEqual(
      reversedMerkleRoot
    );

    const txProof = await bitcoinTxProof(txId, bitcoinHeight, rpcConfig);

    // verify commitment, i.e. scriptPubkey of output of coinbase tx
    const commitment =
      "6a24aa21a9edf97f7d667a4e75a8b7235f1f66648bc2262d2dd5253e811ac1c257ae03d1d3b2";
    expect(
      "6a24aa21a9ed" +
        bytesToHex(
          sha256(sha256(hexToBytes(txProof.witnessMerkleRoot + reservedValue)))
        )
    ).toStrictEqual(commitment);

    // split txProof.witnessMerkleProof in chunks of 64 characters
    const chunks = txProof.witnessMerkleProof.match(/.{1,64}/g);
    const wproofs = chunks?.map((c) => hexToBytes(c)) || [];

    // split txProof.coinbaseMerkleProof in chunks of 64 characters
    const cbChunks = txProof.coinbaseMerkleProof.match(/.{1,64}/g);
    const cbProofs = cbChunks?.map((c) => hexToBytes(c)) || [];

    console.log(cbProofs.map(bytesToHex));
    console.log(proofCoinbase.hashes.map(bytesToHex));

    const cbTransaction = bitcoinjs.Transaction.fromHex(
      txProof.coinbaseTransaction
    );
    cbTransaction.stripWitnesses();
    const cbHex = cbTransaction.toHex();

    expect(cbHex).toStrictEqual(legacyCoinbaseTxHex);

    // get wtxid
    const bitcoinjsTx = Transaction.fromHex(txHex);
    const expectedWtxid = bitcoinjsTx.getHash(true).reverse().toString("hex");

    expect(txProof.merkleProofDepth).toBe(proof.treeDepth);

    // verify segwit tx was mined
    const result = wasSegwitTxMinedCompact(
      bitcoinHeight,
      txHex,
      headerHex,
      txProof.txIndex, // merkleProof.pos,
      txProof.merkleProofDepth, // proof.hashes.length,
      wproofs,
      txProof.witnessMerkleRoot,
      txProof.witnessReservedValue, // reservedValue,
      cbHex, // legacyCoinbaseTxHex,
      cbProofs, //proofCoinbase.hashes,
      deployer
    );
    expect(result.result).toBeOk(Cl.buffer(hexToBytes(expectedWtxid)));
  }, 100000);

  it("Ensure that mined legacy tx can be verified ", () => {
    const txId =
      "f5a993361e1db33c3b2323e39eda6c8ee70bc08da1429d0a2f81063751e55c73";
    // https://mempool.space/api/tx/f5a993361e1db33c3b2323e39eda6c8ee70bc08da1429d0a2f81063751e55c73/hex
    const txHex =
      "0100000001fb031611b675eb06e0d94f4d668d95f4ad4bc74ffe70bcefa035c1ab89e5c121000000006a47304402207ce0dcbdb1b3790831fc294a451bfc329b129588bef8766697f589c37666d85f0220135b39800f5d1ec2c329fd125be71cba4132b429cb3827815a2af9c21ee36f69012103e6a7489ea5fe06f9363830466067e34c574b44c485cb8ee9a4fc98276dc5a5c8ffffffff01ffb60000000000001976a9147bb1218a48c58c35c3537e6560e804023ee7310688ac00000000";

    //  https://mempool.space/api/tx/f5a993361e1db33c3b2323e39eda6c8ee70bc08da1429d0a2f81063751e55c73/merkle-proof
    const merkleProof = {
      block_height: 883230,
      merkle: [
        "d59c146d5f87b8c14fbeffb4189fe173aa4c8d6633f4597e3fab2591594af1a4",
        "498ea075e8ab8f6d4a678d6c24bc8a82304c31744e3067326ca9c242a275f604",
        "c52bc8ec72395e90646d5cc96cd17ff080c4f4af7ef6f01ea3b7ecfaa49b25cd",
        "a0a36ab643cabd74c6c9445a4c069c6c7c0ea5ac85f92342c28d8f91d487ab76",
        "15310842f6e9f419dd6860fae1cff45db709040d46cff8e736aa66a57f275b40",
        "ca377ffe8805556d45d75f2e64d92984ac8edeac661cb841c0ec198f34af7e16",
        "85b7e2affe4b61fa1dd69e3f6713afa22a58e224769e8f245c4e9b62be6ffb01",
        "0e04534a2cabf0bc42044de898c65fa283b2d661f76b4e227aa79ba390e7da70",
        "fea2965f0cf6e2c2cc1542b985565c9e2af281c14a396a3f62c57954977872e5",
        "51a1c02147ab62b9a5f67582536e4e7913d944660722b8f78a83158440752c85",
      ],
      pos: 6,
    };

    const proof = {
      txIndex: merkleProof.pos,
      hashes: merkleProof.merkle.map(hexToBytes).map((h) => h.reverse()),
      treeDepth: merkleProof.merkle.length,
    };

    // verify merkle proof using tx id
    const verify = verifyMerkleProof(
      hexToBytes(txId),
      hexToBytes(merkleRoot).reverse(),
      proof,
      deployer
    );
    expect(verify.result).toBeOk(Cl.bool(true));

    // verify tx was mined
    const result = wasTxMinedCompact(
      bitcoinHeight,
      txHex,
      headerHex,
      proof,
      deployer
    );
    expect(result.result).toBeOk(Cl.buffer(hexToBytes(txId)));
  });
});
