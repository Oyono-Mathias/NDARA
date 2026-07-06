import re

with open('server.ts', 'r') as f:
    content = f.read()

socket_logic = """
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on("typing", (data) => {
      socket.to(data.roomId).emit("typing", { userId: data.userId });
    });

    socket.on("send-message", (data) => {
      socket.to(data.roomId).emit("receive-message", data.message);
    });

    // WebRTC Signaling
    socket.on("call-request", (data) => {
      socket.to(data.roomId).emit("call-request", data);
    });
    socket.on("call-answer", (data) => {
      socket.to(data.roomId).emit("call-answer", data);
    });
    socket.on("call-rejected", (data) => {
      socket.to(data.roomId).emit("call-rejected", data);
    });
    socket.on("call-ended", (data) => {
      socket.to(data.roomId).emit("call-ended", data);
    });
    socket.on("webrtc-offer", (data) => {
      socket.to(data.roomId).emit("webrtc-offer", data);
    });
    socket.on("webrtc-answer", (data) => {
      socket.to(data.roomId).emit("webrtc-answer", data);
    });
    socket.on("webrtc-ice-candidate", (data) => {
      socket.to(data.roomId).emit("webrtc-ice-candidate", data);
    });

    // Message Reactions
    socket.on("message-reaction", (data) => {
      socket.to(data.roomId).emit("message-reaction", data);
    });
"""

# Replace the existing socket.on("join-room") block with the updated one
content = re.sub(
    r'socket\.on\("join-room".*?socket\.on\("send-message", \(data\) => \{.*?\}\);',
    socket_logic.strip(),
    content,
    flags=re.DOTALL
)

with open('server.ts', 'w') as f:
    f.write(content)
