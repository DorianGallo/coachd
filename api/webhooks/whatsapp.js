// api/webhooks/whatsapp.js
// WhatsApp Business API Webhook for CoachD Method

export default function handler(request, response) {
  // Log the request for debugging
  console.log('=== WHATSAPP WEBHOOK CALLED ===');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', request.method);
  console.log('Query:', request.query);
  
  // Handle GET requests (Webhook verification)
  if (request.method === 'GET') {
    console.log('🔐 Verification attempt received');
    
    const mode = request.query['hub.mode'];
    const token = request.query['hub.verify_token'];
    const challenge = request.query['hub.challenge'];
    
    // Get verify token from environment variable
    const YOUR_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
    
    console.log('Verification details:', { 
      mode: mode,
      token_received: token,
      token_expected: YOUR_VERIFY_TOKEN ? '***' + YOUR_VERIFY_TOKEN.slice(-4) : 'MISSING'
    });
    
    // Check if verification tokens match
    if (mode === 'subscribe' && token === YOUR_VERIFY_TOKEN) {
      console.log('✅ Webhook verified successfully!');
      return response.status(200).send(challenge);
    } else {
      console.log('❌ Verification failed - token mismatch or missing');
      return response.status(403).json({ 
        error: 'Verification failed',
        message: 'Tokens do not match or verify token is not configured'
      });
    }
  }
  
  // Handle POST requests (Incoming messages)
  if (request.method === 'POST') {
    console.log('📨 Incoming message received');
    
    try {
      const body = request.body;
      console.log('Full webhook payload:', JSON.stringify(body, null, 2));
      
      // Extract message details
      if (body.entry && body.entry.length > 0) {
        const entry = body.entry[0];
        const changes = entry.changes && entry.changes[0];
        
        if (changes && changes.value.messages) {
          const message = changes.value.messages[0];
          console.log('📝 Message details:', {
            from: message.from,
            message_type: message.type,
            timestamp: message.timestamp,
            message_id: message.id
          });
          
          // TODO: Add your bot logic here
          // This is where you'll process the message and send replies
          console.log('🤖 Bot logic would process message here');
        }
      }
      
      // Always return 200 OK to acknowledge receipt
      console.log('✅ Acknowledged message with 200 OK');
      return response.status(200).json({ status: 'ok', message: 'Webhook processed' });
      
    } catch (error) {
      console.error('❌ Error processing webhook:', error);
      return response.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }
  
  // Handle unsupported methods
  console.log('❌ Method not allowed:', request.method);
  return response.status(405).json({ 
    error: 'Method not allowed',
    message: 'Only GET and POST methods are supported' 
  });
}
