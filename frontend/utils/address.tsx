const isProduction = process.env.NODE_ENV === 'production';

export const API_URL = isProduction
  ? 'https://panneauramix.fr' // URL de l'API en production
  : 'http://localhost:3001'; // URL de l'API en développement

  export const WS_MESSAGE_URL = isProduction 
  ? 'https://panneauramix.fr'
  : 'http://localhost:3001';

  export const WS_NOTIF_URL = isProduction 
    ? 'https://panneauramix.fr'
    : 'http://localhost:3002';

  export const WS_PIXEL_URL = isProduction 
  ? 'https://panneauramix.fr'
  : 'http://localhost:3003';

  export const WS_MESSAGE_PATH = isProduction 
  ? '/ws-messages'
  : '';

  export const WS_NOTIF_PATH = isProduction 
    ? '/ws-notifications'
    : '';

  export const WS_PIXEL_PATH = isProduction 
  ? '/ws-pixelwar'
  : '';

// Exporter la fonction qui renvoie l'URL de l'API
export function getApiUrl(link: string) {
  return API_URL.concat(link);
}

export function getWsNotificationsUrl() {
  return WS_NOTIF_URL;
}

export function getWsNotificationsPath() {
  return WS_NOTIF_PATH;
}

export function getWsPixelWarUrl() {
    return WS_PIXEL_URL;
}

export function getWsPixelWarPath() {
  return WS_PIXEL_PATH;
}

export function getWsMessageUrl() {
  return WS_MESSAGE_URL;
}

export function getWsMessagePath() {
  return WS_MESSAGE_PATH;
}