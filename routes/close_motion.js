var data = ''
  , tally = require('./../tally.js')
  , returnText = ''
  , slackRes = ''
  , motion = ''
  , dbActions = require('./../persist.js')
  , channelId = '';

exports.post = function (req, res, next) {
    /*
     * Get motion data.
     */
    triggerWord = req.body.trigger_word;
    channelId = req.body.channel_id;
    motionId = 'activeMotion_' + channelId;

    console.log('About to close the motion for motionId: ' + motionId);
    dbActions.getMotion(motionId, setData);

    function setData(motion_string) {
        if (motion_string) {
            data = JSON.parse(motion_string);

            // disallow more voting but save the data to keep some kind of an archive
            data.active = 0;

            closeMotion(data);
        }
    }

    /*
     * Print active motion
     */
    function closeMotion(data) {
        slackRes = 'Closing active motion. Here are the final results\n ' + tally.printMotion(data);
        console.log('closeMotion: ' + slackRes);
        dbActions.disableMotion(motionId, JSON.stringify(data), confirmCloseMotion);
    }

    function confirmCloseMotion(data) {
        console.log('confirmCloseMotion: ' + slackRes);
        res.json({text: slackRes});
    }
};
