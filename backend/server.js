require('dotenv').config();
const express = require('express');
const cors = require('cors');
const storage = require('./services/storage');
const agent = require('./services/agent');

const app = express();
app.use(cors());
app.use(express.json());

// --- REST API ENDPOINTS --- //

app.get('/debts', async (req, res) => {
    try {
        const address = req.query.address;
        const debts = await storage.getDebts();
        if (address) {
            res.json(debts.filter(d => d.creditorAddress && d.creditorAddress.toLowerCase() === address.toLowerCase()));
        } else {
            res.json(debts);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/debts', async (req, res) => {
    try {
        const { name, amount, creditorAddress, txHash } = req.body;
        if (!name || amount === undefined || !creditorAddress) {
            return res.status(400).json({ error: "Missing name, amount, or creditorAddress" });
        }
        const newDebt = await agent.addDebt(name, amount, creditorAddress, txHash);
        res.json(newDebt);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/reminder', async (req, res) => {
    // Triggers reminder engine manually (for API/UI convenience)
    try {
        await agent.reminderEngine();
        res.json({ message: "Reminder engine executed" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mock simulation endpoint for testing UI easily
app.post('/simulate-payment', async (req, res) => {
    try {
        const { id } = req.body;
        const updated = await storage.updateDebt(id, { status: "paid" });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CLI INTERFACE --- //

const args = process.argv.slice(2);
if (args.length > 0) {
    const command = args[0];

    (async () => {
        try {
            if (command === 'add') {
                const name = args[1];
                const amount = args[2];
                if (!name || !amount) {
                    console.error("Usage: node server.js add <name> <amount>");
                    process.exit(1);
                }
                await agent.addDebt(name, amount);
                console.log("Success! Run 'node server.js list' to see it.");
            } else if (command === 'list') {
                const debts = await storage.getDebts();
                console.log("--- CURRENT DEBTS ---");
                console.table(debts.map(d => ({
                    Name: d.name,
                    Amount: d.amount,
                    Status: d.status,
                    ID: d.id
                })));
            } else if (command === 'check') {
                await agent.checkPayments();
                await agent.reminderEngine();
                console.log("Check complete.");
            } else if (command === 'request') {
                const debtId = args[1];
                if (!debtId) {
                    console.error("Usage: node server.js request <debtId>");
                    process.exit(1);
                }
                const req = await agent.generatePaymentRequest(debtId);
                console.log("\n==============================");
                console.log(req.message);
                console.log("==============================\n");
            } else {
                console.error("Unknown command. Available commands: add, list, check, request");
            }
        } catch (err) {
            console.error("Error:", err.message);
        } finally {
            process.exit(0);
        }
    })();
} else {
    // --- SERVER & AUTONOMOUS LOOP --- //
    
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`🚀 Pay Me Back Agent running on port ${PORT}`);
        
        // AUTONOMOUS AGENT LOOP
        // Runs every 60 seconds
        setInterval(async () => {
            console.log("\n[AGENT] --- Starting Autonomous Loop ---");
            await agent.checkPayments();
            await agent.reminderEngine();
            console.log("[AGENT] --- Loop Complete ---\n");
        }, 60 * 1000);
    });
}
