const { ethers } = require('ethers');

// Initialize provider
const provider = new ethers.JsonRpcProvider(process.env.X_LAYER_RPC, Number(process.env.CHAIN_ID));

// Initialize wallet (this is the AI Agent's master wallet)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

/**
 * Gets the current balance of the agent's wallet.
 */
async function getBalance(address = wallet.address) {
    try {
        const balance = await provider.getBalance(address);
        return ethers.formatEther(balance);
    } catch (error) {
        console.error('Error fetching balance:', error);
        throw error;
    }
}

/**
 * Sends a transaction from the agent's wallet. (For demonstration or actual payments)
 */
async function sendTransaction(to, amountStr) {
    try {
        const tx = await wallet.sendTransaction({
            to,
            value: ethers.parseEther(amountStr)
        });
        console.log(`Transaction sent! Hash: ${tx.hash}`);
        await tx.wait();
        console.log(`Transaction confirmed!`);
        return tx;
    } catch (error) {
        console.error('Error sending transaction:', error);
        throw error;
    }
}

/**
 * Scans recent blocks for incoming transactions to the specified address.
 * Since parsing all transactions perfectly requires an indexer, 
 * for MVP we might just check if balance increased or returned fake/mock success.
 * Here we provide a mock incoming check or real balance check.
 */
async function getIncomingTransactions(address = wallet.address) {
    // In a real production app without an indexer, fetching full transaction history is tough via RPC.
    // We will simulate incoming transactions or just rely on a balance difference for the MVP hackathon.
    console.log(`Checking incoming transactions for ${address}`);
    return [];
}

/**
 * Returns the main agent wallet address to receive payments.
 */
function getAgentWalletAddress() {
    return wallet.address;
}

module.exports = {
    provider,
    wallet,
    getBalance,
    sendTransaction,
    getIncomingTransactions,
    getAgentWalletAddress
};
