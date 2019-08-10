var motion = ''
    , _ = require('underscore')
    , dbActions = require('./../persist.js')
    , tally = require('./../tally.js')
    , redis = require('redis')
    , activeMotion = ''
    , slackRes = ''
    , motionResults = ''
    , answerText = ''
    , userName = ''
    , userID = ''
    , timestamp = ''
    , channelID = ''
    , triggerWord = ''
    , data = undefined
    , answerMatch = false;


/*
 * Handle voting actions.
 */
exports.post = function (req, res, next) {
    console.log(req.body);

    userName = user.name;

    res.json({text: 'Got a second from ' + userName + '!'});
}