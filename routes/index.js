var express = require('express')
    , router = module.exports = express.Router()
    , doVote = require('./do_vote.js')
    , takeAction = require('./take_action.js')
    , listVotes = require('./list_votes.js')
    , startVotes = require('./start_vote.js')
    , close = require('./close_motion.js');

router.route('/vote').post(doVote.post);
router.route('/action').post(takeAction.post);
router.route('/votes').post(listVotes.post);
router.route('/start').post(startVotes.post);
router.route('/close').post(close.post);