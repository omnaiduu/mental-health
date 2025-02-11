THis project all code for mysoulwise app, frontend and backend

```
docker run -d \
  --restart unless-stopped \
  -p 3001:3001 \
  -v mentalhealth-db:/app/db \
  -e VITE_BACKEND=https://mysoulwise.com \
  -e VITE_WS=wss://mysoulwise.com \
  -e FRONTEND="mysoulwise.com" \
  -e DB_PATH="../../db/primary.db" \
  -e RESEND="re_S7ngVhdg_BeXYFkmYCoQaSA4Kq4hArooM" \
  -e COOKIE="mysoulwise.com" \
  -e AI_TOKEN="AIzaSyCJ7pi_ORD8n_l6uMEy8fcCctD4byNG_7M" \
  registry.digitalocean.com/freelance/mentalhealth:latest
````
```
docker build \
  --no-cache \
  --build-arg VITE_BACKEND=https://mysoulwise.com \
  --build-arg VITE_WS=wss://mysoulwise.com \
  -t mentalhealth:latest .

  ```
  ```docker tag mentalhealth:latest registry.digitalocean.com/freelance/mentalhealth:latest```
 ```docker push registry.digitalocean.com/freelance/mentalhealth:latest```



# First, force pull the latest image
docker pull registry.digitalocean.com/freelance/mentalhealth:latest

# Then run with specific version tag
docker run -d \
  --restart unless-stopped \
  -p 3001:3001 \
  -v mentalhealth-db:/app/db \
  -e VITE_BACKEND=https://mysoulwise.com \
  -e VITE_WS=wss://mysoulwise.com \
  -e FRONTEND="mysoulwise.com" \
  -e DB_PATH="../../db/primary.db" \
  -e RESEND="re_S7ngVhdg_BeXYFkmYCoQaSA4Kq4hArooM" \
  -e COOKIE="mysoulwise.com" \
  -e AI_TOKEN="AIzaSyCJ7pi_ORD8n_l6uMEy8fcCctD4byNG_7M" \
  --pull always \
  registry.digitalocean.com/freelance/mentalhealth:latest


  ##use for docker login to regirt after dockelt setup
  doctl registry login
