# Projet Web

## Déploiement

### Local

Télécharger un serveur redis et le lancer.

- [redis-windows](https://github.com/microsoftarchive/redis/releases/tag/win-3.0.504)
- [redis-linux](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/install-redis-on-linux/)

Modifier la ligne du fichier [address.tsx](./frontend/utils/address.tsx) :
```
const isProduction = false
```

Ouvrez deux terminaux. `./frontend` et `./backend`, il faudra taper la commande dans chacun `npm run dev`


### Production

#### Génération du certificat SSL

Vérifier que rien ne tourne sur le port 80 et le kill le cas échéant
```
sudo lsof -i :80
```

Retirer la partie SSL de nginx/default.conf pour se retrouver avec la configuration suivante
```
server {
    listen 80;
    server_name votre_site.fr www.votre_site.fr;

    location /.well-known/acme-challenge/ {
        root /data/letsencrypt;
    }
}
```

Modifier le docker-compose.prod.yml pour faire correspondre à votre nom de domain + email sous certbot

Configurez cloudfare ou associé.
- Ajouter un enregistrement A renvoyant vers l'IP de votre machine
- Ajouter un enregistrement A avec comme sous domaine www qui pointe vers votre machine.

#### Build & Run image


Lancer le conteneur docker
```
sudo docker-compose up --build -d
```

Une fois le certificat généré remettez le fichier nginx/default.conf par défaut.
```
sudo docker restart nginx-proxy
```

Stopper l'image, rebuild et relancer.
```
sudo docker-compose down -v --remove-orphans
sudo docker-compose up --build -d
```

Vous pouvez désormais accéder à l'application liée à votre nom de domaine en https.

Si cela ne fonctionne pas, retirer le -d lorsque vous lancez l'image docker pour trouver la source du problème.

#### Lancement & Stop

Lancement du serveur : 
```
sudo docker-compose -f docker-compose.prod.yml up
```

Stop:

```
sudo docker-compose down -v --remove-orphans
```
