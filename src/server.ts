import './config/env';
import App from './app';

const app = new App();

export default app.listen(Number(process.env.PORT));
