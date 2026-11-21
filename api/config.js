module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.status(200).json({
        botName: 'Muhammad Ahmed AI Assistant',
        websiteUrl: process.env.WEBSITE_URL || '',
        debug: process.env.DEBUG === 'true'
    });
};
