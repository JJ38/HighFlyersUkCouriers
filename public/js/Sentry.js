import * as Sentry from "https://esm.sh/@sentry/browser";

Sentry.init({
  dsn: "https://1778521b8f6b27d2a444273440b42a93@o4510232854593536.ingest.de.sentry.io/4510953482551376",
  integrations: 
    // send console.log, console.warn, and console.error calls as logs to Sentry
    // Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
   (defaults) => defaults.filter((integration) => integration.name !== "Breadcrumbs"),
    
  // Enable logs to be sent to Sentry
  enableLogs: true,
});

export async function logInfo(message, data = {}, tags = {}) {

    Sentry.logger.info(message, {
        ...data,
        ...tags,
    });

}

export async function logAssignedStops(runRemovingStopsName, runAddingStopsName, stopsToAdd, runAddingStopsNew, runAddingStopsInitial, runRemovingStopsNew, runRemovingStopsInitial){

    if(runRemovingStopsName == null){
        runRemovingStopsName = "Unassigned";
    }

    if(runAddingStopsName == null){
        runAddingStopsName = "Unassigned";
    }

    Sentry.logger.info("Assigned stops", {
        stopIds: stopsToAdd.map(s => `${s.orderID}_${s.stopType}`).join(" "),
        runAddingStopsName,
        runRemovingStopsName,
        runAddingStopsInitial: JSON.stringify(runAddingStopsInitial),
        runAddingStopsNew: JSON.stringify(runAddingStopsNew),
        runRemovingStopsInitial: JSON.stringify(runRemovingStopsInitial),
        runRemovingStopsNew: JSON.stringify(runRemovingStopsNew)
    });

}


export async function logRemoveStopsFromShipment(stops, shipmentName){

    Sentry.logger.info("Removing stops from shipment ", {
        stopIds: stops.map(s => s).join(" "),
        shipmentName: shipmentName
    });

}

export async function logAddStopsToShipment(stops, shipmentName){

    Sentry.logger.info("Adding stops to shipment ", {
        stopIds: stops.map(s => `${s.orderID}_${s.stopType}`).join(" "),
        shipmentName: shipmentName
    });

}

export async function logErrorAssigningStops(runRemovingStopsWithStopsRemoved, runAddingStopsWithAddedStops, stopsOfRunRemovingStops, stopsOfRunAddingStops, stops, message){

    logErrorAssigningStops(runRemovingStopsWithStopsRemoved, runAddingStopsWithAddedStops, stopsOfRunRemovingStops, stopsOfRunAddingStops, stops, message);

    Sentry.logger.info("Error assigning stops ", {
        stopIds: stops.map(s => s).join(" "),
        stopsOfRunRemovingStops: JSON.stringify(stopsOfRunRemovingStops),
        runRemovingStopsWithStopsRemoved: JSON.stringify(runRemovingStopsWithStopsRemoved),
        stopsOfRunAddingStops: JSON.stringify(stopsOfRunAddingStops),
        runAddingStopsWithAddedStops: JSON.stringify(runAddingStopsWithAddedStops),
        message: message
    });

}

