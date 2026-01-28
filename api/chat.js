import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  try {
    // Validate API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('❌ ANTHROPIC_API_KEY not found in environment variables');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'API key not configured'
      });
    }

    // Validate request body
    const { model, max_tokens, system, messages } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Messages array is required and must not be empty'
      });
    }

    console.log('📥 Request received:', {
      model: model || 'claude-sonnet-4-20250514',
      messagesCount: messages.length,
      systemPromptLength: system ? system.length : 0
    });

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: apiKey
    });

    // Call Claude API
    const response = await anthropic.messages.create({
      model: model || 'claude-sonnet-4-20250514',
      max_tokens: max_tokens || 1000,
      system: system || 'You are Porsenna, a helpful AI assistant for Podere Grotta Antica.',
      messages: messages
    });

    console.log('✅ Response received from Claude API');

    // Return response
    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ Error:', error);

    // Handle Anthropic API errors
    if (error.status) {
      return res.status(error.status).json({
        error: 'Anthropic API error',
        message: error.message,
        type: error.type
      });
    }

    // Handle other errors
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
