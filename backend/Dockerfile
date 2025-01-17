# Dockerfile pour Express (Backend)
FROM node:18

# Créer un répertoire de travail pour l'application
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY ./package*.json ./

# Installer les dépendances
RUN npm install

# Copier tout le reste du code source de l'application
COPY . .

# Exposer le port de l'application
EXPOSE 3001

# Définir la commande par défaut pour démarrer le backend
CMD ["npm", "run", "dev"]
