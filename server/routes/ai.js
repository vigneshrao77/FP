const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/chat', async (req, res) => {
    const { message, lcData, company } = req.body;
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
        return res.status(500).json({ 
            message: 'AI API key not configured. Please add OPENROUTER_API_KEY to your server .env file.' 
        });
    }

    try {
        const systemPrompt = `
            You are an expert DSA (Data Structures and Algorithms) Mentor and Career Coach. 
            The user is currently preparing for coding interviews using a Smart Evaluation Platform.
            
            User's LeetCode Profile Analysis:
            - Username: ${lcData.username || 'Anonymous'}
            - Total Problems Solved: ${lcData.totalSolved}
            - Difficulty Breakdown: Easy (${lcData.easy}), Medium (${lcData.medium}), Hard (${lcData.hard})
            - Acceptance Rate: ${lcData.acceptance}%
            - Current Ranking: ${lcData.ranking}
            
            Current Target Focus/Company: ${company || 'General Preparation'}
            
            Guidelines for your response:
            1. Analyze their stats: 
               - If they have many Easy but few Medium, push them towards Medium.
               - If their acceptance rate is low (<50%), suggest focus on understanding rather than speed.
               - If they are strong in one area, suggest moving to Hard problems.
            2. Company Specifics:
               - If they mention a company (like Google, Amazon, Meta, Microsoft), provide insights into what that company values (e.g., Google = Complex Graphs/Trees, Amazon = High-scale System Design/Arrays, Meta = Speed/Recursion).
            3. Actionable Suggestions: Give 2-3 specific LeetCode problem types or patterns they should practice next.
            4. Tone: Professional, encouraging, and highly technical.
            
            Keep your response concise but packed with value (max 250 words).
        `;

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'openai/gpt-3.5-turbo', // Verified reliable model
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message || 'Give me a personalized DSA study plan based on my current stats.' }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'Smart Evaluation Platform'
            }
        });

        const aiResponse = response.data.choices[0].message.content;
        res.json({ response: aiResponse });
    } catch (error) {
        // Detailed logging for debugging
        if (error.response) {
            console.error('OpenRouter API Error Response:', error.response.data);
            return res.status(error.response.status).json({ 
                message: `AI Error: ${error.response.data.error?.message || 'Failed to get response from AI'}` 
            });
        }
        console.error('AI Request Error:', error.message);
        res.status(500).json({ 
            message: 'Failed to connect to AI service. Please check your network and API key.' 
        });
    }
});

module.exports = router;
