# 2110503_Project_pepsi-and-coke

Project for 2110503 Software Development Practice from group Pepsi and Coke.

A REST API for coworking spaces, built with Node.js, Express and MongoDB.

## Getting Started

**Prerequisites:** Node.js and a MongoDB database.

```bash
# 1. Install dependencies
npm install

# 2. Create src/config/config.env (see below)

# 3. Start the dev server
npm run dev
```

### Environment variables

Create `src/config/config.env` (this file is not committed):

```env
NODE_ENV=development
PORT=5000
MONGO_URI=<your MongoDB connection string>
JWT_SECRET=<your secret>
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
```

## Scripts

| Command            | Description                              |
| ------------------ | ---------------------------------------- |
| `npm run dev`      | Run the server in development mode       |
| `npm run ci`       | Run the CI checks locally before pushing |
| `npm run format`   | Format all files                         |

## API Overview

Base URL: `http://localhost:5000/api/v1`

| Route              | Description                       |
| ------------------ | --------------------------------- |
| `/auth`            | Register, login, get current user |
| `/coworkingspaces` | Coworking space resources         |

## Testing the API with Bruno

The [Bruno](https://www.usebruno.com/) collection is in `bruno/CoSpace`.

1. In Bruno, choose **Open Collection** and select the `bruno/CoSpace` folder.
2. Select an environment (e.g. local) in the top-right corner.
3. Run **Register** first, then **Login**. The token is saved automatically for the other requests.

## Project Structure

```
.github/workflows   CI workflow
bruno/CoSpace       Bruno API collection
src/
  config/           DB connection and env config
  controllers/      Route handlers
  middleware/       Auth middleware
  models/           Mongoose models
  routes/           Express routes
  server.js         App entry point
```
