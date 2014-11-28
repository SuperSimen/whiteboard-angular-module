whiteboard-angular-module
=========================

Add directive `ss-whiteboard` to an element in you HTML. The whiteboard will add itself ontop of this element. The parent element must have position:relative in css.
```shell
<div style="position:relative">
  <video ss-whiteboard ></video>
</div>
```


Provide whiteboard with a way to send messages
```shell
whiteboard.setSender(function(message) {
  //send message somehow
})
```

Call this function when you receive a whiteboard message
```shell
whiteboard.onmessage(message)
```
