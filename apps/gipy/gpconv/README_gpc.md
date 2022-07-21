This file documents the .gpc file format.

current version is version 2.

every number is encoded in little endian order.

# header

We start by a header of 5 16bytes unsigned ints.

- the first int is a marker with value 47490
- second int is version of this file format
- third int is **NP** the number of points composing the path
- fourth int is **IP** the number of interest points bordering the path
- fifth int is **LP** the number of interest points as encountered when looping through the path (higher than previous int since some points can be met several times)

# points

We continue with an array of **2 NP**  f64 containing
for each point its x and y coordinate.

# interest points

After that comes the storage for interest points.

- we start by an array of **2 IP** f64 containing
the x and y coordinates of each interest point
- we continue with an **IP** u8 array named **IPOINTS** containing the id of the point's type.
you can see the `Interest` enum in `src/osm.rs` to know what int is what.
for example 0 is a Bakery and 1 is a water point.

Now we need to store the relationship between segments and points.
The idea is that in a display phase we don't want to loop on all interest points
to figure out if they should appear on the map or not.
We'll use the fact that we now the segments we want to display and therefore we should only
need to display the points bordering these segments.

- we store an array **LOOP** of **LP** u16 indices of interest points in **IPOINTS**

while this is a contiguous array it contains points along the path grouped in buckets of 5 points.

to figure out on which segments they are :

- we store an array **STARTS** of **ceil(LP/5)** u16 indices of groups of segments.

Segments are grouped by 3.
This array tells us on which group of segment is the first point of any bucket.

## display algorithm

If we want to display the interest points for the segments between 10 and 16 for example we proceed
as follows:

    * segments are grouped by 3 so instead of segment indices of 10..=16 we will look at group indices 10/3 ..= 16/3 so 3..=5
    * we do a binary search of the highest number below 3 in the **STARTS** array. we call *s* the obtained index
    * we do a binary search of the smallest number above 5 in the **STARTS** array. we call *e* the obtained index
    * we now loop on all buckets between *s* and *e* that is : on all indices *i* in `LOOP[(s*5)..=(e*5)]`
    * display `IPOINTS[i]`
