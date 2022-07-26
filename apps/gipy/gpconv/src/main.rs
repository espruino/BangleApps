use itertools::Itertools;
use osmio::ObjId;
use std::collections::{HashMap, HashSet};
use std::fs::File;
use std::io::{BufReader, BufWriter, Write};
use std::path::Path;

use gpx::read;
use gpx::Gpx;

mod osm;
use osm::{parse_osm_data, InterestPoint};

const KEY: u16 = 47490;
const FILE_VERSION: u16 = 3;

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Point {
    x: f64,
    y: f64,
}

impl Eq for Point {}
impl std::hash::Hash for Point {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        unsafe { std::mem::transmute::<f64, u64>(self.x) }.hash(state);
        unsafe { std::mem::transmute::<f64, u64>(self.y) }.hash(state);
    }
}

#[derive(Debug, Clone, Copy)]
pub struct APoint {
    x: f64,
    y: f64,
}

impl PartialEq for APoint {
    fn eq(&self, other: &Self) -> bool {
        (self.x - other.x).abs() < 0.00005 && (self.y - other.y).abs() < 0.00005
    }
}
impl Eq for APoint {}
impl std::hash::Hash for APoint {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        let x = format!("{:.5}", self.x);
        let y = format!("{:.5}", self.y);
        x.hash(state);
        y.hash(state);
    }
}

impl Point {
    fn squared_distance_between(&self, other: &Point) -> f64 {
        let dx = other.x - self.x;
        let dy = other.y - self.y;
        dx * dx + dy * dy
    }
    fn distance_to_segment(&self, v: &Point, w: &Point) -> f64 {
        let l2 = v.squared_distance_between(w);
        if l2 == 0.0 {
            return self.squared_distance_between(v).sqrt();
        }
        // Consider the line extending the segment, parameterized as v + t (w - v).
        // We find projection of point p onto the line.
        // It falls where t = [(p-v) . (w-v)] / |w-v|^2
        // We clamp t from [0,1] to handle points outside the segment vw.
        let x0 = self.x - v.x;
        let y0 = self.y - v.y;
        let x1 = w.x - v.x;
        let y1 = w.y - v.y;
        let dot = x0 * x1 + y0 * y1;
        let t = (dot / l2).min(1.0).max(0.0);

        let proj = Point {
            x: v.x + x1 * t,
            y: v.y + y1 * t,
        };

        proj.squared_distance_between(self).sqrt()
    }
}

fn points(filename: &str) -> Vec<Vec<Point>> {
    let file = File::open(filename).unwrap();
    let reader = BufReader::new(file);

    // read takes any io::Read and gives a Result<Gpx, Error>.
    let mut gpx: Gpx = read(reader).unwrap();
    eprintln!("we have {} tracks", gpx.tracks.len());

    let mut segments = Vec::new();
    let mut current_segment = Vec::new();
    for (p, stop) in gpx
        .tracks
        .pop()
        .unwrap()
        .segments
        .into_iter()
        .flat_map(|segment| segment.points.into_iter())
        .map(|p| {
            let is_commented = p.comment.is_some();
            let (x, y) = p.point().x_y();
            (Point { x, y }, is_commented)
        })
    {
        current_segment.push(p);
        if stop {
            if current_segment.len() > 1 {
                segments.push(current_segment);
                current_segment = vec![p];
            }
        }
    }
    if current_segment.len() > 1 {
        segments.push(current_segment);
    }
    segments
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
    points: &[Point],
    start: usize,
    end: usize,
    cache: &HashMap<(usize, usize), (Option<usize>, usize)>,
) -> Vec<Point> {
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
    points: &[Point],
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
                .map(|p| p.distance_to_segment(first_point, last_point))
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

fn rdp(points: &[Point], epsilon: f64) -> Vec<Point> {
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
                    first
                        .squared_distance_between(p1)
                        .partial_cmp(&first.squared_distance_between(p2))
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
                .map(|p| p.distance_to_segment(points.first().unwrap(), points.last().unwrap()))
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

fn simplify_path(points: &[Point], epsilon: f64) -> Vec<Point> {
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

fn save_gpc<P: AsRef<Path>>(
    path: P,
    points: &[Point],
    waypoints: &HashSet<Point>,
    buckets: &[Bucket],
) -> std::io::Result<()> {
    let mut writer = BufWriter::new(File::create(path)?);

    eprintln!("saving {} points", points.len());

    let mut unique_interest_points = Vec::new();
    let mut correspondance = HashMap::new();
    let interests_on_path = buckets
        .iter()
        .flat_map(|b| &b.points)
        .map(|p| match correspondance.entry(*p) {
            std::collections::hash_map::Entry::Occupied(o) => *o.get(),
            std::collections::hash_map::Entry::Vacant(v) => {
                let index = unique_interest_points.len();
                unique_interest_points.push(*p);
                v.insert(index);
                index
            }
        })
        .collect::<Vec<_>>();

    writer.write_all(&KEY.to_le_bytes())?;
    writer.write_all(&FILE_VERSION.to_le_bytes())?;
    writer.write_all(&(points.len() as u16).to_le_bytes())?;
    writer.write_all(&(unique_interest_points.len() as u16).to_le_bytes())?;
    writer.write_all(&(interests_on_path.len() as u16).to_le_bytes())?;
    points
        .iter()
        .flat_map(|p| [p.x, p.y])
        .try_for_each(|c| writer.write_all(&c.to_le_bytes()))?;

    let mut waypoints_bits = std::iter::repeat(0u8)
        .take(points.len() / 8 + if points.len() % 8 != 0 { 1 } else { 0 })
        .collect::<Vec<u8>>();
    points.iter().enumerate().for_each(|(i, p)| {
        if waypoints.contains(p) {
            waypoints_bits[i / 8] |= 1 << (i % 8)
        }
    });
    waypoints_bits
        .iter()
        .try_for_each(|byte| writer.write_all(&byte.to_le_bytes()))?;

    unique_interest_points
        .iter()
        .flat_map(|p| [p.point.x, p.point.y])
        .try_for_each(|c| writer.write_all(&c.to_le_bytes()))?;

    let counts: HashMap<_, usize> =
        unique_interest_points
            .iter()
            .fold(HashMap::new(), |mut h, p| {
                *h.entry(p.interest).or_default() += 1;
                h
            });
    counts.into_iter().for_each(|(interest, count)| {
        eprintln!("{:?} appears {} times", interest, count);
    });

    unique_interest_points
        .iter()
        .map(|p| p.interest.into())
        .try_for_each(|i: u8| writer.write_all(&i.to_le_bytes()))?;

    interests_on_path
        .iter()
        .map(|i| *i as u16)
        .try_for_each(|i| writer.write_all(&i.to_le_bytes()))?;

    buckets
        .iter()
        .map(|b| b.start as u16)
        .try_for_each(|i| writer.write_all(&i.to_le_bytes()))?;

    Ok(())
}

fn optimal_simplification(points: &[Point], epsilon: f64) -> Vec<Point> {
    let mut cache = HashMap::new();
    simplify_prog_dyn(&points, 0, points.len(), epsilon, &mut cache);
    extract_prog_dyn_solution(&points, 0, points.len(), &cache)
}

fn hybrid_simplification(points: &[Point], epsilon: f64) -> Vec<Point> {
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
                    first
                        .squared_distance_between(p1)
                        .partial_cmp(&first.squared_distance_between(p2))
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
                .map(|p| p.distance_to_segment(points.first().unwrap(), points.last().unwrap()))
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

fn save_path<W: Write>(writer: &mut W, p: &[Point], stroke: &str) -> std::io::Result<()> {
    write!(
        writer,
        "<polyline fill='none' stroke='{}' stroke-width='0.5%' points='",
        stroke
    )?;
    p.iter()
        .try_for_each(|p| write!(writer, "{},{} ", p.x, p.y))?;
    writeln!(writer, "'/>")?;
    Ok(())
}

fn save_svg<'a, P: AsRef<Path>, I: IntoIterator<Item = &'a InterestPoint>>(
    filename: P,
    p: &[Point],
    rp: &[Point],
    interest_points: I,
    waypoints: &HashSet<Point>,
) -> std::io::Result<()> {
    let mut writer = BufWriter::new(std::fs::File::create(filename)?);
    let (xmin, xmax) = p
        .iter()
        .map(|p| p.x)
        .minmax_by(|a, b| a.partial_cmp(b).unwrap())
        .into_option()
        .unwrap();

    let (ymin, ymax) = p
        .iter()
        .map(|p| p.y)
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
            "<circle cx='{}' cy='{}' fill='{}' r='0.8%'/>",
            point.point.x,
            point.point.y,
            point.color(),
        )?;
    }

    waypoints.iter().try_for_each(|p| {
        writeln!(
            &mut writer,
            "<circle cx='{}' cy='{}' fill='black' r='0.5%'/>",
            p.x, p.y,
        )
    })?;

    writeln!(&mut writer, "</svg>")?;
    Ok(())
}

fn detect_waypoints(
    points: &[Point],
    osm_waypoints: &HashMap<APoint, Vec<ObjId>>,
) -> HashSet<Point> {
    points
        .first()
        .into_iter()
        .chain(
            points
                .iter()
                .filter_map(|p: &Point| -> Option<(&Point, &Vec<ObjId>)> {
                    osm_waypoints
                        .get(&APoint { x: p.x, y: p.y })
                        .map(|l| (p, l))
                })
                .tuple_windows()
                .filter_map(|((p1, l1), (p2, _), (p3, l2))| {
                    if l1.iter().all(|e| !l2.contains(e)) {
                        // let x1 = p2.x - p1.x;
                        // let y1 = p2.y - p1.y;
                        // let a1 = y1.atan2(x1);
                        // let x2 = p3.x - p2.x;
                        // let y2 = p3.y - p2.y;
                        // let a2 = y2.atan2(x2);
                        // let a = (a2 - a1).abs();
                        // if a <= std::f64::consts::PI / 4.0 || a >= std::f64::consts::PI * 7.0 / 4.0
                        // {
                        //     None
                        // } else {
                        Some(p2)
                        // }
                    } else {
                        None
                    }
                }),
        )
        .chain(points.last().into_iter())
        .copied()
        .collect::<HashSet<_>>()
}

pub struct Bucket {
    points: Vec<InterestPoint>,
    start: usize,
}

fn position_interests_along_path(
    interests: &mut [InterestPoint],
    path: &[Point],
    d: f64,
    buckets_size: usize, // final points are indexed in buckets
    groups_size: usize,  // how many segments are compacted together
) -> Vec<Bucket> {
    interests.sort_unstable_by(|p1, p2| p1.point.x.partial_cmp(&p2.point.x).unwrap());
    // first compute for each segment a vec containing its nearby points
    let mut positions = Vec::new();
    for segment in path.windows(2) {
        let mut local_interests = Vec::new();
        let x0 = segment[0].x;
        let x1 = segment[1].x;
        let (xmin, xmax) = if x0 <= x1 { (x0, x1) } else { (x1, x0) };
        let i = interests.partition_point(|p| p.point.x < xmin - d);
        let interests = &interests[i..];
        let i = interests.partition_point(|p| p.point.x <= xmax + d);
        let interests = &interests[..i];
        for interest in interests {
            if interest.point.distance_to_segment(&segment[0], &segment[1]) <= d {
                local_interests.push(*interest);
            }
        }
        positions.push(local_interests);
    }
    // fuse points on chunks of consecutive segments together
    let grouped_positions = positions
        .chunks(groups_size)
        .map(|c| c.iter().flatten().unique().copied().collect::<Vec<_>>())
        .collect::<Vec<_>>();
    // now, group the points in buckets
    let chunks = grouped_positions
        .iter()
        .enumerate()
        .flat_map(|(i, points)| points.iter().map(move |p| (i, p)))
        .chunks(buckets_size);
    let mut buckets = Vec::new();
    for bucket_points in &chunks {
        let mut bucket_points = bucket_points.peekable();
        let start = bucket_points.peek().unwrap().0;
        let points = bucket_points.map(|(_, p)| *p).collect();
        buckets.push(Bucket { points, start });
    }
    buckets
}

#[tokio::main]
async fn main() {
    let input_file = std::env::args().nth(1).unwrap_or("m.gpx".to_string());
    let osm_file = std::env::args().nth(2);

    let (mut interests, osm_waypoints) = if let Some(osm) = osm_file {
        parse_osm_data(osm)
    } else {
        (Vec::new(), HashMap::new())
    };

    println!("input is {}", input_file);
    let p = points(&input_file);

    let mut waypoints;
    let mut rp;
    if p.len() == 1 {
        // we don't have any waypoint information
        println!("no waypoint information");
        println!("initially we had {} points", p[0].len());
        waypoints = detect_waypoints(&p[0], &osm_waypoints);

        rp = Vec::new();
        let mut current_segment = Vec::new();
        let mut last = None;
        for p in &p[0] {
            current_segment.push(*p);
            if waypoints.contains(p) {
                if current_segment.len() > 1 {
                    let mut s = simplify_path(&current_segment, 0.00015);
                    rp.append(&mut s);
                    last = rp.pop();
                    current_segment = vec![*p];
                }
            }
        }
        rp.extend(last);
        println!("we now have {} points", rp.len());

        eprintln!("we found {} waypoints", waypoints.len());
    } else {
        println!("we have {} waypoints", p.len() + 1);
        println!(
            "initially we had {} points",
            p.iter().map(|s| s.len()).sum::<usize>() - (p.len() - 1)
        );
        waypoints = HashSet::new();
        rp = Vec::new();
        let mut last = None;
        for segment in &p {
            waypoints.insert(segment.first().copied().unwrap());
            waypoints.insert(segment.last().copied().unwrap());
            let mut s = simplify_path(segment, 0.00015);
            rp.append(&mut s);
            last = rp.pop();
        }
        rp.extend(last);
        println!("we now have {} points", rp.len());
    }

    // let mut interests = parse_osm_data("isere.osm.pbf");
    let buckets = position_interests_along_path(&mut interests, &rp, 0.001, 5, 3);
    // let i = get_openstreetmap_data(&rp).await;
    // let i = HashSet::new();
    let p = p.into_iter().flatten().collect::<Vec<_>>();
    save_svg(
        "test.svg",
        &p,
        &rp,
        buckets.iter().flat_map(|b| &b.points),
        &waypoints,
    )
    .unwrap();

    save_gpc("test.gpc", &rp, &waypoints, &buckets).unwrap();
}
