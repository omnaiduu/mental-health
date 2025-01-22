THis project all code for mysoulwise app, frontend and backend

```docker run -d \
  -p 3001:3001 \
  -v mentalhealth-db:/app/db \
  -e VITE_BACKEND=https://omnaidu.codes \
  -e VITE_WS=wss://omnaidu.codes \
  -e FRONTEND="omnaidu.codes" \
  -e DB_PATH="../../db/primary.db" \
  -e RESEND="re_S7ngVhdg_BeXYFkmYCoQaSA4Kq4hArooM" \
  -e COOKIE="omnaidu.codes" \
  -e AI_TOKEN="AIzaSyCJ7pi_ORD8n_l6uMEy8fcCctD4byNG_7M" \
  mentalhealth````

  docker tag mentalhealth:latest registry.digitalocean.com/freelance/mentalhealth:latest
@cloudcreatr ➜ ~ $ docker push registry.digitalocean.com/freelance/mentalhealth:latest