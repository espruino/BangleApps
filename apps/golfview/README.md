# App Name

This app leverages open source map data to give you a birds eye view of your golf game! See a preview of any hole as well as your realtime distance to the green and position on the hole.

![hole3](screenshot.png)

## Usage

Select your course of interest upon loading this app.

## Contributions

The performance of this app depends on the accuracy and consistency of user-submitted maps. 
    <ul>
      <li>See official mapping guidelines <a
          href="https://wiki.openstreetmap.org/wiki/Tag:leisure%3Dgolf_course">here</a>.</li>
      <li>All holes and features must be within the target course's area.</li>
      <li>Supported features are greens, fairways, tees, bunkers, water hazards and holes.</li>
      <li>All features for a given hole should have the "ref" tag with the hole number as value. Shared features should
        list ref values separated by ';'. <a href="https://www.openstreetmap.org/way/36896320">example</a>.</li>
      <li>There must be 18 holes and they must have the following tags: handicap, par, ref, dist</li>
      <li>For any mapping assistance or issues, please file in the <a
          href="https://github.com/espruino/BangleApps/issues/new?assignees=&labels=bug&template=bangle-bug-report-custom-form.yaml&title=[golfview]+Short+description+of+bug">official
          repo</a></li>
    </ul>
    <a href="https://www.openstreetmap.org/way/25447898">Example Course</a>
## Controls

Swipe to change holes and tap to see a green closeup.

## Requests/Creator

[Jason Dekarske](https://github.com/jdekarske)