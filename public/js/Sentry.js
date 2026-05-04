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
        stopIds: stopsToAdd.map(s => s.orderID + "_" + s.stopType),
        runAddingStopsName,
        runRemovingStopsName,
        runAddingStopsInitial,
        runAddingStopsNew,
        runRemovingStopsInitial,
        runRemovingStopsNew
    });

}


export async function logRemoveStopsFromShipment(stops, shipmentName){

    Sentry.logger.info("Removing stops from shipment ", {
        stopIds: stops,
        shipmentName: shipmentName
    });

}

export async function logAddStopsToShipment(stops, shipmentName){

    Sentry.logger.info("Adding stops to shipment ", {
        stopIds: stops.map(s => s.orderID + "_" + s.stopType),
        shipmentName: shipmentName
    });

}

