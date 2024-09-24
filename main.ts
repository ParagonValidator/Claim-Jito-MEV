import {BN, Idl, Program} from "@coral-xyz/anchor";
import JITO_IDL from "./jito_tip_distribution.json";
import {Connection, Keypair, PublicKey} from "@solana/web3.js";
import * as fs from "fs";
import * as dotenv from "dotenv";
const JSONStream = require('JSONStream');

dotenv.config();

const JITO_PROGRAM_ID = new PublicKey(
    "4R3gSG8BpU4t19KYj8CfnbtRpnT8gtk4dvTHxVRwc2r7"
);
const CLAIM_STATUS_SEED = "CLAIM_STATUS";

type TreeNode = {
    claimant: string;
    claim_status_pubkey: string;
    claim_status_bump: number;
    staker_pubkey: string;
    withdrawer_pubkey: string;
    amount: number;
    proof: any[];
};

const connection = new Connection(process.env.RPC_URL || "");
const walletKeypair = Keypair.fromSecretKey(
    Uint8Array.from(
        JSON.parse(fs.readFileSync(process.env.KEY_PATH || "", "utf-8"))
    )
);

function findClaimant(claimant: string): Promise<TreeNode | null> {
    return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream("tree.json", {encoding: "utf-8"});
        const jsonStream = JSONStream.parse(
            "generated_merkle_trees.*.tree_nodes.*"
        ); // Adjust the parse pattern as needed

        readStream
            .pipe(jsonStream)
            .on("data", (data: TreeNode) => {
                if (data.claimant === claimant) {
                    readStream.destroy(); // Stop reading the file
                    resolve(data); // Resolve the promise with the found object
                }
            })
            .on("end", () => {
                resolve(null); // Resolve with null if claimant is not found
            })
            .on("error", (err: Error) => {
                reject(err); // Reject the promise if an error occurs
            });
    });
}

const claimJitoMEV = async () => {
    const tipDistribution = new Program(JITO_IDL as Idl, JITO_PROGRAM_ID, {
        connection,
    });
    const epochInfo = await connection.getEpochInfo();

    const claimant = new PublicKey("VotESBSkLKU8vebS6wTR2rzWWJsLc6YThYS6tebPxXq");
    const configAccount = new PublicKey(
        "STGR71TeAeycQUDKzku1GqPQdErQcTcdqxJuQmCjBu6"
    );

    const claimData = await findClaimant(claimant.toBase58());

    if (!claimData) return;

    const epochBuffer = Buffer.alloc(8); // allocate 8 bytes for u64
    epochBuffer.writeBigUInt64LE(BigInt(epochInfo.epoch - 1));

    const [tipDistributionAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("TIP_DISTRIBUTION_ACCOUNT"), claimant.toBuffer(), epochBuffer],
        JITO_PROGRAM_ID
    );

    const [claimStatus, _bump] = PublicKey.findProgramAddressSync(
        [
            Buffer.from(CLAIM_STATUS_SEED, "utf8"),
            claimant.toBuffer(),
            tipDistributionAccount.toBuffer(),
        ],
        tipDistribution.programId
    );

    const transaction = await tipDistribution.methods
        .claim(_bump, new BN(claimData.amount), claimData.proof)
        .accounts({
            config: configAccount,
            tipDistributionAccount,
            claimStatus,
            claimant: claimant,
            payer: walletKeypair.publicKey,
        })
        .transaction();

    const blockhashInfo = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhashInfo.blockhash;
    transaction.feePayer = walletKeypair.publicKey;
    transaction.sign(walletKeypair);

    console.log(
        "Sig:",
        await connection.sendRawTransaction(transaction.serialize())
    );
};
(async () => {
    await claimJitoMEV()
})()
