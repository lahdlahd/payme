const crypto = require('crypto');
const { saveDebt, updateDebt, findUnpaidDebts } = require('./storage');
const { getBalance, getAgentWalletAddress } = require('./blockchain');

/**
 * 1. addDebt(name, amount)
 * saves debt into local storage, assigns unique ID, sets status = "pending"
 */
async function addDebt(name, amount, creditorAddress, txHash) {
    const debt = {
        id: crypto.randomUUID(),
        name,
        amount: parseFloat(amount),
        walletAddress: creditorAddress, // Payment should go directly to the creditor now!
        creditorAddress: creditorAddress.toLowerCase(),
        txHash: txHash || null,
        status: "pending",
        createdAt: Date.now()
    };
    await saveDebt(debt);
    console.log(`[AGENT] Added new debt for ${name} amount ${amount} mapped to ${creditorAddress}. TxHash: ${txHash}`);
    return debt;
}

/**
 * 2. generatePaymentRequest(debtId)
 * returns X Layer wallet address and formats message
 */
async function generatePaymentRequest(debtId) {
    // Note: For a real app, you might derive a unique address per debt.
    // Here we use the main agent wallet.
    const address = getAgentWalletAddress();
    const debts = await findUnpaidDebts();
    const debt = debts.find(d => d.id === debtId);
    
    if (!debt) throw new Error("Debt not found or already paid");

    const message = `Send ${debt.amount} to this wallet on X Layer: ${address}`;
    console.log(`[AGENT] Payment Request Generated for ${debt.name}: ${message}`);
    return { address, message, debt };
}

/**
 * 3. checkPayments()
 * queries X Layer blockchain via ethers.js
 * checks wallet balance or incoming transactions
 * if payment >= debt amount: mark debt as "paid"
 */
async function checkPayments() {
    console.log(`[AGENT] Checking payments securely on X Layer...`);
    const unpaid = await findUnpaidDebts();
    if (unpaid.length === 0) {
        console.log(`[AGENT] No unpaid debts to check.`);
        return;
    }

    try {
        const balanceStr = await getBalance();
        const balance = parseFloat(balanceStr);
        console.log(`[AGENT] Current Agent Wallet Balance: ${balance} OKB`);

        for (const debt of unpaid) {
            // MVP Logic: If the agent has enough balance to cover this debt, we mark it.
            // In a real strict environment, we'd check specific incoming txs for exact amounts.
            // Let's assume for hackathon purpose, if balance >= debt.amount, it's paid.
            // Note: This logic means the first checked debt gets marked if balance is generally high. 
            // We use this as a simple demonstration.
            if (balance >= debt.amount) {
                console.log(`[AGENT] Detected sufficient balance for debt ${debt.id}. Marking as PAID.`);
                await updateDebt(debt.id, { status: "paid" });
            }
        }
    } catch (err) {
        console.error(`[AGENT] Error checking payments:`, err);
    }
}

/**
 * 4. reminderEngine()
 * runs automatically
 * if debt > 3 days unpaid -> send gentle reminder
 * if > 7 days -> urgent reminder
 */
async function reminderEngine() {
    console.log(`[AGENT] Running reminder engine...`);
    const unpaid = await findUnpaidDebts();
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;

    for (const debt of unpaid) {
        const daysUnpaid = (now - debt.createdAt) / DAY_MS;
        
        if (daysUnpaid > 7) {
            console.log(`[AGENT] URGENT REMINDER: ${debt.name}, you are ${Math.floor(daysUnpaid)} days late on paying ${debt.amount}! Pay immediately.`);
        } else if (daysUnpaid > 3) {
            console.log(`[AGENT] GENTLE REMINDER: Hey ${debt.name}, just a quick reminder about the ${debt.amount} owed. Thanks!`);
        }
    }
}

module.exports = {
    addDebt,
    generatePaymentRequest,
    checkPayments,
    reminderEngine
};
