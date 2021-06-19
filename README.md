# listifi

Sharable lists

- Create sharable lists with ease.
- Explore lists shared by others.
- Vote on lists.

## development

You'll need node `12.18.4`

```bash
yarn
```

Create an environment file and make the necessary changes

```bash
cp example.env .env
```

If you have a local postgres server running then you'll need to stop it and use
docker-compose:

```bash
docker-compose up -d
```

Create the database

```bash
make psql
=# CREATE DATABASE listifi;
=# \q
```

Run migrations

```bash
make migrate
```

## running dev

```bash
make dev:server
```

then in a separate terminal

```bash
make dev
```

point browser to the server: [localhost:3000](http://localhost:300)
