// Load environment variables from .env file
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Enable parsing of JSON request bodies
app.use(express.static(__dirname)); // Serve static files from the root directory

// --- API Endpoint ---
app.post('/api/chat', async (req, res) => {
    const { prompt } = req.body; // Get the prompt from the frontend
    const hfToken = process.env.HF_API_TOKEN; // Get the secret key from the .env file

    if (!prompt || !hfToken) {
        return res.status(400).json({ error: 'Prompt or API token is missing.' });
    }

    const modelUrl = "https://api-inference.huggingface.co/models/minpeter/LoRA-Qwen3-4b-v1-iteration-02-sf-apigen-02";

    try {
        const hfResponse = await fetch(modelUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${hfToken}` // Key is securely added here
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_new_tokens: 512,
                    return_full_text: false,
                }
            })
        });

        if (!hfResponse.ok) {
            const errorData = await hfResponse.json();
            throw new Error(errorData.error || 'Hugging Face API error');
        }

        const data = await hfResponse.json();
        // Send the response from Hugging Face back to our frontend
        res.json({ response: data[0].generated_text.trim() });

    } catch (error) {
        console.error('Error proxying to Hugging Face:', error);
        res.status(500).json({ error: 'Failed to get a response from the AI.' });
    }
});

// --- Serve the HTML file ---
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/home.html');
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`✅ Server is running at http://localhost:${PORT}`);
});// JavaScript Document