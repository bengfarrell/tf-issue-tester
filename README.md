Run npm install, and then

`npm run dev`

Issue is in `src/videofacepose.js`

Basically, if you even import Posenet, FaceAPI doesn't work,
presumably because the TFJS engine has been set up in a certain way.

I'm hoping there's a way to reset state between runs
