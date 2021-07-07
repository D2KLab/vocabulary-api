Vocabulary API
==============

Configurable API for accessing SKOS vocabularies.

## API Documentation

`api/vocabulary/`

Returns a list of `voc_name`s to be used in the following request.

`api/vocabulary/:voc_name`

**URI parameters**
- `voc_name` The name of the target vocabulary (e.g. `olfactory-objects`) or of the family of vocabularies (e.g. `wheel`)

**Query parameters**
- `lang` Set the language preference through the [Accept-Language standard](https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.4). i.e. `en;q=1, it;q=0.7 *;q=0.1`
- `format` Output format among `json` (default) and `json-ld`.
- `q` Search for a particular string. The results are ordered according to a similarity measure based on the Levenshtein distance. The search is multi-language. In case `lang` is set, the specified language are prioritized in the measure.
- `autocomplete` The search accept only labels that _exactly_ includes the `q` value. The goal is not to find the best matches, but to give good suggestions to the user.

Examples:
- http://localhost:3333/api/vocabulary/wheel?q=fresh
- http://localhost:3333/api/vocabulary/wheel?q=fresh&autocomplete
- http://localhost:3333/api/vocabulary/olfactory-objects?q=inceso&lang=it (note the intentional typo)

**Output Format**

The output is a JSON array in which each element is presented with its `id`, a `label` in the requested language and (if it is a search), with the `confidence` score. This score is computed as the maximum similarity measure (inverse Levenshtein distance) among the different available labels for that `id` (case insensitive). Weights are configured in `config.yml` for reducing the scores in case the match targets a `skos:altLabel`, a lable in another language, or a label not starting with the searched text.

Example:
```json
{
  "id": "http://data.odeuropa.eu/vocabulary/historic-book/fresh_fruit",
  "label": "Fresh Fruit",
  "confidence": 0.45454545454545453
}
```

## Installation

The API can be configured using `config.yml`.

The server application can be run using NodeJS:

    npm install
    npm start config.yml

In alternative, it is possible to install it using Docker:

    docker build -t d2klab/vocabularyapi .
    docker run -d -p 8873:3333 -v /home/semantic/odeuropa/vocabulary-api:/config --name odeuropa_vocapi d2klab/vocabularyapi
