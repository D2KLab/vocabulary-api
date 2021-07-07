import express from 'express';

export function sendStandardError(res, err) {
  const m = (err && err.message) || err;

  console.error('error ', err.message);
  res.status(500).send({
    code: 500,
    message: m,
    error: err
  });
}

function handleSearchRequest(controller, req, res) {
  const {
    lang,
    format,
    q,
    lemma,
    n,
  } = req.query;

  const autocomplete = 'autocomplete' in req.query;

  let result;
  if (lemma) result = controller.get(lemma);
  else result = controller.search(q, lang, n, autocomplete);

  result
    .then((voc) => {
      const results = format === 'json-ld' ? voc.data : voc.flatten(lang);
      res.json(results);
    })
    .catch((err) => sendStandardError(res, err));
}

class VocabularyRoutes {
  constructor(manager) {
    this.manager = manager;
  }

  init(router) {
    console.info('Setting up routes:');
    const controllers = this.manager.controller;
    for (const k of Object.keys(controllers)) {
      router.get(`/vocabulary/${k}`,
        (req, res) => handleSearchRequest(controllers[k], req, res));
      console.info(`- ${k}`);
    }
    router.get(`/vocabulary`, (req, res) => res.json(Object.keys(controllers)));
  }

  get routes() {
    if (!this.router) {
      this.router = express.Router();
      this.init(this.router);
      this.router.get('*', (_req, res) => res.status(404).json({ error: 'Not Found' }));
    }
    return this.router;
  }
}

export default VocabularyRoutes;
