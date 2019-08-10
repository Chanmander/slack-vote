var motion = ''
  , dbActions = require('./../persist.js')
  , tally = require('./../tally.js')
  , activeMotion = ''
  , redis = require('redis')
  , motionnameText = ''
  , triggerWord = ''
  , channelId = ''
  , slackRes = ''
  , rtg = ''
  , newMotionID = ''
  , userName = ''
  , ts = Math.floor(Date.now() / 1000);

exports.post = function (req, res, next) {

    console.log('Start vote route.');

    /*
     * Start motion data.
     */
    motionnameText = req.body.text;
    triggerWord = req.body.trigger_word;
    channelId = req.body.channel_id;
    userName = req.body.user_name;
    motionnameText = motionnameText.replace(triggerWord + ' ', '');
    motion = {
        "motionName": motionnameText,
        "hasSecond": false,
        "active": 1,
        "answers": []
    };

    newMotionID = Date.now();

    /*
     * Set new motion with the active motion id.
     * Print confirmation and vote message.
     */
    console.log('Setting up new motion with ID: ' + newMotionID);
    dbActions.setMotion(newMotionID, JSON.stringify(motion), printNewMotion);

    function printNewMotion() {
        console.log('New motion is set up with the ID: ' + newMotionID);
        dbActions.getMotion(newMotionID, confirmNewMotion);
    }

    function confirmNewMotion(data) {
        var printedMotion = tally.printMotion(JSON.parse(data));
        res.json({
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
        });
    }

};
