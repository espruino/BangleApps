use itertools::Itertools;
use std::collections::{HashMap, HashSet};
use std::fs::File;
use std::io::{BufReader, BufWriter, Write};
use std::path::Path;

use gpx::read;
use gpx::Gpx;

use lazy_static::lazy_static;
use openstreetmap_api::{
    types::{BoundingBox, Credentials},
    Openstreetmap,
};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
enum Interest {
    Bakery,
    DrinkingWater,
    Toilets,
    BikeShop,
    ChargingStation,
    Bank,
    Supermarket,
    Table,
    //    TourismOffice,
    Artwork,
    Pharmacy,
}

#[derive(Debug, PartialEq)]
struct InterestPoint {
    lat: f64,
    lon: f64,
    interest: Interest,
}

impl Eq for InterestPoint {}
impl std::hash::Hash for InterestPoint {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        unsafe { std::mem::transmute::<f64, u64>(self.lat) }.hash(state);
        unsafe { std::mem::transmute::<f64, u64>(self.lon) }.hash(state);
        self.interest.hash(state);
    }
}

lazy_static! {
    static ref INTERESTS: HashMap<(&'static str, &'static str), Interest> = {
        [
            (("shop", "bakery"), Interest::Bakery),
            (("amenity", "drinking_water"), Interest::DrinkingWater),
            (("amenity", "toilets"), Interest::Toilets),
            (("shop", "bicycle"), Interest::BikeShop),
            (("amenity", "charging_station"), Interest::ChargingStation),
            (("amenity", "bank"), Interest::Bank),
            (("shop", "supermarket"), Interest::Supermarket),
            (("leisure", "picnic_table"), Interest::Table),
            // (("tourism", "information"), Interest::TourismOffice),
            (("tourism", "artwork"), Interest::Artwork),
            (("amenity", "pharmacy"), Interest::Pharmacy),
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
    fn color(&self) -> &'static str {
        match self.interest {
            Interest::Bakery => "red",
            Interest::DrinkingWater => "blue",
            Interest::Toilets => "brown",
            Interest::BikeShop => "purple",
            Interest::ChargingStation => "green",
            Interest::Bank => "black",
            Interest::Supermarket => "red",
            Interest::Table => "pink",
            Interest::Artwork => "orange",
            Interest::Pharmacy => "chartreuse",
        }
    }
}

fn squared_distance_between(p1: &(f64, f64), p2: &(f64, f64)) -> f64 {
    let (x1, y1) = *p1;
    let (x2, y2) = *p2;
    let dx = x2 - x1;
    let dy = y2 - y1;
    dx * dx + dy * dy
}

fn points(filename: &str) -> impl Iterator<Item = (f64, f64)> {
    // This XML file actually exists — try it for yourself!
    let file = File::open(filename).unwrap();
    let reader = BufReader::new(file);

    // read takes any io::Read and gives a Result<Gpx, Error>.
    let mut gpx: Gpx = read(reader).unwrap();
    eprintln!("we have {} tracks", gpx.tracks.len());

    gpx.tracks
        .pop()
        .unwrap()
        .segments
        .into_iter()
        .flat_map(|segment| segment.linestring().points().collect::<Vec<_>>())
        .map(|point| (point.x(), point.y()))
        .dedup()
}

fn distance_to_segment(p: &(f64, f64), v: &(f64, f64), w: &(f64, f64)) -> f64 {
    let l2 = squared_distance_between(v, w);
    if l2 == 0.0 {
        return squared_distance_between(p, v).sqrt();
    }
    // Consider the line extending the segment, parameterized as v + t (w - v).
    // We find projection of point p onto the line.
    // It falls where t = [(p-v) . (w-v)] / |w-v|^2
    // We clamp t from [0,1] to handle points outside the segment vw.
    let x0 = p.0 - v.0;
    let y0 = p.1 - v.1;
    let x1 = w.0 - v.0;
    let y1 = w.1 - v.1;
    let dot = x0 * x1 + y0 * y1;
    let t = (dot / l2).min(1.0).max(0.0);

    let proj_x = v.0 + x1 * t;
    let proj_y = v.1 + y1 * t;

    squared_distance_between(&(proj_x, proj_y), p).sqrt()
}

// // NOTE: this angles idea could maybe be use to get dp from n^3 to n^2
// fn acceptable_angles(p1: &(f64, f64), p2: &(f64, f64), epsilon: f64) -> (f64, f64) {
//     // first, convert p2's coordinates for p1 as origin
//     let (x1, y1) = *p1;
//     let (x2, y2) = *p2;
//     let (x, y) = (x2 - x1, y2 - y1);
//     // rotate so that (p1, p2) ends on x axis
//     let theta = y.atan2(x);
//     let rx = x * theta.cos() - y * theta.sin();
//     let ry = x * theta.sin() + y * theta.cos();
//     assert!(ry.abs() <= std::f64::EPSILON);
//
//     // now imagine a line at an angle alpha.
//     // we want the distance d from (rx, 0) to our line
//     // we have sin(alpha) = d / rx
//     // limiting d to epsilon, we solve
//     // sin(alpha) = e / rx
//     // and get
//     // alpha = arcsin(e/rx)
//     let alpha = (epsilon / rx).asin();
//
//     // now we just need to rotate back
//     let a1 = theta + alpha.abs();
//     let a2 = theta - alpha.abs();
//     assert!(a1 >= a2);
//     (a1, a2)
// }
//
// // this is like ramer douglas peucker algorithm
// // except that we advance from the start without knowing the end.
// // each point we meet constrains the chosen segment's angle
// // a bit more.
// //
// fn simplify(mut points: &[(f64, f64)]) -> Vec<(f64, f64)> {
//     let mut remaining_points = Vec::new();
//     while !points.is_empty() {
//         let (sx, sy) = points.first().unwrap();
//         let i = match points
//             .iter()
//             .enumerate()
//             .map(|(i, (x, y))| todo!("compute angles"))
//             .try_fold(
//                 (0.0f64, std::f64::consts::FRAC_2_PI),
//                 |(amin, amax), (i, (amin2, amax2))| -> Result<(f64, f64), usize> {
//                     let new_amax = amax.min(amax2);
//                     let new_amin = amin.max(amin2);
//                     if new_amin >= new_amax {
//                         Err(i)
//                     } else {
//                         Ok((new_amin, new_amax))
//                     }
//                 },
//             ) {
//             Err(i) => i,
//             Ok(_) => points.len(),
//         };
//         remaining_points.push(points.first().cloned().unwrap());
//         points = &points[i..];
//     }
//     remaining_points
// }

fn extract_prog_dyn_solution(
    points: &[(f64, f64)],
    start: usize,
    end: usize,
    cache: &HashMap<(usize, usize), (Option<usize>, usize)>,
) -> Vec<(f64, f64)> {
    if let Some(choice) = cache.get(&(start, end)).unwrap().0 {
        let mut v1 = extract_prog_dyn_solution(points, start, choice + 1, cache);
        let mut v2 = extract_prog_dyn_solution(points, choice, end, cache);
        v1.pop();
        v1.append(&mut v2);
        v1
    } else {
        vec![points[start], points[end - 1]]
    }
}

fn simplify_prog_dyn(
    points: &[(f64, f64)],
    start: usize,
    end: usize,
    epsilon: f64,
    cache: &mut HashMap<(usize, usize), (Option<usize>, usize)>,
) -> usize {
    if let Some(val) = cache.get(&(start, end)) {
        val.1
    } else {
        let res = if end - start <= 2 {
            assert_eq!(end - start, 2);
            (None, end - start)
        } else {
            let first_point = &points[start];
            let last_point = &points[end - 1];

            if points[(start + 1)..end]
                .iter()
                .map(|p| distance_to_segment(p, first_point, last_point))
                .all(|d| d <= epsilon)
            {
                (None, 2)
            } else {
                // now we test all possible cutting points
                ((start + 1)..(end - 1)) //TODO: take middle min
                    .map(|i| {
                        let v1 = simplify_prog_dyn(points, start, i + 1, epsilon, cache);
                        let v2 = simplify_prog_dyn(points, i, end, epsilon, cache);
                        (Some(i), v1 + v2 - 1)
                    })
                    .min_by_key(|(_, v)| *v)
                    .unwrap()
            }
        };
        cache.insert((start, end), res);
        res.1
    }
}

fn rdp(points: &[(f64, f64)], epsilon: f64) -> Vec<(f64, f64)> {
    if points.len() <= 2 {
        points.iter().copied().collect()
    } else {
        if points.first().unwrap() == points.last().unwrap() {
            let first = points.first().unwrap();
            let index_farthest = points
                .iter()
                .enumerate()
                .skip(1)
                .max_by(|(_, p1), (_, p2)| {
                    squared_distance_between(first, p1)
                        .partial_cmp(&squared_distance_between(first, p2))
                        .unwrap()
                })
                .map(|(i, _)| i)
                .unwrap();

            let start = &points[..(index_farthest + 1)];
            let end = &points[index_farthest..];
            let mut res = rdp(start, epsilon);
            res.pop();
            res.append(&mut rdp(end, epsilon));
            res
        } else {
            let (index_farthest, farthest_distance) = points
                .iter()
                .map(|p| distance_to_segment(p, points.first().unwrap(), points.last().unwrap()))
                .enumerate()
                .max_by(|(_, d1), (_, d2)| {
                    if d1.is_nan() {
                        std::cmp::Ordering::Greater
                    } else {
                        if d2.is_nan() {
                            std::cmp::Ordering::Less
                        } else {
                            d1.partial_cmp(d2).unwrap()
                        }
                    }
                })
                .unwrap();
            if farthest_distance <= epsilon {
                vec![
                    points.first().copied().unwrap(),
                    points.last().copied().unwrap(),
                ]
            } else {
                let start = &points[..(index_farthest + 1)];
                let end = &points[index_farthest..];
                let mut res = rdp(start, epsilon);
                res.pop();
                res.append(&mut rdp(end, epsilon));
                res
            }
        }
    }
}

fn simplify_path(points: &[(f64, f64)], epsilon: f64) -> Vec<(f64, f64)> {
    if points.len() <= 600 {
        optimal_simplification(points, epsilon)
    } else {
        hybrid_simplification(points, epsilon)
    }
}

fn convert_coordinates(points: &[(f64, f64)]) -> (f64, f64, Vec<(i32, i32)>) {
    let xmin = points
        .iter()
        .map(|(x, _)| x)
        .min_by(|x1, x2| x1.partial_cmp(x2).unwrap())
        .unwrap();

    let ymin = points
        .iter()
        .map(|(_, y)| y)
        .min_by(|y1, y2| y1.partial_cmp(y2).unwrap())
        .unwrap();

    // 0.00001 is 1 meter
    // max distance is 1000km
    // so we need at most 10^6
    (
        *xmin,
        *ymin,
        points
            .iter()
            .map(|(x, y)| {
                eprintln!("x {} y {}", x, y);
                let r = (
                    ((*x - xmin) * 100_000.0) as i32,
                    ((*y - ymin) * 100_000.0) as i32,
                );
                eprintln!(
                    "again x {} y {}",
                    xmin + r.0 as f64 / 100_000.0,
                    ymin + r.1 as f64 / 100_000.0
                );
                r
            })
            .collect(),
    )
}

fn compress_coordinates(points: &[(i32, i32)]) -> Vec<(i16, i16)> {
    // we could store the diffs such that
    // diffs are either 8bits or 16bits nums
    // we store how many nums are 16bits
    // then all their indices (compressed with diffs)
    // then all nums as either 8 or 16bits
    let xdiffs = std::iter::once(0).chain(
        points
            .iter()
            .map(|(x, _)| x)
            .tuple_windows()
            .map(|(x1, x2)| (x2 - x1) as i16),
    );

    let ydiffs = std::iter::once(0).chain(
        points
            .iter()
            .map(|(_, y)| y)
            .tuple_windows()
            .map(|(y1, y2)| (y2 - y1) as i16),
    );

    xdiffs.zip(ydiffs).collect()
}

fn save_coordinates<P: AsRef<Path>>(
    path: P,
    //xmin: f64,
    //ymin: f64,
    // points: &[(i32, i32)],
    points: &[(f64, f64)],
) -> std::io::Result<()> {
    let mut writer = BufWriter::new(File::create(path)?);

    eprintln!("saving {} points", points.len());
    // writer.write_all(&xmin.to_be_bytes())?;
    // writer.write_all(&ymin.to_be_bytes())?;
    points
        .iter()
        .flat_map(|(x, y)| [x, y])
        .try_for_each(|c| writer.write_all(&c.to_le_bytes()))?;

    Ok(())
}

fn optimal_simplification(points: &[(f64, f64)], epsilon: f64) -> Vec<(f64, f64)> {
    let mut cache = HashMap::new();
    simplify_prog_dyn(&points, 0, points.len(), epsilon, &mut cache);
    extract_prog_dyn_solution(&points, 0, points.len(), &cache)
}

fn hybrid_simplification(points: &[(f64, f64)], epsilon: f64) -> Vec<(f64, f64)> {
    if points.len() <= 300 {
        optimal_simplification(points, epsilon)
    } else {
        if points.first().unwrap() == points.last().unwrap() {
            let first = points.first().unwrap();
            let index_farthest = points
                .iter()
                .enumerate()
                .skip(1)
                .max_by(|(_, p1), (_, p2)| {
                    squared_distance_between(first, p1)
                        .partial_cmp(&squared_distance_between(first, p2))
                        .unwrap()
                })
                .map(|(i, _)| i)
                .unwrap();

            let start = &points[..(index_farthest + 1)];
            let end = &points[index_farthest..];
            let mut res = hybrid_simplification(start, epsilon);
            res.pop();
            res.append(&mut hybrid_simplification(end, epsilon));
            res
        } else {
            let (index_farthest, farthest_distance) = points
                .iter()
                .map(|p| distance_to_segment(p, points.first().unwrap(), points.last().unwrap()))
                .enumerate()
                .max_by(|(_, d1), (_, d2)| {
                    if d1.is_nan() {
                        std::cmp::Ordering::Greater
                    } else {
                        if d2.is_nan() {
                            std::cmp::Ordering::Less
                        } else {
                            d1.partial_cmp(d2).unwrap()
                        }
                    }
                })
                .unwrap();
            if farthest_distance <= epsilon {
                vec![
                    points.first().copied().unwrap(),
                    points.last().copied().unwrap(),
                ]
            } else {
                let start = &points[..(index_farthest + 1)];
                let end = &points[index_farthest..];
                let mut res = hybrid_simplification(start, epsilon);
                res.pop();
                res.append(&mut hybrid_simplification(end, epsilon));
                res
            }
        }
    }
}

async fn get_openstreetmap_data(points: &[(f64, f64)]) -> HashSet<InterestPoint> {
    let osm = Openstreetmap::new("https://openstreetmap.org", Credentials::None);
    let mut interest_points = HashSet::new();
    let border = 0.0001;
    for (&(x1, y1), &(x2, y2)) in points.iter().tuple_windows() {
        let left = x1.min(x2) - border;
        let right = x1.max(x2) + border;
        let bottom = y1.min(y2) - border;
        let top = y1.max(y2) + border;
        if let Ok(map) = osm
            .map(&BoundingBox {
                bottom,
                left,
                top,
                right,
            })
            .await
        {
            let points = map.nodes.iter().flat_map(|n| {
                n.tags.iter().filter_map(|t| {
                    let latlon = n.lat.and_then(|lat| n.lon.map(|lon| (lat, lon)));
                    latlon.and_then(|(lat, lon)| {
                        Interest::new(&t.k, &t.v).map(|i| InterestPoint {
                            lat,
                            lon,
                            interest: i,
                        })
                    })
                })
            });
            interest_points.extend(points)
        } else {
            eprintln!("failed retrieving osm data")
        }
    }
    interest_points
}

fn save_path<W: Write>(writer: &mut W, p: &[(f64, f64)], stroke: &str) -> std::io::Result<()> {
    write!(
        writer,
        "<polyline fill='none' stroke='{}' stroke-width='0.5%' points='",
        stroke
    )?;
    p.iter()
        .try_for_each(|(x, y)| write!(writer, "{},{} ", x, y))?;
    writeln!(writer, "'/>")?;
    Ok(())
}

fn save_svg<P: AsRef<Path>>(
    filename: P,
    p: &[(f64, f64)],
    rp: &[(f64, f64)],
    interest_points: &HashSet<InterestPoint>,
) -> std::io::Result<()> {
    let mut writer = BufWriter::new(std::fs::File::create(filename)?);
    let (xmin, xmax) = p
        .iter()
        .map(|&(x, _)| x)
        .minmax_by(|a, b| a.partial_cmp(b).unwrap())
        .into_option()
        .unwrap();

    let (ymin, ymax) = p
        .iter()
        .map(|&(_, y)| y)
        .minmax_by(|a, b| a.partial_cmp(b).unwrap())
        .into_option()
        .unwrap();

    writeln!(
        &mut writer,
        "<svg width='800' height='600' viewBox='{} {} {} {}'>",
        xmin,
        ymin,
        xmax - xmin,
        ymax - ymin
    )?;
    write!(
        &mut writer,
        "<rect fill='white' x='{}' y='{}' width='{}' height='{}'/>",
        xmin,
        ymin,
        xmax - xmin,
        ymax - ymin
    )?;

    save_path(&mut writer, &p, "red")?;
    save_path(&mut writer, &rp, "black")?;

    for point in interest_points {
        writeln!(
            &mut writer,
            "<circle cx='{}' cy='{}' fill='{}' r='1%'/>",
            point.lon,
            point.lat,
            point.color(),
        )?;
    }
    writeln!(&mut writer, "</svg>")?;
    Ok(())
}

#[tokio::main]
async fn main() {
    let input_file = std::env::args().nth(1).unwrap_or("m.gpx".to_string());
    eprintln!("input is {}", input_file);
    let p = points(&input_file).collect::<Vec<_>>();
    eprintln!("initialy we have {} points", p.len());
    let start = std::time::Instant::now();
    let rp = simplify_path(&p, 0.00015);
    eprintln!("we took {:?}", start.elapsed());
    eprintln!("we now have {} points", rp.len());
    let start = std::time::Instant::now();
    eprintln!("rdp would have had {}", rdp(&p, 0.00015).len());
    eprintln!("rdp took {:?}", start.elapsed());

    save_coordinates("test.gpc", &rp).unwrap();
    // let i = get_openstreetmap_data(&rp).await;
    let i = HashSet::new();
    save_svg("test.svg", &p, &rp, &i).unwrap();
}
