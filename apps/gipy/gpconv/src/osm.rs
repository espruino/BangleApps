use super::Point;
use itertools::Itertools;
use lazy_static::lazy_static;
use osmio::OSMObjBase;
use osmio::{prelude::*, ObjId};
use std::collections::{HashMap, HashSet};
use std::path::Path;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum Interest {
    Bakery,
    DrinkingWater,
    Toilets,
    // BikeShop,
    // ChargingStation,
    // Bank,
    // Supermarket,
    // Table,
    // TourismOffice,
    Artwork,
    // Pharmacy,
}

impl Into<u8> for Interest {
    fn into(self) -> u8 {
        match self {
            Interest::Bakery => 0,
            Interest::DrinkingWater => 1,
            Interest::Toilets => 2,
            // Interest::BikeShop => 8,
            // Interest::ChargingStation => 4,
            // Interest::Bank => 5,
            // Interest::Supermarket => 6,
            // Interest::Table => 7,
            Interest::Artwork => 3,
            // Interest::Pharmacy => 9,
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub struct InterestPoint {
    pub point: Point,
    pub interest: Interest,
}

lazy_static! {
    static ref INTERESTS: HashMap<(&'static str, &'static str), Interest> = {
        [
            (("shop", "bakery"), Interest::Bakery),
            (("amenity", "drinking_water"), Interest::DrinkingWater),
            (("amenity", "toilets"), Interest::Toilets),
            // (("shop", "bicycle"), Interest::BikeShop),
            // (("amenity", "charging_station"), Interest::ChargingStation),
            // (("amenity", "bank"), Interest::Bank),
            // (("shop", "supermarket"), Interest::Supermarket),
            // (("leisure", "picnic_table"), Interest::Table),
            // (("tourism", "information"), Interest::TourismOffice),
            (("tourism", "artwork"), Interest::Artwork),
            // (("amenity", "pharmacy"), Interest::Pharmacy),
        ]
        .into_iter()
        .collect()
    };
}

impl Interest {
    fn new(key: &str, value: &str) -> Option<Self> {
        INTERESTS.get(&(key, value)).cloned()
    }
}

impl InterestPoint {
    pub fn color(&self) -> &'static str {
        match self.interest {
            Interest::Bakery => "red",
            Interest::DrinkingWater => "blue",
            Interest::Toilets => "brown",
            // Interest::BikeShop => "purple",
            // Interest::ChargingStation => "green",
            // Interest::Bank => "black",
            // Interest::Supermarket => "red",
            // Interest::Table => "pink",
            Interest::Artwork => "orange",
            // Interest::Pharmacy => "chartreuse",
        }
    }
}

pub fn parse_osm_data<P: AsRef<Path>>(path: P) -> Vec<InterestPoint> {
    let reader = osmio::read_pbf(path).ok();
    reader
        .map(|mut reader| {
            let mut interests = Vec::new();
            for obj in reader.objects() {
                match obj {
                    osmio::obj_types::ArcOSMObj::Node(n) => {
                        n.lat_lon_f64().map(|(lat, lon)| {
                            for p in n.tags().filter_map(move |(k, v)| {
                                Interest::new(k, v).map(|i| InterestPoint {
                                    point: Point { x: lon, y: lat },
                                    interest: i,
                                })
                            }) {
                                interests.push(p);
                            }
                        });
                    }
                    osmio::obj_types::ArcOSMObj::Way(w) => {}
                    osmio::obj_types::ArcOSMObj::Relation(_) => {}
                }
            }
            interests
        })
        .unwrap_or_default()
}
