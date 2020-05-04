# nodejs-express-jwt-boilerplate

Boilerplate for your NodeJs application using express and JWT with Web Socket using redis. This NodeJS web server is suppose to be **independent of the frontend**.

# Getting started

1. `git clone git@github.com:aprilmintacpineda/nodejs-express-jwt-boilerplate.git`.
2. `cd nodejs-express-jwt-boilerplate`
3. `rm -rf .git` -- you won't need to use that.
4. `npm i` -- optionally, you can do `npm-check -u` to update the dependencies.

## Generate JWT keys

1. `cd src`.
2. Don't add passphrase, `ssh-keygen -t rsa -b 4096 -m PEM -f jwt.key`.
3. `openssl rsa -in jwt.key -pubout -outform PEM -out jwt.pub`.
4. `rm -rf jwt.key.pub` -- remove the `jwt.key.pub` you don't need it.

# Development

You can run `npm run dev` and start editing file on `src/`.

# Production

You can run `npm run build` to build the `src` files.

## Production TODOS check list

After the machine has been set up, don't forget to do `sudo apt-get update`.

### cls=clear

For your convenience, add `alias cls=clear` to `~/.bashrc`.

- `cat ~/.bashrc`
- `sudo echo "alias cls=clear" >> ~/.bashrc`
- `source ~/.bashrc`
- `cat ~/.bashrc`

### Directories

- `mkdir ~/Downloads`
- `mkdir ~/Uploads`

### Things to install on the machine

Though nodejs has a built-in cluster capability, I suggest using `nginx` as reverse proxy, then you can use `pm2` and spin up a cluster listening to separate ports and then you can map those ports to `nginx` for load balancing.

#### apt

1. `sudo apt-get update`
2. `sudo apt-get install --reinstall make g++ gcc zip tcl libpcre3-dev zlibc zlib1g zlib1g-dev libssl-dev -y`

- `make`, and `g++` are need for `bcrypt` node module.
- `gcc` and `tcl` are needed for redis' `make test`
- `libpcre3-dev`, `zlibc`, `zlib1g`, `zlib1g-dev`, `libssl-dev` are needed for building nginx modules

To build nginx dynamic modules, you need to get the flags of the nginx using `nginx -V` and then add the `add-dynamic-module=/path/to/git/repo` flag.

#### nginx

[Follow install instructions](http://nginx.org/en/linux_packages.html#Ubuntu)

#### Setting up nginx

##### Enable gzip

On http block on `/etc/nginx/nginx.conf`:

```
gzip  on;
gzip_types text/plain application/xml application/json text/javascript text/css application/javascript;
```

##### Security

On http block on `/etc/nginx/nginx.conf`

```
server_tokens off;
add_header X-Frame-Options deny always;
add_header X-Content-Type-Options nosniff always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Cache-Control no-cache always;
add_header Referrer-Policy no-referrer always;
add_header X-Download-Options: noopen always;
more_clear_headers Server;
```

##### Turn off loging

On http block on `/etc/nginx/nginx.conf`:

```
# access_log  /var/log/nginx/access.log  main;
access_log off;
```

Then, outside the http block:

```
error_log /home/ubuntu/www/error.log;
error_log off;
```

##### Worker connections

On `/etc/nginx/nginx.conf`

```
events {
  worker_connections  1024;
}
```

##### Upstreams

On http block of `/etc/nginx/nginx.conf`, each server should point to a running instance of the app.

```
upstream mynodejsapp {
  server localhost:3000;
  server localhost:3001;
  server localhost:3002;
  server localhost:3003;
}
```

##### geoip2 (optional)

Use cases:
- Country whitelisting.
- Track user location.

1. Set up [ngx_http_geoip2_module](https://github.com/leev/ngx_http_geoip2_module).
2. Download and install

Add the following codes to `/etc/nginx/nginx.conf`:

Get data from City database

```
geoip2 /etc/GeoLite2-City.mmdb {
  $geoip2_data_city_name   city names en;
  $geoip2_data_postal_code postal code;
  $geoip2_data_latitude    location latitude;
  $geoip2_data_longitude   location longitude;
  $geoip2_data_state_name  subdivisions 0 names en;
  $geoip2_data_state_code  subdivisions 0 iso_code;
}
```

Get data from Country database.

```
geoip2 /etc/GeoLite2-Country.mmdb {
  $geoip2_data_country_iso_code country iso_code;
  $geoip2_data_country_name country names en;
}
```

Use `$allowed_country` to find out if the country is whitelisted.

```
map $geoip2_data_country_iso_code $allowed_country {
  default no;
  PH yes;
}
```

Then on the `/etc/nginx/conf.d/default.conf`, inside the server block, respond with 403 when country is not whitelisted.

```
if ($allowed_country = no) {
  return 403 "Country not allowed";
}
```

##### headers-more

Set up [headers-more-nginx-module](https://github.com/openresty/headers-more-nginx-module).

##### Headers to forward

```
proxy_set_header Host $http_host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-City-Name $geoip2_data_city_name;
proxy_set_header X-Postal-Code $geoip2_data_postal_code;
proxy_set_header X-Latitude $geoip2_data_latitude;
proxy_set_header X-Longitude $geoip2_data_longitude;
proxy_set_header X-State-Name $geoip2_data_state_name;
proxy_set_header X-State-Code $geoip2_data_state_code;
proxy_set_header X-Country-Iso-Code $geoip2_data_country_iso_code;
proxy_set_header X-Country-Name $geoip2_data_country_name;
```

##### Forwarding www to non-www

On `/etc/nginx/conf.d/default.conf`

```
server {
  server_name www.mynodejsapp.ph; ## your domain here
  return 301 $scheme://mynodejsapp.ph$request_uri;
}
```

##### Handling file uploads

On the main server block on `/etc/nginx/conf.d/default.conf`

```
client_max_body_size 0;
proxy_send_timeout 180s;
proxy_read_timeout 180s;
```

##### Serving locations

On the main server block on `/etc/nginx/conf.d/default.conf`

```
location / {
  try_files $uri /index.html;
}

# Only if you are using the websocket
location /socket {
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  # this is referring to upstream mynodejsapp
  proxy_pass "http://mynodejsapp";
}

location /api {
  # this is referring to upstream mynodejsapp
  proxy_pass "http://mynodejsapp";
}
```

#### Add SSL with LetsEncrypt

1. `sudo add-apt-repository ppa:certbot/certbot`
2. `sudo apt-get update`
3. `sudo apt-get install python-certbot-nginx`
4. `sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com`

Only valid for 90 days, test the renewal process with `certbot renew --dry-run`.

#### NodeJS

1. Install [nvm](https://github.com/nvm-sh/nvm)
2. `nvm install node 13.x`
3. `npm i -g db-migrate db-migrate-mysql`

`db-migrate` and `db-migrate-mysql` modules are being used for database migrations.

#### MySQL 8.0 (optional, you can use hosted solutions)

[Source](https://www.tecmint.com/install-mysql-8-in-ubuntu/)

1. `cd ~/Downloads`
2. `wget -c https://repo.mysql.com//mysql-apt-config_0.8.13-1_all.deb `
3. `sudo dpkg -i mysql-apt-config_0.8.13-1_all.deb`
4. `sudo apt-get update`
5. `sudo apt-get install mysql-server`
6. `mysql --version`
7. `sudo systemctl status mysql`

It's important to update the `.env` file for `db_host`, `db_user`, `db_pass`, `db_name`.

#### Redis (only if using websocket but you can use hosted solutions)

[Source](https://redis.io/topics/quickstart)

1. `cd ~/Downloads`
2. `wget http://download.redis.io/redis-stable.tar.gz`
3. `tar xvzf redis-stable.tar.gz`
4. `cd redis-stable`
5. `make`
6. `make test` (optional but recommended, will take some time to complete)
7. `sudo make install`

Follow the [start in the background guide](https://redis.io/topics/quickstart#installing-redis-more-properly)
