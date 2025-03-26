# Utilise une image officielle de Nginx pour le serveur web
FROM nginx:alpine

# Copie les fichiers de ton projet dans le répertoire de Nginx
COPY . /usr/share/nginx/html

# Expose le port 80 pour accéder au serveur
EXPOSE 80

# Commande pour lancer Nginx en mode non-démon
CMD ["nginx", "-g", "daemon off;"]
