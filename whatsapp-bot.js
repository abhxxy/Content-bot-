const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Initialize the client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Store user sessions
const userSessions = new Map();

// Store bot startup time
const botStartTime = Date.now();

// Store admin messages with user chat IDs for tracking
const adminMessageTracker = new Map();

// Session states
const STATES = {
    WELCOME: 'welcome',
    SELECT_VERSION: 'select_version',
    MODIFY_PAGE: 'modify_page',
    MODIFY_OLD_CONTENT: 'modify_old_content',
    MODIFY_NEW_CONTENT: 'modify_new_content',
    MODIFY_CONFIRM: 'modify_confirm',
    ADD_TYPE: 'add_type',
    ADD_ARTICLE_DATE: 'add_article_date',
    ADD_ARTICLE_TITLE: 'add_article_title',
    ADD_ARTICLE_ABSTRACT: 'add_article_abstract',
    ADD_ARTICLE_CONTENT: 'add_article_content',
    ADD_ARTICLE_IMAGE_PROMPT: 'add_article_image_prompt',
    ADD_ARTICLE_IMAGE: 'add_article_image',
    ADD_JOB_TITLE: 'add_job_title',
    ADD_JOB_DEPARTMENT: 'add_job_department',
    ADD_JOB_LOCATION: 'add_job_location',
    ADD_JOB_OFFER: 'add_job_offer',
    ADD_CONFIRM: 'add_confirm',
    DELETE_CONTENT: 'delete_content',
    DELETE_CONFIRM: 'delete_confirm'
};

// Generate QR code
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('QR Code generated! Scan it with WhatsApp.');
});

// Client ready
client.on('ready', () => {
    console.log('✅ WhatsApp Bot is ready!');
    console.log(`Bot started at: ${new Date(botStartTime).toLocaleString()}`);
    console.log('Ignoring all messages sent before this time.');
});

// Handle incoming messages
client.on('message', async (msg) => {
    // Ignore messages sent before bot startup
    const messageTimestamp = msg.timestamp * 1000; // Convert to milliseconds
    if (messageTimestamp < botStartTime) {
        console.log('Ignoring old message from before bot startup');
        return;
    }
    
    const chatId = msg.from;
    
    // Get or create user session
    if (!userSessions.has(chatId)) {
        userSessions.set(chatId, {
            state: STATES.WELCOME,
            data: {}
        });
    }
    
    const session = userSessions.get(chatId);
    
    // Handle different states
    switch (session.state) {
        case STATES.WELCOME:
            await handleWelcome(msg, session);
            break;
            
        case STATES.SELECT_VERSION:
            await handleSelectVersion(msg, session);
            break;
            
        case STATES.MODIFY_PAGE:
            await handleModifyPage(msg, session);
            break;
            
        case STATES.MODIFY_OLD_CONTENT:
            await handleModifyOldContent(msg, session);
            break;
            
        case STATES.MODIFY_NEW_CONTENT:
            await handleModifyNewContent(msg, session);
            break;
            
        case STATES.MODIFY_CONFIRM:
            await handleModifyConfirm(msg, session);
            break;
            
        case STATES.ADD_TYPE:
            await handleAddType(msg, session);
            break;
            
        case STATES.ADD_ARTICLE_DATE:
            await handleAddArticleDate(msg, session);
            break;
            
        case STATES.ADD_ARTICLE_TITLE:
            await handleAddArticleTitle(msg, session);
            break;
            
        case STATES.ADD_ARTICLE_ABSTRACT:
            await handleAddArticleAbstract(msg, session);
            break;
            
        case STATES.ADD_ARTICLE_CONTENT:
            await handleAddArticleContent(msg, session);
            break;
            
        case STATES.ADD_ARTICLE_IMAGE_PROMPT:
            await handleAddArticleImagePrompt(msg, session);
            break;
            
        case STATES.ADD_ARTICLE_IMAGE:
            await handleAddArticleImage(msg, session);
            break;
            
        case STATES.ADD_JOB_TITLE:
            await handleAddJobTitle(msg, session);
            break;
            
        case STATES.ADD_JOB_DEPARTMENT:
            await handleAddJobDepartment(msg, session);
            break;
            
        case STATES.ADD_JOB_LOCATION:
            await handleAddJobLocation(msg, session);
            break;
            
        case STATES.ADD_JOB_OFFER:
            await handleAddJobOffer(msg, session);
            break;
            
        case STATES.ADD_CONFIRM:
            await handleAddConfirm(msg, session);
            break;
            
        case STATES.DELETE_CONTENT:
            await handleDeleteContent(msg, session);
            break;
            
        case STATES.DELETE_CONFIRM:
            await handleDeleteConfirm(msg, session);
            break;
    }
});

// Handler functions
async function handleWelcome(msg, session) {
    const messageBody = msg.body.toLowerCase();
    
    if (messageBody.includes('modify') || messageBody === '1') {
        session.state = STATES.SELECT_VERSION;
        session.data = { action: 'modify' };
        await msg.reply('Great! Please select the website version:\n\nA - FR (France)\nB - CH (Switzerland)\nC - AE (UAE)\n\nPlease reply with A, B, or C:');
    }
    else if (messageBody.includes('add') || messageBody === '2') {
        session.state = STATES.SELECT_VERSION;
        session.data = { action: 'add' };
        await msg.reply('Great! Please select the website version:\n\nA - FR (France)\nB - CH (Switzerland)\nC - AE (UAE)\n\nPlease reply with A, B, or C:');
    }
    else if (messageBody.includes('delete') || messageBody === '3') {
        session.state = STATES.SELECT_VERSION;
        session.data = { action: 'delete' };
        await msg.reply('Great! Please select the website version:\n\nA - FR (France)\nB - CH (Switzerland)\nC - AE (UAE)\n\nPlease reply with A, B, or C:');
    }
    else {
        await sendWelcomeMessage(msg);
    }
}

async function sendWelcomeMessage(msg) {
    const welcomeText = `Hi 👋! What would you like to do today?

1️⃣ 📝 Modify Existing Content
2️⃣ ➕ Add New Content  
3️⃣ ❌ Delete Content

Please reply with 1, 2, or 3`;
    
    await msg.reply(welcomeText);
}

async function handleSelectVersion(msg, session) {
    const messageBody = msg.body.toUpperCase().trim();
    
    if (messageBody === 'A') {
        session.data.version = 'FR (France)';
    } else if (messageBody === 'B') {
        session.data.version = 'CH (Switzerland)';
    } else if (messageBody === 'C') {
        session.data.version = 'AE (UAE)';
    } else {
        await msg.reply('Please select a valid version: A (FR), B (CH), or C (AE)');
        return;
    }
    
    if (session.data.action === 'modify') {
        session.state = STATES.MODIFY_PAGE;
        await msg.reply('Now, please tell me which page you want to modify (e.g., Home, About, Careers):');
    } else if (session.data.action === 'add') {
        session.state = STATES.ADD_TYPE;
        await msg.reply('Awesome! What type of content do you want to add?\n\n📰 Article\n💼 Job Opening\n\nPlease type "article" or "job":');
    } else if (session.data.action === 'delete') {
        session.state = STATES.DELETE_CONTENT;
        await msg.reply('Please paste the content you want to delete:');
    }
}

async function handleModifyPage(msg, session) {
    session.data.page = msg.body;
    session.state = STATES.MODIFY_OLD_CONTENT;
    await msg.reply('Please paste the existing content you want to modify:');
}

async function handleModifyOldContent(msg, session) {
    session.data.oldContent = msg.body;
    session.state = STATES.MODIFY_NEW_CONTENT;
    await msg.reply('Now, please send me the new content that should replace it:');
}

async function handleModifyNewContent(msg, session) {
    session.data.newContent = msg.body;
    session.state = STATES.MODIFY_CONFIRM;
    
    const confirmMessage = `✅ Got it! Here's what I will submit:

🌍 *Website Version:* ${session.data.version}
📄 *Page:* ${session.data.page}

*Old Content:* 
${session.data.oldContent.substring(0, 100)}${session.data.oldContent.length > 100 ? '...' : ''}

*New Content:* 
${session.data.newContent.substring(0, 100)}${session.data.newContent.length > 100 ? '...' : ''}

Reply "confirm" to proceed or "restart" to start over`;
    
    await msg.reply(confirmMessage);
}

async function handleModifyConfirm(msg, session) {
    const messageBody = msg.body.toLowerCase();
    
    if (messageBody.includes('confirm')) {
        await submitModifyRequest(session.data, msg.from);
        await msg.reply('✅ Your modification request has been submitted successfully and will be live within 24/48h!');
        resetSession(session);
        setTimeout(async () => {
            await sendWelcomeMessage(msg);
        }, 2000);
    } else if (messageBody.includes('restart')) {
        resetSession(session);
        await sendWelcomeMessage(msg);
    } else {
        await msg.reply('Please reply with "confirm" or "restart"');
    }
}

async function handleAddType(msg, session) {
    const messageBody = msg.body.toLowerCase();
    
    if (messageBody.includes('article') || messageBody.includes('blog')) {
        session.data.contentType = 'Article';
        session.state = STATES.ADD_ARTICLE_DATE;
        await msg.reply('📅 Please enter the article date (e.g., January 15, 2025):');
    } else if (messageBody.includes('job')) {
        session.data.contentType = 'Job Opening';
        session.state = STATES.ADD_JOB_TITLE;
        await msg.reply('💼 Please enter the job title:');
    } else {
        await msg.reply('Please type "article" for Article/Blog Post or "job" for Job Opening:');
        return;
    }
}

async function handleAddArticleDate(msg, session) {
    session.data.articleDate = msg.body;
    session.state = STATES.ADD_ARTICLE_TITLE;
    await msg.reply('📝 Please enter the article title:');
}

async function handleAddArticleTitle(msg, session) {
    session.data.articleTitle = msg.body;
    session.state = STATES.ADD_ARTICLE_ABSTRACT;
    await msg.reply('📄 Please enter the article abstract/summary:');
}

async function handleAddArticleAbstract(msg, session) {
    session.data.articleAbstract = msg.body;
    session.state = STATES.ADD_ARTICLE_CONTENT;
    await msg.reply('📖 Please enter the full article content:');
}

async function handleAddArticleContent(msg, session) {
    session.data.articleContent = msg.body;
    session.state = STATES.ADD_ARTICLE_IMAGE_PROMPT;
    await msg.reply('Would you like to attach an image to this article?\n\nPlease reply with "yes" or "no":');
}

async function handleAddArticleImagePrompt(msg, session) {
    const messageBody = msg.body.toLowerCase().trim();
    
    if (messageBody === 'yes' || messageBody === 'y') {
        session.state = STATES.ADD_ARTICLE_IMAGE;
        await msg.reply('📷 Please send the image for the article:');
    } else if (messageBody === 'no' || messageBody === 'n') {
        session.data.hasImage = false;
        session.state = STATES.ADD_CONFIRM;
    
        const confirmMessage = `✅ Got it! Here's what I will submit:

🌍 *Website Version:* ${session.data.version}
📋 *Type:* Article

📅 *Date:* ${session.data.articleDate}
📝 *Title:* ${session.data.articleTitle}
📄 *Abstract:* ${session.data.articleAbstract.substring(0, 100)}${session.data.articleAbstract.length > 100 ? '...' : ''}
📖 *Article:* ${session.data.articleContent.substring(0, 100)}${session.data.articleContent.length > 100 ? '...' : ''}
📷 *Image:* No

Reply "confirm" to proceed or "restart" to start over`;
        
        await msg.reply(confirmMessage);
    } else {
        await msg.reply('Please reply with "yes" or "no":');
    }
}

async function handleAddArticleImage(msg, session) {
    if (msg.hasMedia) {
        const media = await msg.downloadMedia();
        session.data.articleImage = media;
        session.data.hasImage = true;
        session.state = STATES.ADD_CONFIRM;
        
        const confirmMessage = `✅ Got it! Here's what I will submit:

🌍 *Website Version:* ${session.data.version}
📋 *Type:* Article

📅 *Date:* ${session.data.articleDate}
📝 *Title:* ${session.data.articleTitle}
📄 *Abstract:* ${session.data.articleAbstract.substring(0, 100)}${session.data.articleAbstract.length > 100 ? '...' : ''}
📖 *Article:* ${session.data.articleContent.substring(0, 100)}${session.data.articleContent.length > 100 ? '...' : ''}
📷 *Image:* Yes (attached)

Reply "confirm" to proceed or "restart" to start over`;
        
        await msg.reply(confirmMessage);
    } else {
        await msg.reply('Please send an image or reply "skip" to continue without an image:');
        if (msg.body.toLowerCase() === 'skip') {
            session.data.hasImage = false;
            session.state = STATES.ADD_CONFIRM;
            
            const confirmMessage = `✅ Got it! Here's what I will submit:

🌍 *Website Version:* ${session.data.version}
📋 *Type:* Article

📅 *Date:* ${session.data.articleDate}
📝 *Title:* ${session.data.articleTitle}
📄 *Abstract:* ${session.data.articleAbstract.substring(0, 100)}${session.data.articleAbstract.length > 100 ? '...' : ''}
📖 *Article:* ${session.data.articleContent.substring(0, 100)}${session.data.articleContent.length > 100 ? '...' : ''}
📷 *Image:* No

Reply "confirm" to proceed or "restart" to start over`;
            
            await msg.reply(confirmMessage);
        }
    }
}

async function handleAddJobTitle(msg, session) {
    session.data.jobTitle = msg.body;
    session.state = STATES.ADD_JOB_DEPARTMENT;
    await msg.reply('🏢 Please enter the department:');
}

async function handleAddJobDepartment(msg, session) {
    session.data.jobDepartment = msg.body;
    session.state = STATES.ADD_JOB_LOCATION;
    await msg.reply('📍 Please enter the location:');
}

async function handleAddJobLocation(msg, session) {
    session.data.jobLocation = msg.body;
    session.state = STATES.ADD_JOB_OFFER;
    await msg.reply('📋 Please enter the full job offer description:');
}

async function handleAddJobOffer(msg, session) {
    session.data.jobOffer = msg.body;
    session.state = STATES.ADD_CONFIRM;
    
    const confirmMessage = `✅ Got it! Here's what I will submit:

🌍 *Website Version:* ${session.data.version}
📋 *Type:* Job Opening

💼 *Job Title:* ${session.data.jobTitle}
🏢 *Department:* ${session.data.jobDepartment}
📍 *Location:* ${session.data.jobLocation}
📋 *Job Offer:* ${session.data.jobOffer.substring(0, 150)}${session.data.jobOffer.length > 150 ? '...' : ''}

Reply "confirm" to proceed or "restart" to start over`;
    
    await msg.reply(confirmMessage);
}

async function handleAddConfirm(msg, session) {
    const messageBody = msg.body.toLowerCase();
    
    if (messageBody.includes('confirm')) {
        await submitAddRequest(session.data, msg.from);
        await msg.reply('✅ Your new content has been submitted successfully and will be live within 24/48h!');
        resetSession(session);
        setTimeout(async () => {
            await sendWelcomeMessage(msg);
        }, 2000);
    } else if (messageBody.includes('restart')) {
        resetSession(session);
        await sendWelcomeMessage(msg);
    } else {
        await msg.reply('Please reply with "confirm" or "restart"');
    }
}

async function handleDeleteContent(msg, session) {
    session.data.contentToDelete = msg.body;
    session.state = STATES.DELETE_CONFIRM;
    
    const confirmMessage = `✅ Got it! Here's what I will submit:

🌍 *Website Version:* ${session.data.version}
🗑️ *Content to Delete:*
${session.data.contentToDelete.substring(0, 200)}${session.data.contentToDelete.length > 200 ? '...' : ''}

Reply "confirm" to proceed or "restart" to start over`;
    
    await msg.reply(confirmMessage);
}

async function handleDeleteConfirm(msg, session) {
    const messageBody = msg.body.toLowerCase();
    
    if (messageBody.includes('confirm')) {
        await submitDeleteRequest(session.data, msg.from);
        await msg.reply('✅ Your deletion request has been submitted successfully and will be live within 24/48h!');
        resetSession(session);
        setTimeout(async () => {
            await sendWelcomeMessage(msg);
        }, 2000);
    } else if (messageBody.includes('restart')) {
        resetSession(session);
        await sendWelcomeMessage(msg);
    } else {
        await msg.reply('Please reply with "confirm" or "restart"');
    }
}

// Admin WhatsApp number to receive all submissions
const ADMIN_NUMBER = '971522873732@c.us'; // Replace with actual number (format: countrycode+number@c.us)

// Submit functions - send to admin WhatsApp
async function submitModifyRequest(data, userChatId) {
    console.log('Submitting modify request:', data);
    
    const adminMessage = `📝 *NEW MODIFICATION REQUEST*
    
🌍 *Website Version:* ${data.version}
*Page:* ${data.page}

*Old Content:*
${data.oldContent}

*New Content:*
${data.newContent}

*Submitted at:* ${new Date().toLocaleString()}`;
    
    try {
        const sentMessage = await client.sendMessage(ADMIN_NUMBER, adminMessage);
        // Track the message ID with the user's chat ID
        adminMessageTracker.set(sentMessage.id._serialized, {
            userChatId: userChatId,
            requestType: 'modification',
            data: data
        });
        console.log('Modification request sent to admin');
    } catch (error) {
        console.error('Error sending to admin:', error);
    }
}

async function submitAddRequest(data, userChatId) {
    console.log('Submitting add request:', data);
    
    let adminMessage;
    
    if (data.contentType === 'Article') {
        adminMessage = `➕ *NEW ARTICLE REQUEST*
    
🌍 *Website Version:* ${data.version}
📅 *Date:* ${data.articleDate}
📝 *Title:* ${data.articleTitle}
📷 *Has Image:* ${data.hasImage ? 'Yes' : 'No'}

📄 *Abstract:*
${data.articleAbstract}

📖 *Article:*
${data.articleContent}

*Submitted at:* ${new Date().toLocaleString()}`;
        
        if (data.hasImage && data.articleImage) {
            try {
                const sentMessage = await client.sendMessage(ADMIN_NUMBER, adminMessage, { media: data.articleImage });
                // Track the message ID with the user's chat ID
                adminMessageTracker.set(sentMessage.id._serialized, {
                    userChatId: userChatId,
                    requestType: 'add-article',
                    data: data
                });
                console.log('Add request with image sent to admin');
                return;
            } catch (error) {
                console.error('Error sending with image to admin:', error);
            }
        }
    } else if (data.contentType === 'Job Opening') {
        adminMessage = `➕ *NEW JOB OPENING REQUEST*
    
🌍 *Website Version:* ${data.version}
💼 *Job Title:* ${data.jobTitle}
🏢 *Department:* ${data.jobDepartment}
📍 *Location:* ${data.jobLocation}

📋 *Job Offer:*
${data.jobOffer}

*Submitted at:* ${new Date().toLocaleString()}`;
    }
    
    try {
        const sentMessage = await client.sendMessage(ADMIN_NUMBER, adminMessage);
        // Track the message ID with the user's chat ID
        adminMessageTracker.set(sentMessage.id._serialized, {
            userChatId: userChatId,
            requestType: data.contentType === 'Article' ? 'add-article' : 'add-job',
            data: data
        });
        console.log('Add request sent to admin');
    } catch (error) {
        console.error('Error sending to admin:', error);
    }
}

async function submitDeleteRequest(data, userChatId) {
    console.log('Submitting delete request:', data);
    
    const adminMessage = `❌ *DELETE REQUEST*
    
🌍 *Website Version:* ${data.version}
*Content to Delete:*
${data.contentToDelete}

*Submitted at:* ${new Date().toLocaleString()}`;
    
    try {
        const sentMessage = await client.sendMessage(ADMIN_NUMBER, adminMessage);
        // Track the message ID with the user's chat ID
        adminMessageTracker.set(sentMessage.id._serialized, {
            userChatId: userChatId,
            requestType: 'delete',
            data: data
        });
        console.log('Delete request sent to admin');
    } catch (error) {
        console.error('Error sending to admin:', error);
    }
}

// Reset session
function resetSession(session) {
    session.state = STATES.WELCOME;
    session.data = {};
}

// Error handling
client.on('auth_failure', msg => {
    console.error('Authentication failed:', msg);
});

client.on('disconnected', (reason) => {
    console.log('Client was disconnected:', reason);
});

// Handle message reactions
client.on('message_reaction', async (reaction) => {
    try {
        // Check if the reaction is on a message we sent to admin
        const messageId = reaction.msgId._serialized;
        
        if (adminMessageTracker.has(messageId)) {
            // Check if the reaction is from the admin
            if (reaction.senderId === ADMIN_NUMBER) {
                const trackedInfo = adminMessageTracker.get(messageId);
                const userChatId = trackedInfo.userChatId;
                const requestType = trackedInfo.requestType;
                
                // Map reaction emojis to messages
                let confirmationMessage = '';
                
                if (reaction.reaction === '👍' || reaction.reaction === '✅') {
                    confirmationMessage = `✅ Great news! Your ${requestType} request has been approved by the admin and is being processed.`;
                } else if (reaction.reaction === '❌' || reaction.reaction === '👎') {
                    confirmationMessage = `❌ Your ${requestType} request has been reviewed. The admin will contact you shortly with feedback.`;
                } else if (reaction.reaction === '👀' || reaction.reaction === '⏳') {
                    confirmationMessage = `👀 Your ${requestType} request is being reviewed by the admin.`;
                } else {
                    // For any other reaction, send a generic acknowledgment
                    confirmationMessage = `📬 Update: The admin has reviewed your ${requestType} request.`;
                }
                
                // Send confirmation to the original user
                try {
                    await client.sendMessage(userChatId, confirmationMessage);
                    console.log(`Confirmation sent to user for ${requestType} request`);
                    
                    // Optional: Clean up the tracker after sending confirmation
                    // adminMessageTracker.delete(messageId);
                } catch (error) {
                    console.error('Error sending confirmation to user:', error);
                }
            }
        }
    } catch (error) {
        console.error('Error handling message reaction:', error);
    }
});

// Initialize the client
client.initialize();