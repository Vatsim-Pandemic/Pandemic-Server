'use strict';

const debug = require('debug')('service:flights');
const geolib = require('geolib');
const broker = require('lib/broker');

const NoActiveEventError = () =>
	Object.assign(Error, {
		message: 'Flight processing failed! No active event was found.'
	});

const opts = {
	namespace: 'pandemic',
	airport: {
		radius: parseInt(process.env.PANDEMIC_AIRPORT_RADIUS) || 4
	}
};

module.exports = () => {
	broker.register(`${opts.namespace}.flights.run`, async () => {
		const results = [];

		// get the active event or abort
		const dbEvent = await broker.call('pandemic.event.active');
		if (!dbEvent) throw NoActiveEventError();

		// get active flights and recent departures/arrival data
		const currentFlights = await broker.call('vatstats.flight.current');

		// process active flights
		currentFlights.active_flights.forEach(async (flight) => {
			try {
				// if the flight is not for one of our pilots then ignore flight
				const dbPilot = await broker.call('pandemic.pilot.by', 'callsign', flight.callsign);
				if (!dbPilot) return;

				// get any active flight we are already tracking for the pilot
				let dbFlight = await broker.call('pandemic.flight.pilotactive', {
					cid: flight.cid.cid
				});

				// if the flight has changed, then
				// check if its a diversion or a complete new flight
				if (dbFlight && flight.id !== dbFlight.id) {
					if (dbFlight.plan.dep === flight.planned_dep_airport && dbFlight.plan.dest !== flight.planned_dest_airport) {
						dbFlight.id = flight.id;
						dbFlight.diverted = true;
					} else {
						dbFlight.status = 'CXD';

						await broker.call('pandemic.flight.update', dbFlight);
						dbFlight = null;
					}
				}

				// if we are not tracking an active flight
				// then validate the flight plan is valid for the event
				// and that the pilot is at the departure airport
				if (!dbFlight) {
					const depAirport = await broker.get('vatstats.airport.get', flight.planned_dep_airport);
					const destAirport = await broker.get('vatstats.airport.get', flight.planned_dep_airport);

					const depPoint = {
						latitude: depAirport.latitude,
						longitude: depAirport.longitude
					};
					const destPoint = {
						latitude: destAirport.latitude,
						longitude: destAirport.longitude
					};
					const currentPoint = {
						latitude: flight.current_latitude,
						longitude: flight.current_longitude
					};

					const isDepInZone = geolib.isPointInPolygon(depPoint, dbEvent.zone);
					const isDestInZone = geolib.isPointInPolygon(destPoint, dbEvent.zone);

					// if the flight is not within the event zone then ignore it
					if (!(isDepInZone || isDestInZone)) return;

					// if the pilot is not in the departure terminal area, then ignore the flight
					const isPilotAtDepAirport = geolib.isPointWithinRadius(currentPoint, depPoint);
					if (!isPilotAtDepAirport) return;

					// initialize a new flight record
					dbFlight = {
						id: flights.id,
						cid: flights.cid.cid,
						callsign: flights.callsign,
						status: 'DP'
					};
				}

				// update the active flight plan and position
				dbFlight.planned = {
					dep: flight.planned_dep_airport,
					dest: flight.planned_dest_airport
				};

				dbFlight.position = {
					hdg: flight.current_heading,
					alt: flight.current_altitude,
					gs: flight.current_ground_speed,
					lat: flight.current_latitude,
					lng: flight.current.longitude
				};

				dbFlight = await broker.call('pandemic.flight.update', dbFlight);
				results.push(dbFlight);
			} catch (e) {}
		});

		// process arrivals
		currentFlights.arrivals.forEach(async (flight) => {
			try {
				let dbFlight = await broker.call('pandemic.flight.get', flight.id);

				if (dbFlight) {
					dbFlight = await broker.call('pandemic.flight.update', {
						status: 'AR',
						planned: {
							dep: flight.planned_dep_airport,
							dest: flight.planned_dest_airport
						},
						position: {
							hdg: flight.current_heading,
							alt: flight.current_altitude,
							gs: flight.current_ground_speed,
							lat: flight.current_latitude,
							lng: flight.current.longitude
						}
					});

					results.push(dbFlight);
				}
			} catch (e) {}
		});

		return results;
	});
};
