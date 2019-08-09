var data = ''
  , tally = require('./../tally.js')
  , returnText = ''
  , slackRes = ''
  , motion = ''
  , dbActions = require('./../persist.js')

exports.post = function (req, res, next) {

    console.log('List results of current motion.');

    /*
     * Print active motion results.
     * TBD: Needs to be refactored if we want to use this route
     */
    // dbActions.getActiveMotionId(fetchActiveMotion);
    // function fetchActiveMotion(motionId) {
    //   console.log('Fetching active motion: ' + motionId);
    //   dbActions.getMotion(motionId, printMotion);
    // }
    // function printMotion(data) {
    //   slackRes = 'Here are the current votes: \n ' + tally.printMotion(JSON.parse(data));
    //   console.log('printMotion: ' + slackRes);
    //   res.json({text: slackRes});
    // }

};
