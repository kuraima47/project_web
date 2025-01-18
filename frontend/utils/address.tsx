const isProduction = true;

export const API_URL = isProduction
  ? 'https://panneauramix.fr' // URL de l'API en production
  : 'http://localhost:3001'; // URL de l'API en développement

  export const WS_MESSAGE = isProduction 
  ? 'https://panneauramix.fr/ws/notifications'
  : 'http://localhost:3001';

  export const WS_NOTIF = isProduction 
    ? 'https://panneauramix.fr/ws/notifications'
    : 'http://localhost:3002';

  export const WS_PIXEL = isProduction 
  ? 'https://panneauramix.fr/ws/pixelwar'
  : 'http://localhost:3003';

// Exporter la fonction qui renvoie l'URL de l'API
export function getApiUrl(link: string) {
  return API_URL.concat(link);
}

export function getWsNotif() {
  return WS_NOTIF;
}

export function getWsPixel() {
    return WS_PIXEL;
}

export function getWsMessage() {
    return WS_MESSAGE;
}