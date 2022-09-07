const BaseTransformer = require("./../BaseTransformer");

class CurationRoundDeclarationOutputTransformer extends BaseTransformer {
    transform(curationRoundDeclaration) {
      if(curationRoundDeclaration) {
        return {
          id: curationRoundDeclaration.id,
          topic: curationRoundDeclaration.topic,
          start_unix: curationRoundDeclaration.start_unix,
          end_unix: curationRoundDeclaration.end_unix,
          total_yes: curationRoundDeclaration.total_yes,
          total_no: curationRoundDeclaration.total_no,
        }
      } else {
        return null;
      }
    }
}

module.exports = new CurationRoundDeclarationOutputTransformer();
