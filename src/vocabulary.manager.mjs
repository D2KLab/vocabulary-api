import fs from 'fs';
import YAML from 'yaml';

import Lemma from './lemma';
import VocabularyController from './vocabulary.controller';

class VocabularyManager {
  constructor(opt) {
    if (!opt || !opt.vocabularies) throw new Error('Bad options for VocabularyManager');

    this.controller = {};
    const { vocabularies, weights, endpoint } = opt;

    Lemma.setWeights(weights);

    let families = Object.keys(vocabularies)
      .map((k) => vocabularies[k].family)
      .filter((x) => x);
    families = new Set(families);

    Object.keys(vocabularies).forEach((k) => {
      const { scheme } = vocabularies[k];
      this.controller[k] = new VocabularyController(scheme, endpoint);
    });

    families.forEach((family) => {
      const vocs = Object.keys(vocabularies)
        .map((k) => vocabularies[k])
        .filter((v) => v.family === family);

      this.controller[family] = new VocabularyController(
        vocs.sort((v) => -v.priority)
          .map((v) => v.scheme),
        endpoint,
        family,
      );
    });
  }

  get list() {
    return Object.keys(this.controller);
  }

  get(id) {
    return this.controller[id];
  }

  static fromConfigFile(path) {
    const file = fs.readFileSync(path, 'utf8');
    const options = YAML.parse(file);
    return new VocabularyManager(options);
  }
}

export default VocabularyManager;
