use itertools::Itertools;
use std::fs::File;
use std::io::{BufReader, Write};
use std::path::Path;

use gpx::read;
use gpx::{Gpx, Track, TrackSegment};

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
}

// returns distance from point p to line passing through points p1 and p2
// see https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
fn distance_to_line(p: &(f64, f64), p1: &(f64, f64), p2: &(f64, f64)) -> f64 {
    let (x0, y0) = *p;
    let (x1, y1) = *p1;
    let (x2, y2) = *p2;
    let dx = x2 - x1;
    let dy = y2 - y1;
    (dx * (y1 - y0) - dy * (x1 - x0)).abs() / (dx * dx + dy * dy).sqrt()
}

fn rdp(points: &[(f64, f64)], epsilon: f64) -> Vec<(f64, f64)> {
    if points.len() <= 2 {
        points.iter().copied().collect()
    } else {
        let (index_farthest, farthest_distance) = points
            .iter()
            .map(|p| distance_to_line(p, points.first().unwrap(), points.last().unwrap()))
            .enumerate()
            .max_by(|(_, d1), (_, d2)| d1.partial_cmp(d2).unwrap())
            .unwrap();
        if farthest_distance <= epsilon {
            vec![
                points.first().copied().unwrap(),
                points.last().copied().unwrap(),
            ]
        } else {
            let (start, end) = points.split_at(index_farthest);
            let mut res = rdp(start, epsilon);
            res.append(&mut rdp(end, epsilon));
            res
        }
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

fn main() {
    let input_file = std::env::args().nth(1).unwrap_or("m.gpx".to_string());
    eprintln!("input is {}", input_file);
    let p = points(&input_file).collect::<Vec<_>>();
    let rp = rdp(&p, 0.001);
    // let rp = rdp(&p, 0.0001);
    save_coordinates("test.gpc", &rp).unwrap();
    return;
    eprintln!("we go from {} to {}", p.len(), rp.len());

    //TODO: assert we don't wrap around the globe
    let (xmin, ymin, p) = convert_coordinates(&rp);
    // let diffs = compress_coordinates(&p);

    // save_coordinates("test.gpc", xmin, ymin, &p).unwrap();

    // // compress_coordinates(&p);
    // let (xmin, xmax) = p
    //     .iter()
    //     .map(|&(x, _)| x)
    //     .minmax_by(|a, b| a.partial_cmp(b).unwrap())
    //     .into_option()
    //     .unwrap();

    // let (ymin, ymax) = p
    //     .iter()
    //     .map(|&(_, y)| y)
    //     .minmax_by(|a, b| a.partial_cmp(b).unwrap())
    //     .into_option()
    //     .unwrap();

    // println!(
    //     "<svg width='800' height='600' viewBox='{} {} {} {}'>",
    //     xmin,
    //     ymin,
    //     xmax - xmin,
    //     ymax - ymin
    // );
    // print!(
    //     "<rect fill='white' x='{}' y='{}' width='{}' height='{}'/>",
    //     xmin,
    //     ymin,
    //     xmax - xmin,
    //     ymax - ymin
    // );
    // print!("<polyline fill='none' stroke='black' stroke-width='2%' points='");
    // p.iter().for_each(|(x, y)| print!("{},{} ", x, y));
    // println!("'/>");
    // println!("</svg>");
}
