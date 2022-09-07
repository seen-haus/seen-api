const BaseTransformer = require("./../BaseTransformer");

class ApplicantVoteOverviewOutputTransformer extends BaseTransformer {
    transform(applicantOverview) {
      return {
        id: applicantOverview.id,
        total_yes: applicantOverview.total_yes ? applicantOverview.total_yes : 0,
        total_no: applicantOverview.total_no ? applicantOverview.total_no : 0,
        total_effective: applicantOverview.total_effective ? applicantOverview.total_effective : 0,
      }
    }
}

module.exports = new ApplicantVoteOverviewOutputTransformer();
