whiteboard-angular-module
=========================
Include the `whiteboard` module in your project. Inject the `whiteboard` factory to use it.

Add directive `ss-whiteboard` to an element in you HTML. The whiteboard will add itself ontop of this element. The parent element must have position:relative in css.
```shell
<div style="position:relative">
  <video ss-whiteboard ></video>
</div>
```
Now you can draw by yourself.

If you want a collaborative whiteboard you need to do more.

Provide whiteboard with a way to send messages
```shell
whiteboard.setSender(function(message) {
  //send message somehow
});
```

Call this function when you receive a whiteboard message
```shell
whiteboard.onmessage(message);
```
