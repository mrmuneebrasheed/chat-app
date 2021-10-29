const messageForm = document.querySelector("#message-form");
const sendButton = document.querySelector("#send-button");
const messageInput = document.querySelector("#message");
const sendLocation = document.querySelector("#send-location");
const messages = document.querySelector("#messages");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});
const socket = io();

const autoScroll = () => {
    // New Message element
    const newMessage = messages.lastElementChild;

    // Height of the new message
    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

    // Visible Height
    const visibleHeight = messages.offsetHeight;

    // Height of messages container
    const containerHeight = messages.scrollHeight;

    // How far I have scrolled
    const scrollOffset = messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight;
    }
};
socket.on("message", ({ username, text, createdAt }) => {
    const html = Mustache.render(messageTemplate, {
        username,
        text,
        createdAt,
    });
    messages.insertAdjacentHTML("beforeend", html);
    autoScroll();
});
socket.on("locationMessage", ({ username, url, createdAt }) => {
    const html = Mustache.render(locationTemplate, {
        username,
        url: url,
        createdAt,
    });
    messages.insertAdjacentHTML("beforeend", html);
    autoScroll();
});
socket.on("disconnection", ({ text, createdAt }) => {
    console.log(text);
    const html = Mustache.render(messageTemplate, {
        text: text,
        createdAt,
    });
    messages.insertAdjacentHTML("beforeend", html);
});
socket.on("roomData", ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users,
    });
    document.querySelector("#sidebar").innerHTML = html;
});
sendButton.addEventListener("click", (e) => {
    e.preventDefault();
    sendButton.setAttribute("disabled", "disabled");
    const message = messageInput.value;
    socket.emit("sendMessage", message, () => {
        sendButton.removeAttribute("disabled");
        messageInput.value = "";
        messageInput.focus();
    });
});
sendLocation.addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit(
            "sendLocation",
            `https://google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`,
            () => {
                console.log("Location shared successfully");
            }
        );
    });
});
socket.emit("join", { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = "/";
    }
});
