Hacky app that uses Messages app and it's library to push a message that triggers the music controls. It's nearly not an app, and yet it moves.

This app require Messages setting 'Auto-open Music' to be 'Yes'. If it isn't, the app will change it to 'Yes' and let it stay that way.

Making the music controls accessible this way lets one start a music stream on the phone in some situations even though the message app didn't receive a music message from gadgetbridge to begin with. (I think.)

It is suggested to use Messages Music along side the app Quick Launch.

Messages Music v0.02 has been verified to work with Messages v0.41 on Bangle.js 2 fw2v14.

Messages Music should work with forks of the original Messages app. At least as long as functions pushMessage() in the library and showMusicMessage() in app.js hasn't been changed too much.

Messages app is created by Gordon Williams with contributions from [Jeroen Peters](https://github.com/jeroenpeters1986).

The icon used for this app is from [https://icons8.com](https://icons8.com).
