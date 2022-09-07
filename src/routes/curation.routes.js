'use strict';

const {body} = require('express-validator');

const Router = require("./Router");
/**
 * Curation
 */
Router.get(`/curation/applicants`, [], 'CurationController@applicants');
Router.get(`/curation/latest-round`, [], 'CurationController@latestRound');
Router.get(`/curation/voting-power`, [], 'CurationController@votingPower');
Router.get(`/curation/existing-vote`, [], 'CurationController@getExistingVote');
Router.get(`/curation/applicant-vote-overview`, [], 'CurationController@getApplicantVoteOverview');
Router.get(`/curation/snapshot`, [], 'CurationController@getLatestSnapshotInfo');

Router.post(`/curation/vote`, [
  body("signature").notEmpty().isString(),
  body("msg").notEmpty().isJSON(),
], 'CurationController@voteForApplicant');

module.exports = Router.export();
