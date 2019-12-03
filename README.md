# Pandemic Server

Real-time game server for Vatsim Pandemic events.

- Real-time API and event notifications using web sockets
- Discord integration
- Failover clustering support

## Configuration Options

Server configuration options are supported with the following environment variables.

| VARIABLE                | DESCRIPTION                                         | DEFAULT                                                 |
| ----------------------- | --------------------------------------------------- | ------------------------------------------------------- |
| PANDEMIC_DB_FILENAME    | Database file name                                  | pandemic.db                                             |
| PANDEMIC_DB_PERSIST     | Persist the database to file (True=1, False=0)      | 1                                                       |
| PANDEMIC_WSS_PORT       | Web socket server port                              | 3000                                                    |
| PANDEMIC_BOT_TOKEN      | Discord Bot authentication token                    | null                                                    |
| PANDEMIC_AIRPORT_RADIUS | Radius (nm) for an airport terminal area validation | 5                                                       |
| PANDEMIC_VATSTATS_API   | Base URL of the Vatstats web service API            | [Vatstats](https://beta-api.vatstats.net/external_api/) |
| PANDEMIC_FLIGHT_LOGGING | Flight logging channel id                           | 626088187751825413                                      |
| PANDEMIC_SAMPLE_LOGGING | Sample logging channel id                           | 626088187751825413                                      |

## Change Log

See [CHANGELOG](/CHANGELOG.md)

## License

See [LICENSE](/LICENSE.md)
