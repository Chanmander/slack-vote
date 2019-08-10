var motion = ''
    , _ = require('underscore')
    , dbActions = require('./../persist.js')
    , tally = require('./../tally.js')
    , redis = require('redis')
    , actionType = ''
    , motionId = ''
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
    , text = ''
    , answerMatch = false;


/*
 * Handle voting actions.
 */
exports.post = function (req, res, next) {
    var body = req.body;
    var payload = JSON.parse(body.payload);
    var user = payload.user;
    userName = user.name;

    console.log(payload);

    var callbackIdParts = payload.callback_id.split('_');
    actionType = callbackIdParts[0];
    motionId = callbackIdParts[1];

    /*
     * Get motion with ID.
     */
    dbActions.getMotion(motionId, setData);

    function setData(motion_string) {
        console.log('Motion prior to submission: ' + motion_string);
        if (motion_string) {
            data = JSON.parse(motion_string);
            if (data.active === 1) {
                console.log('Action type: ' + actionType);
                switch (actionType) {
                    case 'second':
                        text = 'Got a second from ' + userName + '!';
                        data.hasSecond = true;
                        console.log('Seconded motion ' + motionId + '!');
                        break;
                    case 'vote':
                        text = 'Got a vote from ' + userName + '!';
                        break;
                    default:
                        res.json({
                            text: 'Did not understand the action.'
                        });
                }

                dbActions.setMotion(motionId, JSON.stringify(data), handleResults);
            } else {
                res.json({
                    text: 'Motion inactive.' + data
                });
            }
        }
    }

    function handleResults() {
        var printedMotion = tally.printMotion(data);
        res.json({
            "text": text,
            "attachments": [
                {
                    "text": printedMotion,
                    "fallback": "You are unable to vote.",
                    "callback_id": "vote_" + motionId,
                    "color": "#3AA3E3",
                    "attachment_type": "default",
                    "actions": [
                        {
                            "name": "yes",
                            "text": "Yay",
                            "type": "button",
                            "value": "yes"
                        },
                        {
                            "name": "no",
                            "text": "Nay",
                            "type": "button",
                            "value": "yes"
                        }
                    ]
                }
            ]
        });
    }
}