import * as http from 'http';
import App from './app';
import { CONFIG } from './config/vars';

http.createServer(App).listen(CONFIG.PORT, () => {
   console.log('Express server listening on port ' + CONFIG.PORT);
});
