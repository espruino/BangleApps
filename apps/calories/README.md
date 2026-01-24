# Calorie Tracker
Tracks calories using [`MyProfile`](https://banglejs.com/apps/?id=myprofile) data, and a sophisticated formula that takes age, gender, weight, height, heart rate, and steps into account. 
This app also ties in with the [`Health App`](https://banglejs.com/apps/?id=health) for greater integration within the Bangle.js ecosystem.
## Formula
The app uses the algorithm below:
1. Takes into account your weight, gender, and height to calculate your Basal Metabolic Rate, how much energy you expend passively. (breathing, brain activity, digesting food, etc.)
2. Calculates the energy spent via steps by the formula: `1 + (0.0175 * stepsPerMin)`
3. Calculates the energy spent via your BPM by a formula dependent on gender, or an average of the two if no gender is set.

   <b>Male: </b>`(-55.0969+(0.6309 x Heart Rate)+(0.1988 x Weight)+(0.2017 x Age)) / 4.184`

   <b>Female: </b>`(-20.4022+(0.4472 x Heart Rate)+(0.1263 x Weight)+(0.074 x Age))/4.184`

   <b>Not Set (avg): </b>`(-37.7495+(0.5390 x Heart Rate)+(0.0362 x Weight)+(0.1375 x Age))/4.184`

4. Blends the two according to the steps taken (Higher steps per min --> steps weighted more due to potential HRM inaccuracy)
5. Returns the total calories burned in that interval, active calories (calories actively burned), and BMR calories (calories passively burned)

## Health Integration
todo: add details on health integration
## App:
todo: add details on using the app, and its features
## Creator:
[RKBoss6](https://github.com/rkboss6)
