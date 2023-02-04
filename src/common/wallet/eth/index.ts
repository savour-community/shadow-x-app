import * as ethers from 'ethers'
import { privateToAddress }  from 'ethereumjs-util'
import { Buffer } from 'buffer'
/**
 * Get address from seed
 * @param seedHex
 * @param addressIndex
 * @returns
 */
export function createEthAddress(seedHex: string, addressIndex: string) {
    const hdNode = ethers.utils.HDNode.fromSeed(Buffer.from(seedHex, "hex"));
    const {
        privateKey,
        publicKey,
        address
    } = hdNode.derivePath("m/44'/60'/0'/0/" + addressIndex + "");
    return JSON.stringify({
        privateKey,
        publicKey,
        address,
    })
}

/**
 * sign transaction
 * @param privateKeyHex
 * @param tx
 * @returns
 */
export async function signEthTransaction(params: any): Promise<string> {
    // privateKey remove 0x
    const { privateKey, nonce, from, to, gasLimit, gasPrice, amount, data, decimal, chainId, maxFeePerGas, maxPriorityFeePerGas, tokenAddress } = params;
    const wallet = new ethers.Wallet(Buffer.from(privateKey, "hex"));
    const tx: any = {
        nonce: ethers.utils.hexlify(nonce),
        from,
        to,
        gasLimit: ethers.utils.hexlify(gasLimit),
        value: ethers.utils.hexlify(ethers.utils.parseUnits(amount, decimal)),
        chainId: chainId
    }
    if (maxFeePerGas && maxPriorityFeePerGas) {
        tx.maxFeePerGas = ethers.utils.hexlify(maxFeePerGas);
        tx.maxPriorityFeePerGas = ethers.utils.hexlify(maxPriorityFeePerGas);
    } else {
        tx.gasPrice = ethers.utils.hexlify(gasPrice);
    }
    if (tokenAddress && tokenAddress !== "0x00") {
        const ABI = [
            "function transfer(address to, uint amount)"
        ];
        const iface = new ethers.utils.Interface(ABI);
        const idata = iface.encodeFunctionData("transfer", [to, ethers.utils.hexlify(amount)]);
        tx.data = idata;
        tx.to = tokenAddress;
        tx.value = 0;
    }
    if (data) {
        tx.data = data;
    }
    return await wallet.signTransaction(tx);
}

/**
 * address
 * network type
 * @param params
 */
export function verifyEthAddress(params: any) {
    const { address } = params;
    return ethers.utils.isAddress(address);
}
/**
 * import address
 * private key
 * network
 * @param privateKey
 */
export function importEthAddress(privateKey: any) {
    const address = privateToAddress(privateKey).toString("hex");
    return `0x${address}`;
}