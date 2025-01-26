/* https://www.espruino.com/Bangle.js+Fast+Load:
 * "We're recommending you only use this on Clocks and Launchers right now - the potential improvement for apps is small (as it only affects loading the next app after" yours), and the potential for things to break is much higher!"
 */

Bangle.loadWidgets();
Bangle.drawWidgets();

function showErrorAndQuit(error) {
    E.showMessage("No HASS config!");
    setTimeout(function() {
        load()

    }, 2000);
}

var config = require("Storage").readJSON("hasscontrol.hass.json", true);
if (config == undefined) showErrorAndQuit("No HASS config!"); // are all these errors necessary?
config = config[0];
if (!config.hass_url) showErrorAndQuit("No HASS URL!");
if (!config.hass_token) showErrorAndQuit("No HASS token!");

/* not used in v0.02.
function hassGetState(entityId) {
    return Bangle.http(config.hass_url + "/states/" + entityId, {
            "method":"GET",
            "headers": {
                "Authorization":"Bearer " + config.hass_token,
                "Content-Type":"application/json"
            }
        }
    );
}

function hassSetState(entityId, state) {
    Bangle.http(config.hass_url + "/states/" + entityId, {
            "method":"PUSH",
            "headers": {
                "Authorization":"Bearer " + config.hass_token,
                "Content-Type":"application/json"
            },
            "body":`{"state":"${state}"}`
        }
    );
}
*/

function hassActivateService(service, data) {
    Bangle.http(config.hass_url + "/services/" + service.replace(".", "/"), {
            "method":"POST",
            "headers": {
                "Authorization":"Bearer " + config.hass_token,
                "Content-Type":"application/json"
            },
            "body":data
        }
    );
}

var menus = {
    "entitiesListMenu": {
        "": {title: "Entities"},
        "< Back": function () { load(); }
    },
    "entities": {}
}

config.entities.forEach((entity) => {
    let entityMenu = {
        "": { title: entity.name },
        "< Back": function () { E.showMenu(menus.entitiesListMenu); }
    }

    entity.actions.forEach((action) => {

        if (action.type == "button") {

            entityMenu[action.name] = function() {
                hassActivateService(action.action, `{ "entity_id": "${entity.entity_id}" }`);
            }

        } else if (action.type == "number") {

            entityMenu[action.name] = {
                value: action.placeholder, // placeholder! get the state of the entity and put it here?
                min: action.min,
                max: action.max,
                step: 1,
                onchange: number => {
                    hassActivateService(action.action, `{ "entity_id": "${entity.entity_id}", "${action.argument}": ${number} }`)
                }
            }

        } else if (action.type == "selector") {

            let selectorMenu = {
                "": { title: action.name },
                "< Back": function () { E.showMenu(menus.entitiesListMenu) } // this dumps you back to the main list instead of going up one level :(
            }

            action.options.forEach((option) => {
                selectorMenu[option] = function () {
                    hassActivateService(action.action, `{ "entity_id": "${entity.entity_id}", "${action.argument}": "${option}" }`);
                }
            });

            entityMenu[action.name] = function() { E.showMenu(selectorMenu); }

        }
    });

    menus.entities[entity.entity_id] = entityMenu; // put the constructed menu into the entities list

    menus.entitiesListMenu[entity.name] = function () {
        E.showMenu(menus.entities[entity.entity_id]); // put the link to the new menu into the home screen
    };
});

E.showMenu(menus.entitiesListMenu);
