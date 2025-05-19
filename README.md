# RSSchool NodeJS websocket task template

> Static http server and base task packages.
> By default WebSocket client tries to connect to the 3000 port.

## Installation

1. Clone/download repo
2. `npm install`

## Usage

**Development**

`npm run start:front`
`npm run start:back`

- App-front served @ `http://localhost:8181` with nodemon
- App-back served @ `http://localhost:3000` with ts-node

**Production**

`npm run start`

- App served @ `http://localhost:8181` without nodemon

---

**All commands**

| Command               | Description                                            |
| --------------------- | ------------------------------------------------------ |
| `npm run start:front` | App served @ `http://localhost:8181` with nodemon      |
| `npm run start:front` | App-back served @ `http://localhost:3000` with ts-node |
| `npm run start`       | App served @ `http://localhost:8181` without nodemon   |

**Note**: replace `npm` with `yarn` in `package.json` if you use yarn.
