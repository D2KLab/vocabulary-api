import os from 'os';
import express from 'express';
import argparse from 'argparse';
import VocabularyRoutes from './src/vocabulary.routes';
import VocabularyManager from './src/vocabulary.manager';

const PORT = process.env.PORT || 3333;

const app = express();

const router = express.Router();

const parser = new argparse.ArgumentParser({
  description: 'Run the Vocabulary API Server',
});
console.log(parser);
parser.add_argument('config', { default: './config.yml' });

const args = parser.parse_args();
const vm = VocabularyManager.fromConfigFile(args.config);
const vr = new VocabularyRoutes(vm);

router.get('/', (req, res) => {
  res.json({
    status: 'up and running',
    routes: vr.list,
  });
});

router.use('/api', vr.routes);

router.get('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
  });
});

app.use(express.json());
app.use(router);

app.listen(PORT, () => {
  console.info(`up and running @: ${os.hostname()} on port: ${PORT}`);
  console.info(`environment: ${process.env.NODE_ENV}`);
});
