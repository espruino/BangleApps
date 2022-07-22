use super::Point;
use itertools::Itertools;
use lazy_static::lazy_static;
use openstreetmap_api::{
    types::{BoundingBox, Credentials},
    Openstreetmap,
};
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

async fn get_openstreetmap_data(points: &[(f64, f64)]) -> HashSet<InterestPoint> {
    let osm = Openstreetmap::new("https://openstreetmap.org", Credentials::None);
    let mut interest_points = HashSet::new();
    let border = 0.0001;
    let mut boxes = Vec::new();
    let max_size = 0.005;
    points.iter().fold(
        (std::f64::MAX, std::f64::MIN, std::f64::MAX, std::f64::MIN),
        |in_box, &(x, y)| {
            let (mut xmin, mut xmax, mut ymin, mut ymax) = in_box;
            xmin = xmin.min(x);
            xmax = xmax.max(x);
            ymin = ymin.min(y);
            ymax = ymax.max(y);
            if (xmax - xmin > max_size) || (ymax - ymin > max_size) {
                boxes.push(in_box);
                (x, x, y, y)
            } else {
                (xmin, xmax, ymin, ymax)
            }
        },
    );
    eprintln!("we need {} requests to openstreetmap", boxes.len());
    for (xmin, xmax, ymin, ymax) in boxes {
        let left = xmin - border;
        let right = xmax + border;
        let bottom = ymin - border;
        let top = ymax + border;
        match osm
            .map(&BoundingBox {
                bottom,
                left,
                top,
                right,
            })
            .await
        {
            Ok(map) => {
                let points = map.nodes.iter().flat_map(|n| {
                    n.tags.iter().filter_map(|t| {
                        let latlon = n.lat.and_then(|lat| n.lon.map(|lon| (lat, lon)));
                        latlon.and_then(|(lat, lon)| {
                            Interest::new(&t.k, &t.v).map(|i| InterestPoint {
                                point: Point { x: lon, y: lat },
                                interest: i,
                            })
                        })
                    })
                });
                interest_points.extend(points)
            }
            Err(e) => {
                eprintln!("failed retrieving osm data: {:?}", e);
            }
        }
    }
    interest_points
}

pub fn parse_osm_data<P: AsRef<Path>>(path: P) -> (Vec<InterestPoint>, HashSet<Point>) {
    let reader = osmio::read_pbf(path).ok();
    let mut crossroads: HashMap<ObjId, usize> = HashMap::new();
    let mut coordinates: HashMap<ObjId, Point> = HashMap::new();
    let interests = reader
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
                            coordinates.insert(n.id(), Point { x: lon, y: lat });
                        });
                    }
                    osmio::obj_types::ArcOSMObj::Way(w) => {
                        if !w.is_area() {
                            for node in w.nodes() {
                                *crossroads.entry(*node).or_default() += 1;
                            }
                        }
                    }
                    osmio::obj_types::ArcOSMObj::Relation(_) => {}
                }
            }
            interests
        })
        .unwrap_or_default();
    (
        interests,
        crossroads
            .iter()
            .filter(|&(_, c)| *c >= 3)
            .filter_map(|(id, _)| coordinates.get(&id).copied())
            .collect(),
    )
}
