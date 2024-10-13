# LinkedIn Report Apps

This application allows you login with your LinkedIn profile, and download Campaign Manager performence reports.

## Database

## Load Docker container for Mongodb (backend)

Please install [Docker Desktop]('https://www.docker.com/products/docker-desktop/') locally on your development machine before executing this command :

```bash
cd database
docker compose up -d
```

## Client

### Install client packages

```bash
cd client
npm i
```

### Set your apps (client) environment variables

Create .env from .env.template with the following command:

```bash
cp .env.template .env
```

Populate your environment parameters :

```bash
DATABASE_URL = "mongodb://127.0.0.1:27017/auth?connectTimeoutMS=300000&replicaSet=rs0"  # replace with your own mongo db connection string
SECRET = "<your secret key>"  # replace with your own secret key
LINKEDIN_CLIENT_ID = <LinkedIn client id of your apps> # replace with your own LinkedIn client id, find from developer portal
LINKEDIN_CLIENT_SECRET = <LinkedIn client secret of your apps> # replace with your own LinkedIn client secret, find from developer portal
LINKEDIN_API_VERSION = 202409 # replace with your own API version, in the format YYYYMM
```

### Initialte Prisma for Mongodb

Initialze Prisma for Mongodb and connect to Mongodb database:

```bash
cd client
npx prisma generate
```

If you make change to schema, you can run the following command to update the Prisma Client:

```bash
cd client
npx prisma db push
```

### Run the (client) development server:

```bash
cd client
npm run dev
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
