# connections

![image](https://user-images.githubusercontent.com/3255833/194686045-9a828dbd-6d8a-4a98-83cc-e3fc047dbf43.png)

[Visit Project](http://159.223.132.92:3000)

## Intro

In the pursuit of frictionless technology we have abstracted away the underlying infrastructure powering our world. Instant messaging, video calling, online gaming, and realtime streaming all introduce interaction models that attempt to replicate an idea of shared presence similar to how its experienced in the real world.

Through this project, the visitor experiences shared presence while replicating the underlying network topology that makes the experience possible. By interacting with the screen, the user explores ideas of connection through modeling the physical connection of digital devices.

This project takes inspiration from various interactive web experiences, specifically the work of pioneers in this space like Myron Kruger [VIDEOPLACE](https://www.youtube.com/watch?v=d4DUIeXSEpk). Similar to Myron, this project attempts to explore how technology can be a medium for connection by replicating a user's identity and modeling shared space in a way that feels tangible.


## Technical Overview

connections is an interactive experience that displays the current set users currently on the page, and the signals that make their connection possible. By showing the users' ip addresses as well as the corresponding hops between them and the server, one can visualize the map of activity happening behind the scenes.

connections relies on the following technologies:
* node.js + express
* socket.io
* ip-api


## Next Steps

The next step for this project would be to process the network hops between each user and the server by running a `traceroute` command between ip addresses. Once each user's path is traced, use the data to display the path between the server and each user's device- simplifying the graph where devices share nodes. 

once this is complete, i'd like to continue playing with concepts of space and conenction by having cursors interact with each other when they get close together. in addition, illustrating the idea of geographic distance in parallel with 'digital distance' would be very interesting to explore.
