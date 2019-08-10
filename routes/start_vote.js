var motion = ''
  , dbActions = require('./../persist.js')
  , tally = require('./../tally.js')
  , activeMotion = ''
  , redis = require('redis')
  , motionnameText = ''
  , motionNameForGroup = ''
  , triggerWord = ''
  , channelId = ''
  , newGroupId = ''
  , slackRes = ''
  , rtg = ''
  , newMotionID = ''
  , userName = ''
  , ts = Math.floor(Date.now() / 1000)
  , request = require('request')
  , token = '';

exports.post = function (req, res, next) {

    console.log('Start vote route.');

    /*
     * Start motion data.
     */
    motionnameText = req.body.text;
    triggerWord = req.body.trigger_word;
    channelId = req.body.channel_id;
    userName = req.body.user_name;
    token = req.body.token;
    motionnameText = motionnameText.replace(triggerWord + ' ', '');
    motionNameForGroup = motionnameText.replace(' ', '-').toLowerCase();
    motion = {
        "motionName": motionnameText,
        "hasSecond": false,
        "active": 1,
        "answers": [],
        "activity": []
    };

    newMotionID = Date.now();

    /*
     * Set new motion with the active motion id.
    */
    console.log('Setting up new motion with ID: ' + newMotionID);
    dbActions.setMotion(newMotionID, JSON.stringify(motion), beginPostProcessing);

    function beginPostProcessing() {
        console.log('New motion is set up with the ID: ' + newMotionID);
        createNewGroup();
    }

    function createNewGroup() {
        var newGroupRequestBody = {
            form: {
                token: token,
                name: "motion-" + motionNameForGroup
            }
        };

        request.post('https://slack.com/api/group.create', newGroupRequestBody, function (error, response, body) {
            console.log(body);
            if (body.ok) {
                var group = body.group;
                newGroupId = groupId;
                sendInitialMessage();
            } else {
                res.json({text: body.error});
            }
        });
    }

    function sendInitialMessage() {
        var printedMotion = tally.printMotion(JSON.parse(motion));
        var initMessageRequestBody = {
            form: {
                "token": token,
                "channel": newGroupId,
                "text": userName + ' has brought a motion to the floor.',
                "attachments": [
                    {
                        "text": printedMotion,
                        "fallback": "You are unable to second.",
                        "callback_id": "second_" + newMotionID,
                        "color": "#3AA3E3",
                        "attachment_type": "default",
                        "actions": [
                            {
                                "name": "second",
                                "text": "Second",
                                "type": "button",
                                "value": "second"
                            }
                        ]
                    }
                ]
            }
        };

        request.post('https://slack.com/api/chat.postMessage', initMessageRequestBody, function (error, response, body) {
            console.log(body);
            if (body.ok) {
                // Sends welcome message
                handleResults();
            } else {
                res.json({text: body.error});
            }
        });

    }

    function handleResults() {
        var printedMotion = tally.printMotion(JSON.parse(motion));
        var secondResponse = {
            "text": userName + ' has brought a motion to the floor.',
            "attachments": [
                {
                    "text": printedMotion,
                    "fallback": "You are unable to second.",
                    "callback_id": "second_" + newMotionID,
                    "color": "#3AA3E3",
                    "attachment_type": "default",
                    "actions": [
                        {
                            "name": "second",
                            "text": "Second",
                            "type": "button",
                            "value": "second"
                        }
                    ]
                }
            ]
        };

        res.json(secondResponse);
    }

};
