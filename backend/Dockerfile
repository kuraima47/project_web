# Dockerfile pour Express (Backend)
FROM node:20.18.0

# Créer un répertoire de travail pour l'application
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY ./package*.json ./

# Installer les dépendances
RUN npm ci

# Copier tout le reste du code source de l'application
COPY . .

# Exposer le port de l'application
EXPOSE 3001

# Définir la commande par défaut pour démarrer le backend
CMD ["npm", "run", "dev"]
