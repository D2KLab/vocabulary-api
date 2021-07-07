import Vocabulary from './vocabulary';

class VocabularyController {
  constructor(scheme, endpoint, name) {
    this.scheme = scheme;
    this.endpoint = endpoint;
    this.name = name || scheme;
  }

  get(lemma) {
    return Vocabulary.get(this.name, this.scheme, this.endpoint)
      .then((voc) => voc.get(lemma));
  }

  search(q, lang, n, autocomplete) {
    return Vocabulary.get(this.name, this.scheme, this.endpoint)
      .then((voc) => {
        if (!q) return voc;
        return voc.search(q, lang, n, autocomplete);
      });
  }
}

export default VocabularyController;
