use itertools::Itertools;
use std::collections::HashMap;
use std::fs::File;
use std::io::{BufReader, Write};
use std::path::Path;

use gpx::read;
use gpx::{Gpx, Track, TrackSegment};

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

// returns distance from point p to line passing through points p1 and p2
// see https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
fn distance_to_line(p: &(f64, f64), p1: &(f64, f64), p2: &(f64, f64)) -> f64 {
    let (x0, y0) = *p;
    let (x1, y1) = *p1;
    let (x2, y2) = *p2;
    let dx = x2 - x1;
    let dy = y2 - y1;
    //TODO: remove this division by computing fake distances
    (dx * (y1 - y0) - dy * (x1 - x0)).abs() / (dx * dx + dy * dy).sqrt()
}

fn acceptable_angles(p1: &(f64, f64), p2: &(f64, f64), epsilon: f64) -> (f64, f64) {
    // first, convert p2's coordinates for p1 as origin
    let (x1, y1) = *p1;
    let (x2, y2) = *p2;
    let (x, y) = (x2 - x1, y2 - y1);
    // rotate so that (p1, p2) ends on x axis
    let theta = y.atan2(x);
    let rx = x * theta.cos() - y * theta.sin();
    let ry = x * theta.sin() + y * theta.cos();
    assert!(ry.abs() <= std::f64::EPSILON);

    // now imagine a line at an angle alpha.
    // we want the distance d from (rx, 0) to our line
    // we have sin(alpha) = d / rx
    // limiting d to epsilon, we solve
    // sin(alpha) = e / rx
    // and get
    // alpha = arcsin(e/rx)
    let alpha = (epsilon / rx).asin();

    // now we just need to rotate back
    let a1 = theta + alpha.abs();
    let a2 = theta - alpha.abs();
    assert!(a1 >= a2);
    (a1, a2)
}

// this is like ramer douglas peucker algorithm
// except that we advance from the start without knowing the end.
// each point we meet constrains the chosen segment's angle
// a bit more.
//
fn simplify(mut points: &[(f64, f64)]) -> Vec<(f64, f64)> {
    let mut remaining_points = Vec::new();
    while !points.is_empty() {
        let (sx, sy) = points.first().unwrap();
        let i = match points
            .iter()
            .enumerate()
            .map(|(i, (x, y))| todo!("compute angles"))
            .try_fold(
                (0.0f64, std::f64::consts::FRAC_2_PI),
                |(amin, amax), (i, (amin2, amax2))| -> Result<(f64, f64), usize> {
                    let new_amax = amax.min(amax2);
                    let new_amin = amin.max(amin2);
                    if new_amin >= new_amax {
                        Err(i)
                    } else {
                        Ok((new_amin, new_amax))
                    }
                },
            ) {
            Err(i) => i,
            Ok(_) => points.len(),
        };
        remaining_points.push(points.first().cloned().unwrap());
        points = &points[i..];
    }
    remaining_points
}

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
                .map(|p| distance_to_line(p, first_point, last_point))
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
                .map(|p| distance_to_line(p, points.first().unwrap(), points.last().unwrap()))
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
    let mut writer = std::io::BufWriter::new(File::create(path)?);

    eprintln!("saving {} points", points.len());
    // writer.write_all(&xmin.to_be_bytes())?;
    // writer.write_all(&ymin.to_be_bytes())?;
    points
        .iter()
        .flat_map(|(x, y)| [x, y])
        .try_for_each(|c| writer.write_all(&c.to_le_bytes()))?;

    Ok(())
}

fn save_json<P: AsRef<Path>>(path: P, points: &[(f64, f64)]) -> std::io::Result<()> {
    let mut writer = std::io::BufWriter::new(File::create(path)?);

    eprintln!("saving {} points", points.len());
    writeln!(&mut writer, "[")?;
    points
        .iter()
        .map(|(x, y)| format!("{{\"lat\": {}, \"lon\":{}}}", y, x))
        .intersperse_with(|| ",\n".to_string())
        .try_for_each(|s| write!(&mut writer, "{}", s))?;
    write!(&mut writer, "]")?;

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
                .map(|p| distance_to_line(p, points.first().unwrap(), points.last().unwrap()))
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

fn main() {
    let input_file = std::env::args().nth(1).unwrap_or("m.gpx".to_string());
    eprintln!("input is {}", input_file);
    let p = points(&input_file).collect::<Vec<_>>();
    eprintln!("initialy we have {} points", p.len());
    //eprintln!("opt is {}", optimal_simplification(&p, 0.0005).len());
    let start = std::time::Instant::now();
    let rp = hybrid_simplification(&p, 0.0005);
    eprintln!("hybrid took {:?}", start.elapsed());
    eprintln!("we now have {} points", rp.len());
    let start = std::time::Instant::now();
    eprintln!("rdp would have had {}", rdp(&p, 0.0005).len());
    eprintln!("rdp took {:?}", start.elapsed());
    // let rp = rdp(&p, 0.001);
    save_coordinates("test.gpc", &rp).unwrap();

    let (xmin, xmax) = rp
        .iter()
        .map(|&(x, _)| x)
        .minmax_by(|a, b| a.partial_cmp(b).unwrap())
        .into_option()
        .unwrap();

    let (ymin, ymax) = rp
        .iter()
        .map(|&(_, y)| y)
        .minmax_by(|a, b| a.partial_cmp(b).unwrap())
        .into_option()
        .unwrap();

    println!(
        "<svg width='800' height='600' viewBox='{} {} {} {}'>",
        xmin,
        ymin,
        xmax - xmin,
        ymax - ymin
    );
    print!(
        "<rect fill='white' x='{}' y='{}' width='{}' height='{}'/>",
        xmin,
        ymin,
        xmax - xmin,
        ymax - ymin
    );
    print!("<polyline fill='none' stroke='black' stroke-width='2%' points='");
    rp.iter().for_each(|(x, y)| print!("{},{} ", x, y));
    println!("'/>");
    println!("</svg>");
}
