_ = require('underscore');

var tally = {

  printMotion: function(data) {

    // the string that separates motion items when printing
    separator = ' \n';

    // build the output
    motionResults = '*Motion to _' + data.motionName + '_*';
    motionResults += '\nResults: \n';
    _.each(data.answers, function(answer) {
      formattedAnswerName = answer.answerName.capitalizeFirstLetter();
      motionResults += formattedAnswerName + ': ' + answer.votes.length + separator;
    });

    // Remove the last separator (newline) to avoid extra empty line
    lastIndexOfSeparator = motionResults.lastIndexOf(separator);
    if (lastIndexOfSeparator > separator.length) {
      motionResults = motionResults.substring(0, lastIndexOfSeparator);
    }
    return motionResults;
  }
};

module.exports = tally;
