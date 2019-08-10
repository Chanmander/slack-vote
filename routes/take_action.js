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
    userID = user.id;

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
                        var postedVote = {
                            'userName': userName,
                            'userID': userID,
                            'timestamp': timestamp
                        };

                        var actions = payload.actions;
                        if (actions && actions.length === 1) {
                            text = 'Got a vote from ' + userName + '!';
                            var answerText = actions[0].name;

                            _.each(data.answers, function (answer) {
                                if (answerText === answer.answerName) {
                                    // there is a votes array already, because this isn't the first vote
                                    answer.votes.push(postedVote);
                                    answerMatch = true;
                                }
                            });

                            if (!answerMatch) {
                                console.log('No motion answer match, creating new motion answer for: ' + answerText);
                                newAnswer = {
                                    answerName: answerText,
                                    votes: new Array(postedVote)
                                };
                                data.answers.push(newAnswer);
                                console.log('Motion after submission: ' + motion_string);
                            }
                            answerMatch = false; // not sure why this is here - ben833
                        } else {
                            text = 'No vote recorded somehow.';
                        }

                        break;
                    default:
                        text = 'Did not understand the action.'
                }

                dbActions.setMotion(motionId, JSON.stringify(data), handleResults);
                dbActions.getMotion(motionId, function (result_string) {
                    console.log('Motion after submission: ' + result_string);
                });
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
                            "name": "Yay",
                            "text": "Yay",
                            "type": "button",
                            "value": "yes",
                            "style": "primary"
                        },
                        {
                            "name": "Nay",
                            "text": "Nay",
                            "type": "button",
                            "style": "danger"
                        }
                    ]
                }
            ]
        });
    }
}