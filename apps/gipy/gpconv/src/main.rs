use gpconv::convert_gpx_files;

fn main() {
    let input_file = std::env::args().nth(1).unwrap_or("m.gpx".to_string());
    let mut interests;

    #[cfg(feature = "osm")]
    {
        let osm_file = std::env::args().nth(2);
        let mut interests = if let Some(osm) = osm_file {
            interests = parse_osm_data(osm);
        } else {
            Vec::new()
        };
    }
    #[cfg(not(feature = "osm"))]
    {
        interests = Vec::new()
    }

    convert_gpx_files(&input_file, &mut interests);
}
