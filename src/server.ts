import './config/env';
import App from './app';

const app = new App();

app.listen(Number(process.env.PORT));
