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
 * Capitalize the first letter of each word.
 */
String.prototype.capitalizeFirstLetter = function () {
    var pieces = this.split(' ');
    for (var i = 0; i < pieces.length; i++) {
        var j = pieces[i].charAt(0).toUpperCase();
        pieces[i] = j + pieces[i].substr(1);
    }
    return pieces.join(' ');
};

/*
 * Handle voting actions.
 */
exports.post = function (req, res, next) {

    triggerWord = req.body.trigger_word;
    answerText = req.body.text;
    answerText = answerText.replace(triggerWord + ' ', '').toLowerCase();
    userName = req.body.user_name;
    userID = req.body.user_id;
    timestamp = req.body.timestamp;
    motionId = 'activeMotion_' + req.body.channel_id;

    postedVote = {
        'userName': userName,
        'userID': userID,
        'timestamp': timestamp
    };

    console.log('Incoming post. Answer text: ' + answerText + '. motionId: ' + motionId + '\n');

    dbActions.getMotion(motionId, setData);

    function setData(motion_string) {
        console.log('Motion prior to submission: ' + motion_string);
        if (motion_string) {
            data = JSON.parse(motion_string);
            if (data.active == 1) {
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
                dbActions.setMotion(motionId, JSON.stringify(data), handleResults);
                dbActions.getMotion(motionId, function (result_string) {
                    console.log('Motion after submission: ' + result_string);
                });
            } else {
                data = {
                    'motionName': 'There is no active motion set for this channel, please use the "start motion QUESTION" command to start a new motion',
                    'answers': []
                };
                handleResults();
            }
        }
    }

    function handleResults() {
        slackRes = tally.printMotion(data);
        res.json({text: slackRes});
    }
};
