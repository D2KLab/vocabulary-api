import sparqlTransformer from 'sparql-transformer/src/main';

import Lemma from './lemma';

const SKOS = 'http://www.w3.org/2004/02/skos/core#';

class Vocabulary {
  static createVocabulary(name, trunkNamespace, namespaces, property, lang) {
    Vocabulary.add(name, new Vocabulary(name, trunkNamespace, namespaces, property, lang));
  }

  static add(name, vocabulary) {
    if (!Vocabulary.list) Vocabulary.list = {};
    Vocabulary.list[name] = vocabulary;
  }

  static async load(name, schema, endpoint) {
    return sparqlTransformer({
      '@context': SKOS,
      '@graph': [{
        '@type': 'Concept',
        '@id': '?id',
        prefLabel: '$skos:prefLabel$required',
        altLabel: '$skos:altLabel|skos:hiddenLabel',
        exactMatch: '$skos:exactMatch',
        inScheme: '?namespace',
      }],
      $where:
        `{ ?id skos:inScheme|skos:topConceptOf ?namespace } UNION
         { ?namespace skos:member ?id}`,
      $values: {
        namespace: schema,
      },
      $prefixes: {
        skos: 'http://www.w3.org/2004/02/skos/core#'
      }
    }, {
      endpoint,
      debug: true,
    }).then((result) => {
      if (schema instanceof Array) {
        result['@graph'] = result['@graph'].sort((a, b) => schema.indexOf(a.inScheme) - schema.indexOf(b.inScheme));

        result['@graph'].filter((x) => x.exactMatch)
          .forEach((x) => {
            if (!result['@graph'].includes(x)) return;

            let exm = x.exactMatch;
            if (!Array.isArray(exm)) exm = [exm];
            x.exactMatch = exm.map((ex) => {
              const lemma = result['@graph'].find((l) => l['@id'] === ex);
              if (lemma) {
                result['@graph'].splice(result['@graph'].indexOf(lemma), 1);
                return lemma;
              }
              return ex;
            });
          });
      }
      const voc = new Vocabulary(result, schema);
      Vocabulary.add(name, voc);
      return voc;
    });
  }

  static async get(name, scheme, endpoint) {
    if (!Vocabulary.list) Vocabulary.list = {};
    if (!Vocabulary.list[name]) await Vocabulary.load(name, scheme, endpoint);
    return Vocabulary.list[name];
  }

  constructor(data, family) {
    this.family = family;
    if (Array.isArray(data)) {
      this.lemmata = data;
      return;
    }
    this.lemmata = data['@graph']
      .map((l) => new Lemma(l));
  }

  flatten(lang = 'en') {
    return this.lemmata.map((l) => l.flatten(lang));
  }

  get data() {
    return {
      '@context': SKOS,
      '@graph': this.lemmata.map((l) => l.data),
    };
  }

  get(id) {
    return new Vocabulary(this.lemmata.filter((l) => l.id === id));
  }

  autocomplete(q, lang, n = 10) {
    return this.search(q, lang, n, true);
  }

  search(q, lang, n = 10, autocomplete = false) {
    let matches = this.lemmata
      .map((l) => new Lemma(l.data, l.similarTo(q, lang, autocomplete)));

    matches = matches.sort((a, b) => {
      const d = b.score - a.score;
      if (d || !this.family) return d;
      return this.family.indexOf(b) - this.family.indexOf(a);
    }).filter(a => a.score).slice(0, n);

    return new Vocabulary(matches);
  }
}
export default Vocabulary;
